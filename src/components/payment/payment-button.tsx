'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import type { CartItem } from '@/types/product';
import { useAuth } from '@/store/auth';
import { CoinPaymentOption } from './coin-payment-option';
import { TossPaymentWidget } from './toss-payment-widget';

interface PaymentButtonProps {
  items: CartItem[];
  shippingAddress?: string;
  couponCode?: string;
  appliedPromotions?: {
    bogo?: string[];
    freeGifts?: string[];
  };
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
  useTossPayments?: boolean; // 토스페이먼츠 사용 여부
}

/**
 * 결제 버튼 컴포넌트
 * 토스페이먼츠 연동 준비
 */
export function PaymentButton({
  items,
  shippingAddress,
  couponCode,
  appliedPromotions,
  onSuccess,
  onError,
  useTossPayments = false,
}: PaymentButtonProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [coinPaymentAmount, setCoinPaymentAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [orderData, setOrderData] = useState<any>(null);
  const [showPaymentWidget, setShowPaymentWidget] = useState(false);

  // 최종 금액 계산
  const calculateFinalAmount = () => {
    const totalAmount = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    // 쿠폰 할인은 서버에서 계산되므로 여기서는 코인 결제만 차감
    return Math.max(0, totalAmount - coinPaymentAmount);
  };

  useEffect(() => {
    setFinalAmount(calculateFinalAmount());
  }, [items, coinPaymentAmount]);

  const handlePayment = async () => {
    if (!user) {
      onError?.('로그인이 필요합니다.');
      return;
    }

    if (items.length === 0) {
      onError?.('주문할 상품이 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      // 주문 생성
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress,
          couponCode,
          appliedPromotions,
          coinPaymentAmount: coinPaymentAmount > 0 ? coinPaymentAmount : undefined,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('주문 생성 실패');
      }

      const orderData = await orderResponse.json();

      // 결제 요청
      const paymentResponse = await fetch('/api/payment/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData.payment),
      });

      if (!paymentResponse.ok) {
        throw new Error('결제 요청 실패');
      }

      const paymentData = await paymentResponse.json();

      // 토스페이먼츠 사용 시
      if (useTossPayments && process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY) {
        setOrderData(orderData);
        setShowPaymentWidget(true);
        return;
      }

      // 모의 결제 프로세스 (토스페이먼츠 미사용 시)
      if (paymentData.paymentUrl) {
        // 모의 결제 완료
        const completeResponse = await fetch('/api/payment/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.order.id,
            paymentKey: 'mock-payment-key',
            amount: orderData.order.total_amount,
            paymentMethod: 'card',
          }),
        });

        if (completeResponse.ok) {
          onSuccess?.(orderData.order.id);
        } else {
          throw new Error('결제 완료 처리 실패');
        }
      }
    } catch (error: any) {
      console.error('결제 오류:', error);
      onError?.(error.message || '결제를 처리할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 토스페이먼츠 결제 위젯이 표시되는 경우
  if (showPaymentWidget && orderData) {
    return (
      <div className="space-y-4">
        <TossPaymentWidget
          orderId={orderData.order.id}
          amount={finalAmount}
          orderName={`주문 #${orderData.order.id.substring(0, 8)}`}
          customerName={user?.name}
          onSuccess={async (paymentKey) => {
            // 결제 승인
            const completeResponse = await fetch('/api/payment/complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.order.id,
                paymentKey,
                amount: finalAmount,
                paymentMethod: 'card',
              }),
            });

            if (completeResponse.ok) {
              onSuccess?.(orderData.order.id);
            } else {
              const errorData = await completeResponse.json();
              onError?.(errorData.error || '결제 완료 처리 실패');
            }
          }}
          onError={(error) => {
            setShowPaymentWidget(false);
            onError?.(error);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 코인 결제 옵션 */}
      {user && items.length > 0 && (
        <CoinPaymentOption
          finalAmount={calculateFinalAmount()}
          onCoinAmountChange={setCoinPaymentAmount}
        />
      )}

      {/* 결제 버튼 */}
      <Button
        onClick={handlePayment}
        disabled={isLoading || !user || items.length === 0}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            결제 처리 중...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            {coinPaymentAmount > 0
              ? `${finalAmount.toLocaleString()}원 결제하기`
              : '결제하기'}
          </>
        )}
      </Button>
    </div>
  );
}
