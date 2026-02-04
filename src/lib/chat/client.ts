/**
 * Socket.io 클라이언트 유틸리티
 */

import { io, Socket } from 'socket.io-client';
import type { User } from '@/types/auth';

const SOCKET_URL = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:3001';

// 전역 Socket 인스턴스 (싱글톤)
let socketInstance: Socket | null = null;

/**
 * Socket.io 클라이언트 연결
 */
export function connectChatServer(user: User | null): Socket | null {
  // 이미 연결되어 있으면 기존 인스턴스 반환
  if (socketInstance?.connected) {
    return socketInstance;
  }

  // 사용자가 없으면 연결하지 않음
  if (!user) {
    return null;
  }

  // 새 연결 생성
  socketInstance = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socketInstance.on('connect', () => {
    console.log('[Chat] Socket.io 연결 성공');
  });

  socketInstance.on('disconnect', () => {
    console.log('[Chat] Socket.io 연결 해제');
  });

  socketInstance.on('error', (error) => {
    console.error('[Chat] Socket.io 오류:', error);
  });

  return socketInstance;
}

/**
 * Socket.io 연결 해제
 */
export function disconnectChatServer() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/**
 * 현재 Socket 인스턴스 가져오기
 */
export function getSocketInstance(): Socket | null {
  return socketInstance;
}
