'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ProductManager } from '@/components/studio/product-manager';
import { DeliveryManager } from '@/components/studio/delivery-manager';
import { PromotionManager } from '@/components/studio/promotion-manager';
import { RankingEditTable } from '@/components/admin/ranking-edit-table';
import { BJList } from '@/components/admin/bj-list';
import { SalesDashboard } from '@/components/admin/sales-dashboard';
import { TrafficMonitor } from '@/components/admin/traffic-monitor';
import { StockAlerts } from '@/components/admin/stock-alerts';
import { 
  Package, 
  Truck, 
  Tag, 
  Trophy,
  Users,
  LayoutDashboard,
  Receipt,
  BarChart3,
  Activity,
  Radio
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useFormat } from '@/hooks/use-format';

type AdminTab = 'dashboard' | 'products' | 'delivery' | 'promotions' | 'ranking' | 'creators' | 'refunds' | 'analytics' | 'monitoring';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const format = useFormat();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const tabs = [
    { id: 'dashboard' as AdminTab, label: t('admin.dashboard'), icon: LayoutDashboard },
    { id: 'analytics' as AdminTab, label: t('admin.analytics'), icon: BarChart3 },
    { id: 'monitoring' as AdminTab, label: t('admin.monitoring'), icon: Activity },
    { id: 'products' as AdminTab, label: t('admin.products'), icon: Package },
    { id: 'delivery' as AdminTab, label: t('admin.delivery'), icon: Truck },
    { id: 'promotions' as AdminTab, label: t('admin.promotions'), icon: Tag },
    { id: 'ranking' as AdminTab, label: t('admin.ranking'), icon: Trophy },
    { id: 'creators' as AdminTab, label: t('admin.creators'), icon: Users },
    { id: 'refunds' as AdminTab, label: t('admin.refunds'), icon: Receipt },
  ];

  return (
    <ProtectedRoute requireAuth={false} requireAdmin={false}>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{t('admin.title')}</h1>
            <p className="text-sm text-zinc-400">{t('admin.subtitle')}</p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 border-b border-zinc-800/80 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                      border-b-2 -mb-px
                      ${activeTab === tab.id
                        ? 'border-amber-500 text-amber-400'
                        : 'border-transparent text-zinc-400 hover:text-zinc-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="space-y-6 sm:space-y-8">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 핵심 KPI 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-6 rounded-xl border border-zinc-800/80 bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">{t('admin.totalSales')}</span>
                      <BarChart3 className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{format.currency(12450000)}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t('admin.thisMonth')}</p>
                  </div>

                  <div className="p-6 rounded-xl border border-zinc-800/80 bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">{t('admin.newUsers')}</span>
                      <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{format.number(1234)}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t('admin.thisMonth')}</p>
                  </div>

                  <div className="p-6 rounded-xl border border-zinc-800/80 bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">{t('admin.pendingRefunds')}</span>
                      <Receipt className="w-5 h-5 text-yellow-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{format.number(5)}</p>
                    <p className="text-xs text-zinc-400 mt-1">{t('admin.pendingRefunds')}</p>
                  </div>
                </div>

                {/* 재고 경고 섹션 */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">재고 경고</h2>
                  <StockAlerts />
                </div>

                {/* 빠른 접근 카드 */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">빠른 접근</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('products')}
                      className="p-6 rounded-xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Package className="w-8 h-8 text-amber-400" />
                        <span className="text-xs text-zinc-500">관리</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">상품 관리</h3>
                      <p className="text-sm text-zinc-400">전체 상품 조회 및 관리</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('delivery')}
                      className="p-6 rounded-xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Truck className="w-8 h-8 text-amber-400" />
                        <span className="text-xs text-zinc-500">관리</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">배송 관리</h3>
                      <p className="text-sm text-zinc-400">전체 배송 상태 관리</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('promotions')}
                      className="p-6 rounded-xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Tag className="w-8 h-8 text-amber-400" />
                        <span className="text-xs text-zinc-500">관리</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">프로모션 관리</h3>
                      <p className="text-sm text-zinc-400">쿠폰, 1+1, 사은품 관리</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('ranking')}
                      className="p-6 rounded-xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Trophy className="w-8 h-8 text-amber-400" />
                        <span className="text-xs text-zinc-500">관리</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">랭킹 관리</h3>
                      <p className="text-sm text-zinc-400">크리에이터 랭킹 조정</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('creators')}
                      className="p-6 rounded-xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8 text-amber-400" />
                        <span className="text-xs text-zinc-500">관리</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">크리에이터 관리</h3>
                      <p className="text-sm text-zinc-400">크리에이터 목록 및 관리</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('refunds')}
                      className="p-6 rounded-xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Receipt className="w-8 h-8 text-amber-400" />
                        <span className="text-xs text-zinc-500">관리</span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">환불 관리</h3>
                      <p className="text-sm text-zinc-400">환불 요청 처리</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-semibold">매출 분석</h2>
                </div>
                <SalesDashboard />
              </div>
            )}

            {activeTab === 'monitoring' && (
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-semibold">트래픽 모니터링</h2>
                </div>
                <TrafficMonitor />
              </div>
            )}

            {activeTab === 'products' && (
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-semibold">상품 관리</h2>
                </div>
                <ProductManager adminMode={true} />
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-semibold">배송 관리</h2>
                </div>
                <DeliveryManager adminMode={true} />
              </div>
            )}

            {activeTab === 'promotions' && (
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Tag className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-semibold">프로모션 관리</h2>
                </div>
                <PromotionManager adminMode={true} />
              </div>
            )}

            {activeTab === 'ranking' && (
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-semibold">랭킹 관리</h2>
                </div>
                <RankingEditTable />
              </div>
            )}

            {activeTab === 'creators' && (
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-semibold">크리에이터 관리</h2>
                </div>
                <BJList />
              </div>
            )}

            {activeTab === 'refunds' && (
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-semibold">환불 관리</h2>
                </div>
                <div className="text-center py-8">
                  <p className="text-zinc-400 mb-4">환불 관리 페이지로 이동합니다.</p>
                  <Button onClick={() => window.location.href = '/admin/refunds'}>
                    환불 관리 페이지 열기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
