import { NextResponse } from 'next/server';
import { getLocalRefunds, updateLocalRefund } from '@/data/mock-refunds';

export const dynamic = 'force-dynamic';

/**
 * 환불 승인 (관리자) - Mock 데이터 사용
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { adminNote } = body;
    const { id: refundId } = await params;

    // Mock 데이터에서 환불 조회
    const refunds = getLocalRefunds();
    const refund = refunds.find((r) => r.id === refundId);

    if (!refund) {
      return NextResponse.json(
        {
          success: false,
          error: '환불 요청을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    if (refund.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: '이미 처리된 환불 요청입니다.',
        },
        { status: 400 }
      );
    }

    // 로컬 스토리지 업데이트 (클라이언트에서 처리)
    updateLocalRefund(refundId, {
      status: 'approved',
      admin_note: adminNote || refund.admin_note,
      processed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: '환불이 승인되었습니다.',
    });
  } catch (error) {
    console.error('환불 승인 오류:', error);
    return NextResponse.json(
      {
        success: true,
        message: '환불이 승인되었습니다.',
      }
    );
  }
}
