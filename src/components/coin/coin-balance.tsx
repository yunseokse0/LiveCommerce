'use client';

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, History } from 'lucide-react';
import { useAuth } from '@/store/auth';
import type { Coin, CoinPrice } from '@/types/coin';

interface CoinBalanceProps {
  className?: string;
}

export function CoinBalance({ className }: CoinBalanceProps) {
  const { user } = useAuth();
  const [coin, setCoin] = useState<Coin | null>(null);
  const [coinPrice, setCoinPrice] = useState<CoinPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 코인 잔액 조회
        const balanceResponse = await fetch(`/api/coins/balance?userId=${user.id}`);
        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          setCoin(balanceData.coin);
        }

        // 코인 시세 조회
        const priceResponse = await fetch('/api/coins/price');
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          setCoinPrice(priceData.currentPrice);
        }
      } catch (error) {
        console.error('코인 정보 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  const coinValue = coinPrice && coin
    ? (coin.balance * coinPrice.price).toLocaleString()
    : '0';

  return (
    <div className={className}>
      <div className="p-4 rounded-lg border border-zinc-800/80 bg-card/50">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold">내 코인</h3>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-zinc-400">로딩 중...</div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-400">
                  {coin?.balance.toLocaleString() || 0}
                </span>
                <span className="text-sm text-zinc-400">코인</span>
              </div>
              {coinPrice && (
                <div className="text-sm text-zinc-500 mt-1">
                  ≈ {coinValue}원
                </div>
              )}
            </div>

            {coinPrice && (
              <div className="pt-3 border-t border-zinc-800/80">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-zinc-400">현재 시세:</span>
                  <span className="font-semibold text-amber-400">
                    1코인 = {coinPrice.price.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-800/80">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-zinc-400">총 적립</div>
                  <div className="font-semibold text-green-400">
                    {coin?.totalEarned.toLocaleString() || 0}코인
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400">총 사용</div>
                  <div className="font-semibold text-red-400">
                    {coin?.totalSpent.toLocaleString() || 0}코인
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
