'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { CoinPrice } from '@/types/coin';

interface CoinPriceChartProps {
  className?: string;
}

export function CoinPriceChart({ className }: CoinPriceChartProps) {
  const [currentPrice, setCurrentPrice] = useState<CoinPrice | null>(null);
  const [priceHistory, setPriceHistory] = useState<CoinPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/coins/price');
        if (response.ok) {
          const data = await response.json();
          setCurrentPrice(data.currentPrice);
          setPriceHistory(data.history || []);
        }
      } catch (error) {
        console.error('코인 시세 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrice();
  }, []);

  if (isLoading) {
    return (
      <div className={className}>
        <div className="p-4 rounded-lg border border-zinc-800/80 bg-card/50">
          <div className="text-center py-4 text-zinc-400">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (!currentPrice) {
    return (
      <div className={className}>
        <div className="p-4 rounded-lg border border-zinc-800/80 bg-card/50">
          <div className="text-center py-4 text-zinc-400">시세 정보가 없습니다.</div>
        </div>
      </div>
    );
  }

  // 최근 7일 시세 변화 계산
  const recentPrices = priceHistory.slice(0, 7).reverse();
  const previousPrice = recentPrices.length > 1 ? recentPrices[recentPrices.length - 2] : null;
  const priceChange = previousPrice
    ? currentPrice.price - previousPrice.price
    : 0;
  const priceChangePercent = previousPrice && previousPrice.price > 0
    ? ((priceChange / previousPrice.price) * 100).toFixed(2)
    : '0.00';

  return (
    <div className={className}>
      <div className="p-4 rounded-lg border border-zinc-800/80 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold">코인 시세</h3>
        </div>

        <div className="space-y-4">
          {/* 현재 시세 */}
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-amber-400">
                {currentPrice.price.toLocaleString()}
              </span>
              <span className="text-sm text-zinc-400">원</span>
            </div>
            <div className="text-xs text-zinc-500">
              1코인 기준
            </div>
          </div>

          {/* 시세 변화 */}
          {previousPrice && (
            <div className="flex items-center gap-2">
              {priceChange > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : priceChange < 0 ? (
                <TrendingDown className="w-4 h-4 text-red-400" />
              ) : (
                <Minus className="w-4 h-4 text-zinc-400" />
              )}
              <span
                className={`text-sm font-semibold ${
                  priceChange > 0
                    ? 'text-green-400'
                    : priceChange < 0
                    ? 'text-red-400'
                    : 'text-zinc-400'
                }`}
              >
                {priceChange > 0 ? '+' : ''}
                {priceChange.toLocaleString()}원 ({priceChangePercent}%)
              </span>
            </div>
          )}

          {/* 시세 이력 */}
          {recentPrices.length > 1 && (
            <div className="pt-4 border-t border-zinc-800/80">
              <div className="text-sm font-medium mb-2 text-zinc-400">최근 시세</div>
              <div className="space-y-2">
                {recentPrices.slice(-5).reverse().map((price, index) => (
                  <div
                    key={price.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-zinc-400">
                      {new Date(price.effectiveFrom).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="font-semibold text-amber-400">
                      {price.price.toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
