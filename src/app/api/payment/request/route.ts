import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 결제 요청 (토스페이먼츠 연동)
 * 
 * 실제 토스페이먼츠 연동을 위해서는:
 * 1. TOSS_PAYMENTS_SECRET_KEY 환경 변수 설정 필요
 * 2. @tosspayments/payment-sdk 패키지 설치 필요
 * 3. 클라이언트에서 결제 위젯 호출
 * 
 * 현재는 모의 결제 프로세스로 구현되어 있습니다.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, orderName, customerName, successUrl, failUrl } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        {
          success: false,
          error: '주문 ID와 금액이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 실제 토스페이먼츠 연동 예시 (주석 처리)
    /*
    const tossPayments = require('@tosspayments/payment-sdk');
    const clientKey = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY;
    const secretKey = process.env.TOSS_PAYMENTS_SECRET_KEY;

    const payment = await tossPayments.confirmPayment({
      paymentKey: body.paymentKey,
      orderId: orderId,
      amount: amount,
    });
    */

    // 현재는 모의 결제 URL 반환
    // 실제 구현 시 토스페이먼츠 결제 위젯 URL 반환
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const paymentUrl = `${baseUrl}/payment/process?orderId=${orderId}&amount=${amount}`;

    return NextResponse.json({
      success: true,
      paymentUrl,
      // 실제 토스페이먼츠 연동 시 반환할 데이터:
      // clientKey: process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY,
      // orderId,
      // amount,
      // orderName: orderName || '주문',
      // customerName: customerName || '고객',
      // successUrl: successUrl || `${baseUrl}/payment/success`,
      // failUrl: failUrl || `${baseUrl}/payment/fail`,
    });
  } catch (error) {
    console.error('결제 요청 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '결제 요청을 처리할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 결제 완료 콜백 처리
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    const amount = searchParams.get('amount');

    if (!orderId || !paymentKey) {
      return NextResponse.json(
        {
          success: false,
          error: '주문 ID와 결제 키가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // TODO: 토스페이먼츠 결제 승인 API 호출
    // 실제 구현 시:
    // 1. 토스페이먼츠 서버에 결제 승인 요청
    // 2. 승인 성공 시 주문 상태를 'paid'로 변경
    // 3. 재고 차감

    return NextResponse.json({
      success: true,
      message: '결제가 완료되었습니다.',
      orderId,
    });
  } catch (error) {
    console.error('결제 콜백 처리 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '결제를 처리할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
