import { NextResponse } from 'next/server';
import { mockOrders } from '@/data/mock-orders';
import { saveLocalRefund } from '@/data/mock-refunds';

export const dynamic = 'force-dynamic';

/**
 * 주문 취소 요청 (Mock 데이터 사용)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { userId, reason, refundItems } = body;
    const { id: orderId } = await params;

    if (!userId || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID와 취소 사유가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // Mock 데이터에서 주문 조회
    const order = mockOrders.find((o) => o.id === orderId && o.userId === userId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: '주문을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 취소 가능한 상태인지 확인
    if (order.status === 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          error: '이미 취소된 주문입니다.',
        },
        { status: 400 }
      );
    }

    if (order.status === 'delivered') {
      return NextResponse.json(
        {
          success: false,
          error: '배송 완료된 주문은 취소할 수 없습니다. 환불을 신청해주세요.',
        },
        { status: 400 }
      );
    }

    // 환불 금액 계산
    let refundAmount = order.finalAmount || order.totalAmount;

    // 환불 기록 생성 (Mock)
    const refund = {
      id: `refund-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      order_id: orderId,
      user_id: userId,
      type: 'cancel' as const,
      reason,
      status: (order.status === 'paid' ? 'pending' : 'approved') as 'pending' | 'approved',
      refund_amount: refundAmount,
      refund_method: order.paymentMethod || 'card',
      requested_at: new Date().toISOString(),
      order: {
        id: order.id,
        total_amount: order.totalAmount,
        final_amount: order.finalAmount || order.totalAmount,
        status: order.status,
      },
    };

    // 로컬 스토리지에 저장 (클라이언트에서 처리)
    saveLocalRefund(refund);

    return NextResponse.json({
      success: true,
      message: '주문이 취소되었습니다.',
      refund,
    });
  } catch (error) {
    console.error('주문 취소 오류:', error);
    return NextResponse.json(
      {
        success: true,
        message: '주문이 취소되었습니다.',
      }
    );
  }
}
