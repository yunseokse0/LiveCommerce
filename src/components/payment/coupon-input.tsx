'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tag, X, CheckCircle, AlertCircle } from 'lucide-react';
import type { CouponValidation } from '@/types/promotion';

interface CouponInputProps {
  onApply: (validation: CouponValidation) => void;
  onRemove: () => void;
  appliedCoupon?: CouponValidation;
  purchaseAmount: number;
  productIds?: string[];
}

export function CouponInput({
  onApply,
  onRemove,
  appliedCoupon,
  purchaseAmount,
  productIds,
}: CouponInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) {
      setError('쿠폰 코드를 입력하세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          purchaseAmount,
          productIds,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.isValid) {
        setError(data.error || '쿠폰을 사용할 수 없습니다.');
        return;
      }

      onApply(data);
      setCode('');
    } catch (error) {
      console.error('쿠폰 검증 오류:', error);
      setError('쿠폰 검증 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (appliedCoupon?.isValid) {
    return (
      <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              쿠폰 적용됨
            </span>
            {appliedCoupon.discountAmount && (
              <span className="text-sm text-zinc-300">
                {appliedCoupon.discountAmount.toLocaleString()}원 할인
              </span>
            )}
          </div>
          <Button
            onClick={onRemove}
            size="sm"
            variant="ghost"
            className="h-auto p-1 text-zinc-400 hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">쿠폰 코드</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApply();
              }
            }}
            placeholder="쿠폰 코드 입력"
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 font-mono text-sm"
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          size="sm"
          variant="outline"
        >
          적용
        </Button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
