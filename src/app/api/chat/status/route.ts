import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 채팅 서버 상태 조회
 */
export async function GET() {
  try {
    const chatServerUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL || 'http://localhost:3001';
    
    // 채팅 서버 연결 테스트 (선택사항)
    // 실제로는 채팅 서버에서 상태를 제공하는 API가 있어야 함
    
    return NextResponse.json({
      success: true,
      chatServerUrl,
      status: 'running',
    });
  } catch (error) {
    console.error('채팅 서버 상태 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '채팅 서버 상태를 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
