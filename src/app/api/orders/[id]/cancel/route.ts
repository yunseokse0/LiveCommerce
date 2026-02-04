import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 주문 취소 요청
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, reason, refundItems } = body;
    const orderId = params.id;

    if (!userId || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID와 취소 사유가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 주문 조회
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
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
    let refundAmount = 0;
    if (refundItems && refundItems.length > 0) {
      // 부분 취소
      for (const item of refundItems) {
        const orderItem = order.items.find((i: any) => i.id === item.orderItemId);
        if (orderItem) {
          refundAmount += orderItem.price * item.quantity;
        }
      }
    } else {
      // 전체 취소
      refundAmount = order.final_amount || order.total_amount;
    }

    // 환불 기록 생성
    const { data: refund, error: refundError } = await supabaseAdmin
      .from('order_refunds')
      .insert({
        order_id: orderId,
        user_id: userId,
        type: 'cancel',
        reason,
        status: order.status === 'paid' ? 'pending' : 'approved', // 결제 전이면 즉시 승인
        refund_amount: refundAmount,
        refund_method: order.payment_method || 'card',
      })
      .select()
      .single();

    if (refundError) {
      console.error('환불 기록 생성 오류:', refundError);
      return NextResponse.json(
        {
          success: false,
          error: '취소 요청을 처리할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 환불 상품 목록 추가
    if (refundItems && refundItems.length > 0) {
      const refundItemsData = refundItems.map((item: any) => ({
        refund_id: refund.id,
        order_item_id: item.orderItemId,
        quantity: item.quantity,
        refund_price: item.refundPrice,
      }));

      await supabaseAdmin.from('refund_items').insert(refundItemsData);
    }

    // 주문 상태 업데이트
    const newStatus = order.status === 'paid' ? 'cancelled' : 'cancelled';
    await supabaseAdmin
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    // 코인 환불 (코인으로 결제한 경우)
    if (order.coin_payment_amount && order.coin_payment_amount > 0) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/coins/earn`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              orderId,
              purchaseAmount: order.coin_payment_amount,
              description: `주문 취소 환불 (주문 #${orderId.substring(0, 8)})`,
            }),
          }
        );
      } catch (error) {
        console.error('코인 환불 오류:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: '주문이 취소되었습니다.',
      refund,
    });
  } catch (error) {
    console.error('주문 취소 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '주문 취소를 처리할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
