import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 활성 스트림 상태 조회
 */
export async function GET(request: Request) {
  try {
    // 동적 import로 서버 모듈 로드 (빌드 오류 방지)
    const { getActiveStreams, isStreamActive } = await import('@/lib/streaming/server');
    
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');

    if (streamId) {
      // 특정 스트림 상태 조회
      const isActive = isStreamActive(streamId);
      return NextResponse.json({
        success: true,
        streamId,
        isActive,
      });
    }

    // 모든 활성 스트림 조회
    const activeStreams = getActiveStreams();
    return NextResponse.json({
      success: true,
      activeStreams,
      count: activeStreams.length,
    });
  } catch (error) {
    console.error('스트림 상태 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '스트림 상태를 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
