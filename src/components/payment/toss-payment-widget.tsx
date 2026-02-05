'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { initializeTossPayments } from '@/lib/toss-payments';

interface TossPaymentWidgetProps {
  orderId: string;
  amount: number;
  orderName: string;
  customerName?: string;
  onSuccess: (paymentKey: string) => void;
  onError: (error: string) => void;
}

/**
 * 토스페이먼츠 결제 위젯 컴포넌트
 */
export function TossPaymentWidget({
  orderId,
  amount,
  orderName,
  customerName,
  onSuccess,
  onError,
}: TossPaymentWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const initWidget = async () => {
      try {
        const paymentWidget = await initializeTossPayments();
        
        if (!paymentWidget || !mounted) {
          return;
        }

        widgetRef.current = paymentWidget;
        setIsWidgetReady(true);
      } catch (error: any) {
        console.error('결제 위젯 초기화 오류:', error);
        if (mounted) {
          onError(error.message || '결제 위젯을 초기화할 수 없습니다.');
        }
      }
    };

    initWidget();

    return () => {
      mounted = false;
    };
  }, [onError]);

  const handlePayment = async () => {
    if (!widgetRef.current) {
      onError('결제 위젯이 준비되지 않았습니다.');
      return;
    }

    setIsLoading(true);

    try {
      // v1 SDK: requestPayment 메서드 사용
      await widgetRef.current.requestPayment('카드', {
        amount,
        orderId,
        orderName,
        customerName: customerName || '고객',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error: any) {
      console.error('결제 요청 오류:', error);
      setIsLoading(false);
      onError(error.message || '결제를 처리할 수 없습니다.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 결제 버튼 */}
      <Button
        onClick={handlePayment}
        disabled={isLoading || !isWidgetReady}
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
            {amount.toLocaleString()}원 결제하기
          </>
        )}
      </Button>
    </div>
  );
}
