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

  // MOCK 모드 체크
  const useMockMode = process.env.NEXT_PUBLIC_CHAT_MOCK_MODE === 'true' || 
                      (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_CHAT_SERVER_URL);
  
  if (useMockMode) {
    console.log('[Chat] MOCK 모드 활성화 (Socket.io 서버 없이 작동)');
    return null; // MOCK 모드에서는 Socket 인스턴스 반환하지 않음
  }

  // 새 연결 생성
  try {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 5000, // 5초 타임아웃
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

    socketInstance.on('connect_error', (error) => {
      console.warn('[Chat] Socket.io 연결 오류:', error.message);
    });

    return socketInstance;
  } catch (error) {
    console.error('[Chat] Socket.io 연결 실패:', error);
    return null;
  }
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
