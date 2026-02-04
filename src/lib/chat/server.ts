/**
 * Socket.io 채팅 서버
 * 별도 프로세스로 실행
 */

import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  timestamp: number;
  streamId: string;
}

interface UserInfo {
  userId: string;
  nickname: string;
  avatarUrl?: string;
}

// 스트림별 채팅방 관리
const chatRooms = new Map<string, Set<string>>(); // streamId -> Set<socketId>
const userSessions = new Map<string, UserInfo>(); // socketId -> UserInfo
const messageHistory = new Map<string, ChatMessage[]>(); // streamId -> ChatMessage[]

// 최대 메시지 히스토리 (최근 100개)
const MAX_MESSAGE_HISTORY = 100;

/**
 * Socket.io 서버 시작
 */
export function startChatServer(port: number = 3001) {
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
    socket.on('join-room', async (data: { streamId: string; user: UserInfo }) => {
      const { streamId, user } = data;

      if (!streamId || !user || !user.userId) {
        socket.emit('error', { message: '스트림 ID와 사용자 정보가 필요합니다.' });
        return;
      }

      // 사용자 정보 저장
      userSessions.set(socket.id, user);

      // 채팅방에 추가
      if (!chatRooms.has(streamId)) {
        chatRooms.set(streamId, new Set());
      }
      chatRooms.get(streamId)!.add(socket.id);

      // 룸에 조인
      socket.join(streamId);

      // 메시지 히스토리 전송
      const history = messageHistory.get(streamId) || [];
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
    socket.on('send-message', (data: { streamId: string; message: string }) => {
      const { streamId, message } = data;
      const user = userSessions.get(socket.id);

      if (!user || !streamId || !message?.trim()) {
        socket.emit('error', { message: '유효하지 않은 메시지입니다.' });
        return;
      }

      // 메시지 생성
      const chatMessage: ChatMessage = {
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
      const history = messageHistory.get(streamId)!;
      history.push(chatMessage);

      // 최대 개수 제한
      if (history.length > MAX_MESSAGE_HISTORY) {
        history.shift();
      }

      // 룸의 모든 클라이언트에 메시지 전송
      io.to(streamId).emit('new-message', chatMessage);

      console.log(`[Chat] ${user.nickname} sent message to stream ${streamId}`);
    });

    // 채팅방 퇴장
    socket.on('leave-room', (streamId: string) => {
      if (streamId && chatRooms.has(streamId)) {
        chatRooms.get(streamId)!.delete(socket.id);
        
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
  });

  return { io, httpServer };
}

/**
 * 활성 채팅방 목록 조회
 */
export function getActiveRooms(): string[] {
  return Array.from(chatRooms.keys());
}

/**
 * 채팅방 참여자 수 조회
 */
export function getRoomUserCount(streamId: string): number {
  return chatRooms.get(streamId)?.size || 0;
}
