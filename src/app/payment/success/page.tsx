'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { ReviewForm } from '@/components/reviews/review-form';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderIdParam = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (orderIdParam) {
      setOrderId(orderIdParam);

      // 로컬 스토리지에서 주문 상태 업데이트
      try {
        const { updateLocalOrder } = require('@/data/mock-orders-storage');
        updateLocalOrder(orderIdParam, {
          status: 'paid',
          paymentMethod: 'card',
        });
      } catch (error) {
        console.log('로컬 주문 업데이트 오류:', error);
      }

      // 결제 승인 처리 시도 (실패해도 무시)
      if (paymentKey && amount) {
        fetch('/api/payment/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderIdParam,
            paymentKey,
            amount: parseInt(amount),
            paymentMethod: 'card',
          }),
        }).catch((error) => {
          console.log('결제 승인 API 호출 실패, 로컬 처리만 사용:', error);
        });
      }
    }
  }, [searchParams]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">결제가 완료되었습니다!</h1>
            <p className="text-zinc-400 mb-6">
              주문이 성공적으로 처리되었습니다.
            </p>
            {orderId && (
              <p className="text-sm text-zinc-500 mb-8">
                주문번호: {orderId.substring(0, 8)}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button onClick={() => router.push('/orders')} variant="outline">
                주문 내역 보기
              </Button>
              <Button onClick={() => router.push('/')}>
                쇼핑 계속하기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* 리뷰 작성 유도 */}
            {orderId && (
              <div className="mt-12 pt-8 border-t border-zinc-800/80">
                <h2 className="text-xl font-semibold mb-4">구매하신 상품에 리뷰를 작성해보세요!</h2>
                <p className="text-sm text-zinc-400 mb-6">
                  리뷰를 작성하시면 다른 고객들에게 도움이 됩니다.
                </p>
                {!showReviewForm ? (
                  <Button
                    onClick={() => {
                      // 주문 정보에서 첫 번째 상품 ID 가져오기
                      fetch(`/api/orders/${orderId}`)
                        .then((res) => res.json())
                        .then((data) => {
                          if (data.success && data.order?.items?.[0]?.productId) {
                            setSelectedProductId(data.order.items[0].productId);
                            setShowReviewForm(true);
                          }
                        });
                    }}
                    variant="outline"
                  >
                    리뷰 작성하기
                  </Button>
                ) : selectedProductId ? (
                  <div className="max-w-2xl mx-auto">
                    <ReviewForm
                      productId={selectedProductId}
                      orderId={orderId}
                      onSuccess={() => {
                        setShowReviewForm(false);
                        alert('리뷰가 작성되었습니다. 감사합니다!');
                      }}
                      onCancel={() => setShowReviewForm(false)}
                    />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
