import { NextResponse } from 'next/server';
import { getLiveList } from '@/lib/actions/get-live-list';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET() {
  try {
    const liveList = await getLiveList();

    return NextResponse.json({
      success: true,
      liveList,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('라이브 목록 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '라이브 목록을 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
