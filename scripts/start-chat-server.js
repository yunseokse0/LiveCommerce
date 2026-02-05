/**
 * Socket.io 채팅 서버 시작 스크립트
 * 별도 프로세스로 실행하여 Next.js와 독립적으로 동작
 * 
 * 사용법: node scripts/start-chat-server.js
 * 또는: npm run dev:chat
 */

const { Server: SocketIOServer } = require('socket.io');
const { createServer } = require('http');

// 스트림별 채팅방 관리
const chatRooms = new Map(); // streamId -> Set<socketId>
const userSessions = new Map(); // socketId -> UserInfo
const messageHistory = new Map(); // streamId -> ChatMessage[]
const streamOwners = new Map(); // streamId -> creatorUserId (스트림 소유자)
const bannedUsers = new Map(); // streamId -> Set<userId> (차단된 사용자)

// 최대 메시지 히스토리 (최근 100개)
const MAX_MESSAGE_HISTORY = 100;

/**
 * Socket.io 서버 시작
 */
function startChatServer(port = 3001) {
  const httpServer = createServer();
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Chat] 클라이언트 연결: ${socket.id}`);

    // 채팅방 입장
    socket.on('join-room', async (data) => {
      const { streamId, user, creatorId } = data;

      if (!streamId || !user || !user.userId) {
        socket.emit('error', { message: '스트림 ID와 사용자 정보가 필요합니다.' });
        return;
      }

      // 차단된 사용자 확인
      const banned = bannedUsers.get(streamId);
      if (banned && banned.has(user.userId)) {
        socket.emit('error', { message: '이 방송에서 채팅이 차단되었습니다.' });
        return;
      }

      // 스트림 소유자 저장 (크리에이터가 입장한 경우)
      if (creatorId && user.userId === creatorId) {
        streamOwners.set(streamId, creatorId);
      }

      // 사용자 정보 저장
      userSessions.set(socket.id, user);

      // 채팅방에 추가
      if (!chatRooms.has(streamId)) {
        chatRooms.set(streamId, new Set());
      }
      chatRooms.get(streamId).add(socket.id);

      // 룸에 조인
      socket.join(streamId);

      // 메시지 히스토리 전송 (삭제된 메시지 제외)
      const history = (messageHistory.get(streamId) || []).filter(msg => msg.message !== '[삭제된 메시지]');
      socket.emit('message-history', history);

      // 입장 알림 (선택사항)
      socket.to(streamId).emit('user-joined', {
        userId: user.userId,
        nickname: user.nickname,
        timestamp: Date.now(),
      });

      console.log(`[Chat] ${user.nickname} (${user.userId}) joined stream ${streamId}`);
    });

    // 메시지 전송
    socket.on('send-message', (data) => {
      const { streamId, message } = data;
      const user = userSessions.get(socket.id);

      if (!user || !streamId || !message?.trim()) {
        socket.emit('error', { message: '유효하지 않은 메시지입니다.' });
        return;
      }

      // 차단된 사용자 확인
      const banned = bannedUsers.get(streamId);
      if (banned && banned.has(user.userId)) {
        socket.emit('error', { message: '이 방송에서 채팅이 차단되었습니다.' });
        return;
      }

      // 메시지 생성
      const chatMessage = {
        id: `${Date.now()}-${socket.id}`,
        userId: user.userId,
        nickname: user.nickname,
        message: message.trim(),
        timestamp: Date.now(),
        streamId,
      };

      // 메시지 히스토리에 추가
      if (!messageHistory.has(streamId)) {
        messageHistory.set(streamId, []);
      }
      const history = messageHistory.get(streamId);
      history.push(chatMessage);

      // 최대 개수 제한
      if (history.length > MAX_MESSAGE_HISTORY) {
        history.shift();
      }

      // 룸의 모든 클라이언트에 메시지 전송
      io.to(streamId).emit('new-message', chatMessage);

      console.log(`[Chat] ${user.nickname} sent message to stream ${streamId}`);
    });

    // 메시지 삭제 (크리에이터만 가능)
    socket.on('delete-message', (data) => {
      const { streamId, messageId } = data;
      const user = userSessions.get(socket.id);

      if (!user || !streamId || !messageId) {
        socket.emit('error', { message: '유효하지 않은 요청입니다.' });
        return;
      }

      // 스트림 소유자 확인
      const ownerId = streamOwners.get(streamId);
      if (ownerId !== user.userId) {
        socket.emit('error', { message: '메시지를 삭제할 권한이 없습니다.' });
        return;
      }

      // 메시지 히스토리에서 찾아서 삭제 표시
      const history = messageHistory.get(streamId);
      if (history) {
        const message = history.find(msg => msg.id === messageId);
        if (message) {
          message.message = '[삭제된 메시지]';
          
          // 모든 클라이언트에 삭제 알림 전송
          io.to(streamId).emit('message-deleted', { messageId, streamId });
          console.log(`[Chat] Message ${messageId} deleted by ${user.nickname} in stream ${streamId}`);
        }
      }
    });

    // 사용자 차단 (크리에이터만 가능)
    socket.on('ban-user', (data) => {
      const { streamId, userId } = data;
      const user = userSessions.get(socket.id);

      if (!user || !streamId || !userId) {
        socket.emit('error', { message: '유효하지 않은 요청입니다.' });
        return;
      }

      // 스트림 소유자 확인
      const ownerId = streamOwners.get(streamId);
      if (ownerId !== user.userId) {
        socket.emit('error', { message: '사용자를 차단할 권한이 없습니다.' });
        return;
      }

      // 차단 목록에 추가
      if (!bannedUsers.has(streamId)) {
        bannedUsers.set(streamId, new Set());
      }
      bannedUsers.get(streamId).add(userId);

      // 해당 사용자의 모든 소켓 연결에서 채팅방 퇴장 처리
      chatRooms.get(streamId)?.forEach((socketId) => {
        const sessionUser = userSessions.get(socketId);
        if (sessionUser && sessionUser.userId === userId) {
          const socketToDisconnect = io.sockets.sockets.get(socketId);
          if (socketToDisconnect) {
            socketToDisconnect.emit('banned', { streamId });
            socketToDisconnect.leave(streamId);
            chatRooms.get(streamId)?.delete(socketId);
          }
        }
      });

      // 모든 클라이언트에 차단 알림 전송
      io.to(streamId).emit('user-banned', { userId, streamId });
      console.log(`[Chat] User ${userId} banned by ${user.nickname} in stream ${streamId}`);
    });

    // 채팅방 퇴장
    socket.on('leave-room', (streamId) => {
      if (streamId && chatRooms.has(streamId)) {
        chatRooms.get(streamId).delete(socket.id);
        
        const user = userSessions.get(socket.id);
        if (user) {
          socket.to(streamId).emit('user-left', {
            userId: user.userId,
            nickname: user.nickname,
            timestamp: Date.now(),
          });
        }
      }
      socket.leave(streamId);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      const user = userSessions.get(socket.id);
      
      // 모든 채팅방에서 제거
      chatRooms.forEach((sockets, streamId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (user) {
            socket.to(streamId).emit('user-left', {
              userId: user.userId,
              nickname: user.nickname,
              timestamp: Date.now(),
            });
          }
        }
      });

      userSessions.delete(socket.id);
      console.log(`[Chat] 클라이언트 연결 해제: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`[Chat] ✅ Socket.io 서버 시작: http://localhost:${port}`);
    console.log(`[Chat] 📡 WebSocket 연결 대기 중...`);
  });

  return { io, httpServer };
}

// 서버 시작
const port = process.env.CHAT_SERVER_PORT || 3001;
const { io, httpServer } = startChatServer(parseInt(port));

// 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n[Chat] 서버 종료 중...');
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[Chat] 서버 종료 중...');
  httpServer.close(() => {
    process.exit(0);
  });
});
