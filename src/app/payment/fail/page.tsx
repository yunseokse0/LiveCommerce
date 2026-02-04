'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">결제에 실패했습니다</h1>
            {errorMessage && (
              <p className="text-zinc-400 mb-2">{errorMessage}</p>
            )}
            {errorCode && (
              <p className="text-sm text-zinc-500 mb-6">에러 코드: {errorCode}</p>
            )}
            <p className="text-zinc-400 mb-8">
              다시 시도하거나 다른 결제 수단을 이용해주세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                다시 시도
              </Button>
              <Button onClick={() => router.push('/cart')}>
                장바구니로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
