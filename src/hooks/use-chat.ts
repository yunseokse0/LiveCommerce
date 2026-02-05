'use client';

import { useEffect, useRef, useState } from 'react';
import { connectChatServer, disconnectChatServer, getSocketInstance } from '@/lib/chat/client';
import { useAuth } from '@/store/auth';
import type { Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  timestamp: number;
  streamId: string;
}

interface UseChatOptions {
  streamId: string;
  autoConnect?: boolean;
  creatorId?: string; // 크리에이터 ID (권한 확인용)
}

// MOCK 모드: Socket.io 서버 없이도 작동
const USE_MOCK_MODE = process.env.NEXT_PUBLIC_CHAT_MOCK_MODE === 'true' || 
                      typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_CHAT_SERVER_URL;

// MOCK 메시지 저장소 (스트림별)
const mockMessageStore = new Map<string, ChatMessage[]>();

// MOCK 메시지 생성 함수
function createMockMessage(streamId: string, userId: string, nickname: string, message: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    nickname,
    message: message.trim(),
    timestamp: Date.now(),
    streamId,
  };
}

/**
 * 실시간 채팅 훅 (MOCK 모드 지원)
 */
export function useChat({ streamId, autoConnect = true, creatorId }: UseChatOptions) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const mockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // MOCK 모드: Socket.io 서버 없이 작동
  useEffect(() => {
    if (USE_MOCK_MODE && autoConnect && user && streamId) {
      setIsConnected(true);

      // 기존 메시지 로드
      const existingMessages = mockMessageStore.get(streamId) || [];
      setMessages(existingMessages);

      // MOCK 메시지 자동 생성 (선택사항 - 데모용)
      if (existingMessages.length === 0) {
        const welcomeMessages: ChatMessage[] = [
          createMockMessage(streamId, 'system', '시스템', '채팅에 오신 것을 환영합니다!'),
          createMockMessage(streamId, 'user-1', '방문자1', '안녕하세요! 좋은 방송이네요 👍'),
          createMockMessage(streamId, 'user-2', '방문자2', '특가 상품 언제 나오나요?'),
        ];
        mockMessageStore.set(streamId, welcomeMessages);
        setMessages(welcomeMessages);
      }

      return () => {
        if (mockIntervalRef.current) {
          clearInterval(mockIntervalRef.current);
        }
      };
    }
  }, [streamId, user?.id, autoConnect, creatorId]);

  // 실제 Socket.io 연결
  useEffect(() => {
    if (USE_MOCK_MODE || !autoConnect || !user || !streamId) return;

    // Socket 연결 시도
    const socket = connectChatServer(user);
    if (!socket) {
      // 연결 실패 시 MOCK 모드로 전환
      console.warn('[Chat] Socket.io 서버 연결 실패, MOCK 모드로 전환');
      setIsConnected(true);
      const existingMessages = mockMessageStore.get(streamId) || [];
      setMessages(existingMessages);
      return;
    }

    socketRef.current = socket;

    // 연결 상태 업데이트
    socket.on('connect', () => {
      setIsConnected(true);

      // 채팅방 입장
      socket.emit('join-room', {
        streamId,
        user: {
          userId: user.id,
          nickname: user.name || '익명',
          avatarUrl: user.avatarUrl,
        },
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      // 연결 오류 시 MOCK 모드로 전환
      console.warn('[Chat] Socket.io 연결 오류, MOCK 모드로 전환');
      setIsConnected(true);
      const existingMessages = mockMessageStore.get(streamId) || [];
      setMessages(existingMessages);
    });

    // 메시지 히스토리 수신
    socket.on('message-history', (history: ChatMessage[]) => {
      setMessages(history);
      mockMessageStore.set(streamId, history);
    });

    // 새 메시지 수신
    socket.on('new-message', (message: ChatMessage) => {
      setMessages((prev) => {
        const newMessages = [...prev, message];
        mockMessageStore.set(streamId, newMessages);
        return newMessages;
      });
    });

    // 메시지 삭제 알림 수신
    socket.on('message-deleted', (data: { messageId: string; streamId: string }) => {
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, message: '[삭제된 메시지]' } : msg
        );
        mockMessageStore.set(streamId, updated);
        return updated;
      });
    });

    // 사용자 차단 알림 수신
    socket.on('user-banned', (data: { userId: string; streamId: string }) => {
      // 차단된 사용자의 메시지 제거 또는 표시
      setMessages((prev) => {
        const updated = prev.filter((msg) => msg.userId !== data.userId);
        mockMessageStore.set(streamId, updated);
        return updated;
      });
    });

    // 자신이 차단되었을 때
    socket.on('banned', () => {
      setIsConnected(false);
      setMessages([]);
    });

    // 정리 함수
    return () => {
      if (socket && socket.connected) {
        socket.emit('leave-room', streamId);
      }
    };
  }, [streamId, user?.id, autoConnect]);

  // 메시지 전송
  const sendMessage = (message: string) => {
    if (!message.trim() || !user) return false;

    // MOCK 모드
    if (USE_MOCK_MODE || !socketRef.current || !socketRef.current.connected) {
      const newMessage = createMockMessage(
        streamId,
        user.id,
        user.name || '익명',
        message
      );
      
      setMessages((prev) => {
        const newMessages = [...prev, newMessage];
        // 최대 100개 메시지 유지
        const limitedMessages = newMessages.slice(-100);
        mockMessageStore.set(streamId, limitedMessages);
        return limitedMessages;
      });

      // MOCK 응답 메시지 (선택사항)
      setTimeout(() => {
        const responses = [
          '좋은 질문이네요!',
          '감사합니다!',
          '더 많은 정보가 필요하시면 방송을 계속 시청해주세요!',
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const responseMessage = createMockMessage(
          streamId,
          'system',
          '시스템',
          randomResponse
        );
        setMessages((prev) => {
          const newMessages = [...prev, responseMessage];
          const limitedMessages = newMessages.slice(-100);
          mockMessageStore.set(streamId, limitedMessages);
          return limitedMessages;
        });
      }, 1000);

      return true;
    }

    // 실제 Socket.io 전송
    const socket = socketRef.current || getSocketInstance();
    if (!socket || !socket.connected) {
      return false;
    }

    socket.emit('send-message', {
      streamId,
      message: message.trim(),
    });

    return true;
  };

  // 연결 해제
  const disconnect = () => {
    if (USE_MOCK_MODE) {
      setIsConnected(false);
      return;
    }

    const socket = socketRef.current || getSocketInstance();
    if (socket && socket.connected) {
      socket.emit('leave-room', streamId);
    }
  };

  // 메시지 삭제 함수 (크리에이터만 사용 가능)
  const deleteMessage = (messageId: string) => {
    if (!user || !creatorId || user.id !== creatorId) {
      return false;
    }

    // MOCK 모드
    if (USE_MOCK_MODE || !socketRef.current || !socketRef.current.connected) {
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === messageId ? { ...msg, message: '[삭제된 메시지]' } : msg
        );
        mockMessageStore.set(streamId, updated);
        return updated;
      });
      return true;
    }

    // 실제 Socket.io 전송
    const socket = socketRef.current || getSocketInstance();
    if (!socket || !socket.connected) {
      return false;
    }

    socket.emit('delete-message', {
      streamId,
      messageId,
    });

    return true;
  };

  // 사용자 차단 함수 (크리에이터만 사용 가능)
  const banUser = (userId: string) => {
    if (!user || !creatorId || user.id !== creatorId) {
      return false;
    }

    // MOCK 모드
    if (USE_MOCK_MODE || !socketRef.current || !socketRef.current.connected) {
      setMessages((prev) => {
        const updated = prev.filter((msg) => msg.userId !== userId);
        mockMessageStore.set(streamId, updated);
        return updated;
      });
      return true;
    }

    // 실제 Socket.io 전송
    const socket = socketRef.current || getSocketInstance();
    if (!socket || !socket.connected) {
      return false;
    }

    socket.emit('ban-user', {
      streamId,
      userId,
    });

    return true;
  };

  // 구매 알림 추가 함수
  const addPurchaseNotification = (buyerName: string, productName?: string) => {
    const notificationMessage = productName
      ? `${buyerName}님이 "${productName}"을(를) 방금 구매하셨습니다! 🛒`
      : `${buyerName}님이 방금 구매하셨습니다! 🛒`;

    const purchaseMessage = createMockMessage(
      streamId,
      'system',
      '시스템',
      notificationMessage
    );

    setMessages((prev) => {
      const newMessages = [...prev, purchaseMessage];
      const limitedMessages = newMessages.slice(-100);
      mockMessageStore.set(streamId, limitedMessages);
      return limitedMessages;
    });

    // Socket.io로도 전송 (실제 서버가 있는 경우)
    if (!USE_MOCK_MODE && socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('purchase-notification', {
        streamId,
        buyerName,
        productName,
      });
    }
  };

  // 크리에이터 여부 확인
  const isCreator = user && creatorId ? user.id === creatorId : false;

  return {
    messages,
    isConnected: USE_MOCK_MODE ? true : isConnected,
    sendMessage,
    disconnect,
    addPurchaseNotification,
    deleteMessage,
    banUser,
    isCreator,
  };
}
