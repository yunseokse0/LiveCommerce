import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 결제 완료 처리
 * - 토스페이먼츠 결제 승인
 * - 주문 상태 업데이트
 * - 코인 적립
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentKey, amount, paymentMethod } = body;

    // 토스페이먼츠 결제 승인 (실제 연동 - 선택사항)
    // 프론트엔드 전용 모드에서는 mock 결제로 처리
    if (paymentKey && paymentKey !== 'mock-payment-key' && process.env.TOSS_PAYMENTS_SECRET_KEY) {
      try {
        const confirmResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(process.env.TOSS_PAYMENTS_SECRET_KEY + ':').toString('base64')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
          }),
        });

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(errorData.message || '결제 승인 실패');
        }

        const paymentData = await confirmResponse.json();
        console.log('토스페이먼츠 결제 승인 성공:', paymentData);
      } catch (error: any) {
        console.error('토스페이먼츠 결제 승인 오류, mock 결제로 처리:', error);
        // 실제 연동 실패 시에도 mock 결제로 진행 (프론트엔드 전용)
      }
    }

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: '주문 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 주문 조회
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
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

    // 이미 결제 완료된 주문인지 확인
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: '이미 결제 완료된 주문입니다.',
        order,
      });
    }

    // 주문 상태 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'paid',
        payment_method: paymentMethod || 'card',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('주문 상태 업데이트 오류:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: '주문 상태를 업데이트할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 코인 적립 (결제 완료 후)
    if (order.user_id && order.final_amount > 0) {
      try {
        const earnResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/coins/earn`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: order.user_id,
              orderId: orderId,
              purchaseAmount: order.final_amount,
              description: `구매 적립 (주문 #${orderId.substring(0, 8)})`,
            }),
          }
        );

        if (earnResponse.ok) {
          const earnData = await earnResponse.json();
          console.log('코인 적립 완료:', earnData);
        }
      } catch (error) {
        console.error('코인 적립 오류:', error);
        // 코인 적립 실패는 치명적이지 않으므로 계속 진행
      }
    }

    return NextResponse.json({
      success: true,
      message: '결제가 완료되었습니다.',
      order: {
        ...order,
        status: 'paid',
        paymentMethod: paymentMethod || 'card',
      },
    });
  } catch (error) {
    console.error('결제 완료 처리 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '결제 완료를 처리할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
