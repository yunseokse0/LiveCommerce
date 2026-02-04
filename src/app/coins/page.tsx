'use client';

import { Header } from '@/components/header';
import { CoinBalance } from '@/components/coin/coin-balance';
import { CoinPriceChart } from '@/components/coin/coin-price-chart';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useState, useEffect } from 'react';
import { History, ArrowUp, ArrowDown } from 'lucide-react';
import type { CoinTransaction } from '@/types/coin';
import { useAuth } from '@/store/auth';
import { mockCoinTransactions } from '@/data/mock-coins';

export default function CoinsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      // 먼저 MOCK 데이터 사용
      const userTransactions = mockCoinTransactions
        .filter((tx) => tx.userId === user.id)
        .slice(0, 20);
      
      setTransactions(userTransactions);
      setIsLoading(false);

      // API 호출 시도 (백그라운드)
      try {
        const response = await fetch(`/api/coins/transactions?userId=${user.id}&limit=20`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.transactions && data.transactions.length > 0) {
            setTransactions(data.transactions);
          }
        }
      } catch (error) {
        console.error('거래 내역 조회 오류, MOCK 데이터 사용:', error);
        // 에러 발생 시 MOCK 데이터 유지
      }
    };

    fetchTransactions();
  }, [user]);

  return (
    <ProtectedRoute requireAuth={false}>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">코인 관리</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* 코인 잔액 */}
            <div className="lg:col-span-2">
              <CoinBalance />
            </div>

            {/* 코인 시세 */}
            <div>
              <CoinPriceChart />
            </div>
          </div>

          {/* 거래 내역 */}
          <div className="rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <History className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-semibold">거래 내역</h2>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-zinc-400">로딩 중...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">거래 내역이 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 sm:p-4 rounded-lg border border-zinc-800/80 bg-secondary/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {tx.type === 'earn' ? (
                            <ArrowUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-400" />
                          )}
                          <span className="font-medium">{tx.description}</span>
                        </div>
                        <div className="text-xs sm:text-sm text-zinc-500">
                          {new Date(tx.createdAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            tx.type === 'earn' ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {tx.type === 'earn' ? '+' : '-'}
                          {Math.abs(tx.amount).toLocaleString()}코인
                        </div>
                        <div className="text-xs text-zinc-500">
                          잔액: {tx.balance.toLocaleString()}코인
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
