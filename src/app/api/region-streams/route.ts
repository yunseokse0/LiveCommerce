import { NextResponse } from 'next/server';
import { getRegionStreams } from '@/lib/actions/get-region-streams';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');

    if (!regionId) {
      return NextResponse.json(
        {
          success: false,
          error: '지역 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    const streams = await getRegionStreams(regionId);

    return NextResponse.json({
      success: true,
      streams,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('지역 방송 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '지역 방송을 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
