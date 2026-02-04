'use client';

import { useState, useEffect } from 'react';
import { Coins, AlertCircle } from 'lucide-react';
import { useAuth } from '@/store/auth';
import type { Coin, CoinPrice } from '@/types/coin';
import { coinToWon, wonToCoin, hasEnoughCoins } from '@/lib/utils/coin';

interface CoinPaymentOptionProps {
  finalAmount: number; // 최종 결제 금액
  onCoinAmountChange: (amount: number) => void;
  className?: string;
}

export function CoinPaymentOption({
  finalAmount,
  onCoinAmountChange,
  className,
}: CoinPaymentOptionProps) {
  const { user } = useAuth();
  const [coin, setCoin] = useState<Coin | null>(null);
  const [coinPrice, setCoinPrice] = useState<CoinPrice | null>(null);
  const [coinPaymentAmount, setCoinPaymentAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [balanceRes, priceRes] = await Promise.all([
          fetch(`/api/coins/balance?userId=${user.id}`),
          fetch('/api/coins/price'),
        ]);

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setCoin(balanceData.coin);
        }

        if (priceRes.ok) {
          const priceData = await priceRes.json();
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

  useEffect(() => {
    if (coinPrice && coinPaymentAmount > 0) {
      const wonAmount = coinToWon(coinPaymentAmount, coinPrice);
      onCoinAmountChange(wonAmount);
    } else {
      onCoinAmountChange(0);
    }
  }, [coinPaymentAmount, coinPrice, onCoinAmountChange]);

  if (!user || isLoading) return null;

  if (!coin || !coinPrice) {
    return (
      <div className={className}>
        <div className="p-4 rounded-lg border border-zinc-800/80 bg-card/50">
          <div className="flex items-center gap-2 text-zinc-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">코인 정보를 불러올 수 없습니다.</span>
          </div>
        </div>
      </div>
    );
  }

  const maxCoinPayment = coin.balance;
  const maxWonPayment = coinToWon(maxCoinPayment, coinPrice);
  const availableCoinPayment = Math.min(maxCoinPayment, wonToCoin(finalAmount, coinPrice));

  const handleCoinAmountChange = (coins: number) => {
    const clampedCoins = Math.max(0, Math.min(coins, availableCoinPayment));
    setCoinPaymentAmount(clampedCoins);
  };

  const handleMaxCoin = () => {
    setCoinPaymentAmount(availableCoinPayment);
  };

  const coinPaymentWon = coinToWon(coinPaymentAmount, coinPrice);
  const remainingAmount = finalAmount - coinPaymentWon;

  return (
    <div className={className}>
      <div className="p-4 rounded-lg border border-zinc-800/80 bg-card/50">
        <div className="flex items-center gap-2 mb-4">
          <Coins className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold">코인 결제</h3>
        </div>

        <div className="space-y-4">
          {/* 코인 잔액 */}
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-zinc-400">보유 코인</span>
              <span className="font-semibold text-amber-400">
                {coin.balance.toLocaleString()}코인
              </span>
            </div>
            <div className="text-xs text-zinc-500">
              ≈ {maxWonPayment.toLocaleString()}원
            </div>
          </div>

          {/* 코인 결제 금액 입력 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              사용할 코인 수
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={coinPaymentAmount}
                onChange={(e) => handleCoinAmountChange(parseInt(e.target.value) || 0)}
                min="0"
                max={availableCoinPayment}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
              />
              <button
                onClick={handleMaxCoin}
                className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm font-medium"
              >
                최대
              </button>
            </div>
            <div className="mt-2 text-xs text-zinc-500">
              최대 {availableCoinPayment.toLocaleString()}코인 사용 가능
            </div>
          </div>

          {/* 결제 정보 */}
          {coinPaymentAmount > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">코인 결제</span>
                  <span className="font-semibold text-amber-400">
                    -{coinPaymentWon.toLocaleString()}원
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
                  <span className="font-medium">최종 결제 금액</span>
                  <span className="text-lg font-bold text-amber-400">
                    {remainingAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 잔액 부족 경고 */}
          {!hasEnoughCoins(coin.balance, wonToCoin(finalAmount, coinPrice)) && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span>코인 잔액이 부족합니다. 일부만 코인으로 결제할 수 있습니다.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
