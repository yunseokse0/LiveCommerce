import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 결제 요청 (토스페이먼츠 연동)
 * 실제 구현 시 토스페이먼츠 SDK 사용
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

    // TODO: 토스페이먼츠 결제 요청
    // 현재는 모의 결제 URL 반환
    const paymentUrl = `/payment/process?orderId=${orderId}&amount=${amount}`;

    return NextResponse.json({
      success: true,
      paymentUrl,
      // 토스페이먼츠 연동 시:
      // - 결제 위젯 URL 반환
      // - 또는 클라이언트에서 직접 토스페이먼츠 SDK 호출
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
