import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * RTMP 스트림 키 생성/조회
 * 크리에이터가 방송을 시작할 때 사용할 RTMP 스트림 키를 생성합니다.
 */
export async function POST(request: Request) {
  try {
    const { creatorId } = await request.json();

    if (!creatorId) {
      return NextResponse.json(
        {
          success: false,
          error: '크리에이터 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 고유한 스트림 키 생성
    const streamKey = crypto.randomBytes(32).toString('hex');
    const streamId = `stream-${Date.now()}-${creatorId}`;

    // DB에 스트림 정보 저장 (선택사항)
    // TODO: streams 테이블에 저장

    return NextResponse.json({
      success: true,
      streamKey,
      streamId,
      rtmpUrl: `rtmp://localhost:1935/live/${streamKey}`,
      hlsUrl: `/streams/hls/${streamId}/index.m3u8`,
    });
  } catch (error) {
    console.error('RTMP 키 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'RTMP 키를 생성할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * RTMP 스트림 키 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json(
        {
          success: false,
          error: '크리에이터 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // TODO: DB에서 크리에이터의 활성 스트림 키 조회

    return NextResponse.json({
      success: true,
      message: '스트림 키 조회 기능은 구현 예정입니다.',
    });
  } catch (error) {
    console.error('RTMP 키 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'RTMP 키를 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
