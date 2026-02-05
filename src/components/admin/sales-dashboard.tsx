'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, CreditCard, Coins } from 'lucide-react';
import { mockOrders } from '@/data/mock-orders';
import { mockProducts } from '@/data/mock-products';
import type { Order } from '@/types/product';

interface SalesStats {
  totalRevenue: number;
  dailyRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  paymentMethodBreakdown: {
    card: number;
    coin: number;
    other: number;
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    salesCount: number;
    revenue: number;
  }>;
  revenueTrend: Array<{
    date: string;
    revenue: number;
  }>;
}

export function SalesDashboard() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    calculateStats();
  }, [period]);

  const calculateStats = () => {
    setIsLoading(true);
    
    // Mock 데이터에서 통계 계산
    const now = new Date();
    const periodStart = new Date();
    
    if (period === 'daily') {
      periodStart.setDate(now.getDate() - 1);
    } else if (period === 'weekly') {
      periodStart.setDate(now.getDate() - 7);
    } else {
      periodStart.setMonth(now.getMonth() - 1);
    }

    const filteredOrders = mockOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= periodStart && order.status !== 'cancelled';
    });

    // 총 매출
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.finalAmount || order.totalAmount), 0);
    
    // 기간별 매출
    const dailyRevenue = mockOrders
      .filter((o) => {
        const orderDate = new Date(o.createdAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return orderDate >= today && o.status !== 'cancelled';
      })
      .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount), 0);

    const weeklyRevenue = mockOrders
      .filter((o) => {
        const orderDate = new Date(o.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo && o.status !== 'cancelled';
      })
      .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount), 0);

    const monthlyRevenue = mockOrders
      .filter((o) => {
        const orderDate = new Date(o.createdAt);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orderDate >= monthAgo && o.status !== 'cancelled';
      })
      .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount), 0);

    // 결제 수단별 비중
    const paymentMethodBreakdown = filteredOrders.reduce(
      (acc, order) => {
        if (order.paymentMethod === 'card') {
          acc.card += order.finalAmount || order.totalAmount;
        } else if (order.paymentMethod === 'coin') {
          acc.coin += order.finalAmount || order.totalAmount;
        } else {
          acc.other += order.finalAmount || order.totalAmount;
        }
        return acc;
      },
      { card: 0, coin: 0, other: 0 }
    );

    // 인기 상품 TOP 5
    const productSales = new Map<string, { count: number; revenue: number }>();
    
    filteredOrders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item) => {
          const productId = item.productId || '';
          const existing = productSales.get(productId) || { count: 0, revenue: 0 };
          productSales.set(productId, {
            count: existing.count + item.quantity,
            revenue: existing.revenue + item.price * item.quantity,
          });
        });
      }
    });

    const topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => {
        const product = mockProducts.find((p) => p.id === productId);
        return {
          productId,
          productName: product?.name || '알 수 없는 상품',
          salesCount: data.count,
          revenue: data.revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 매출 추이 (최근 7일)
    const revenueTrend: Array<{ date: string; revenue: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayRevenue = mockOrders
        .filter((o) => {
          const orderDate = new Date(o.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === date.getTime() && o.status !== 'cancelled';
        })
        .reduce((sum, o) => sum + (o.finalAmount || o.totalAmount), 0);

      revenueTrend.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
      });
    }

    setStats({
      totalRevenue,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      paymentMethodBreakdown,
      topProducts,
      revenueTrend,
    });
    
    setIsLoading(false);
  };

  if (isLoading || !stats) {
    return (
      <div className="text-center py-8 text-zinc-400">로딩 중...</div>
    );
  }

  const totalPayment = stats.paymentMethodBreakdown.card + stats.paymentMethodBreakdown.coin + stats.paymentMethodBreakdown.other;
  const cardPercentage = totalPayment > 0 ? (stats.paymentMethodBreakdown.card / totalPayment) * 100 : 0;
  const coinPercentage = totalPayment > 0 ? (stats.paymentMethodBreakdown.coin / totalPayment) * 100 : 0;
  const otherPercentage = totalPayment > 0 ? (stats.paymentMethodBreakdown.other / totalPayment) * 100 : 0;

  const maxRevenue = Math.max(...stats.revenueTrend.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* 기간 선택 */}
      <div className="flex gap-2">
        <button
          onClick={() => setPeriod('daily')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === 'daily'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-secondary text-zinc-400 hover:text-zinc-300 border border-zinc-800/80'
          }`}
        >
          일간
        </button>
        <button
          onClick={() => setPeriod('weekly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === 'weekly'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-secondary text-zinc-400 hover:text-zinc-300 border border-zinc-800/80'
          }`}
        >
          주간
        </button>
        <button
          onClick={() => setPeriod('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === 'monthly'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-secondary text-zinc-400 hover:text-zinc-300 border border-zinc-800/80'
          }`}
        >
          월간
        </button>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800/80 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">일일 매출</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.dailyRevenue.toLocaleString()}원
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">주간 매출</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.weeklyRevenue.toLocaleString()}원
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">월간 매출</span>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.monthlyRevenue.toLocaleString()}원
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">선택 기간 매출</span>
            <ShoppingCart className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.totalRevenue.toLocaleString()}원
          </p>
        </div>
      </div>

      {/* 매출 추이 차트 */}
      <div className="p-6 rounded-xl border border-zinc-800/80 bg-card/50">
        <h3 className="text-lg font-semibold mb-4">매출 추이 (최근 7일)</h3>
        <div className="h-64 flex items-end gap-2">
          {stats.revenueTrend.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-gradient-to-t from-amber-500/80 to-amber-500/40 rounded-t transition-all hover:from-amber-500 to-amber-500/60"
                  style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  title={`${data.date}: ${data.revenue.toLocaleString()}원`}
                />
              </div>
              <span className="text-xs text-zinc-400 mt-2">{data.date}</span>
              <span className="text-xs text-zinc-500 mt-1">
                {data.revenue > 0 ? `${(data.revenue / 1000).toFixed(0)}k` : '0'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 결제 수단별 비중 */}
        <div className="p-6 rounded-xl border border-zinc-800/80 bg-card/50">
          <h3 className="text-lg font-semibold mb-4">결제 수단별 비중</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">카드 결제</span>
                </div>
                <span className="text-sm font-medium">
                  {cardPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${cardPercentage}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {stats.paymentMethodBreakdown.card.toLocaleString()}원
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="text-sm">코인 결제</span>
                </div>
                <span className="text-sm font-medium">
                  {coinPercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${coinPercentage}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {stats.paymentMethodBreakdown.coin.toLocaleString()}원
              </p>
            </div>

            {otherPercentage > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">기타</span>
                  <span className="text-sm font-medium">
                    {otherPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-zinc-500 h-2 rounded-full transition-all"
                    style={{ width: `${otherPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {stats.paymentMethodBreakdown.other.toLocaleString()}원
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 인기 상품 TOP 5 */}
        <div className="p-6 rounded-xl border border-zinc-800/80 bg-card/50">
          <h3 className="text-lg font-semibold mb-4">인기 상품 TOP 5</h3>
          <div className="space-y-3">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-sm font-bold text-amber-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{product.productName}</p>
                      <p className="text-xs text-zinc-400">
                        {product.salesCount}개 판매
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-400">
                      {product.revenue.toLocaleString()}원
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-400 py-8">데이터가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
