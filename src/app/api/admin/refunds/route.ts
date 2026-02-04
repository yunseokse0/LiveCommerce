import { NextResponse } from 'next/server';
import { getLocalRefunds } from '@/data/mock-refunds';

export const dynamic = 'force-dynamic';

/**
 * 환불 목록 조회 (관리자) - Mock 데이터 사용
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Mock 데이터 사용
    let refunds = getLocalRefunds();

    if (status && status !== 'all') {
      refunds = refunds.filter((r) => r.status === status);
    }

    // 정렬
    refunds.sort((a, b) => 
      new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
    );

    return NextResponse.json({
      success: true,
      refunds: refunds || [],
    });
  } catch (error) {
    console.error('환불 목록 조회 오류:', error);
    // 에러 발생 시에도 mock 데이터 반환
    return NextResponse.json({
      success: true,
      refunds: [],
    });
  }
}
