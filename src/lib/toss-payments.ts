/**
 * 토스페이먼츠 클라이언트 설정
 * 
 * 환경 변수:
 * - NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY: 토스페이먼츠 클라이언트 키
 */

export const TOSS_PAYMENTS_CLIENT_KEY = process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY || '';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  orderName: string;
  customerName?: string;
  successUrl: string;
  failUrl: string;
}

export interface PaymentConfirm {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/**
 * 토스페이먼츠 결제 위젯 초기화
 */
export async function initializeTossPayments() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!TOSS_PAYMENTS_CLIENT_KEY) {
    console.warn('⚠️ 토스페이먼츠 클라이언트 키가 설정되지 않았습니다.');
    return null;
  }

  try {
    // 동적 import로 클라이언트 사이드에서만 로드
    const { loadTossPayments } = await import('@tosspayments/payment-sdk');
    return await loadTossPayments(TOSS_PAYMENTS_CLIENT_KEY);
  } catch (error) {
    console.error('토스페이먼츠 초기화 오류:', error);
    return null;
  }
}
