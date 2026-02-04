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
}

/**
 * 실시간 채팅 훅
 */
export function useChat({ streamId, autoConnect = true }: UseChatOptions) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!autoConnect || !user || !streamId) return;

    // Socket 연결
    const socket = connectChatServer(user);
    if (!socket) return;

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

    // 메시지 히스토리 수신
    socket.on('message-history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    // 새 메시지 수신
    socket.on('new-message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
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
    const socket = socketRef.current || getSocketInstance();
    if (!socket || !socket.connected || !message.trim()) {
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
    const socket = socketRef.current || getSocketInstance();
    if (socket && socket.connected) {
      socket.emit('leave-room', streamId);
    }
  };

  return {
    messages,
    isConnected,
    sendMessage,
    disconnect,
  };
}
