import { NextResponse } from 'next/server';
import { getLiveList } from '@/lib/actions/get-live-list';
import { mockLiveStreams } from '@/data/mock-live-streams';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET() {
  try {
    const liveList = await getLiveList();

    return NextResponse.json({
      success: true,
      liveList: liveList.length > 0 ? liveList : mockLiveStreams,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('라이브 목록 API 오류, MOCK 데이터 사용:', error);
    
    // 에러 발생 시에도 MOCK 데이터 반환
    return NextResponse.json({
      success: true,
      liveList: mockLiveStreams,
      timestamp: new Date().toISOString(),
      message: '에러 발생으로 MOCK 데이터를 사용합니다.',
    });
  }
}
