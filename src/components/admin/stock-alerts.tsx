'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Package, Bell } from 'lucide-react';
import { mockProducts } from '@/data/mock-products';
import type { Product } from '@/types/product';
import Link from 'next/link';

interface StockAlert {
  product: Product;
  currentStock: number;
  threshold: number;
  severity: 'low' | 'critical';
}

export function StockAlerts() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [threshold, setThreshold] = useState(10); // 기본 임계값
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStockLevels();
  }, [threshold]);

  const checkStockLevels = () => {
    setIsLoading(true);
    
    const stockAlerts: StockAlert[] = [];
    
    mockProducts.forEach((product) => {
      if (product.stock <= threshold && product.isActive) {
        stockAlerts.push({
          product,
          currentStock: product.stock,
          threshold,
          severity: product.stock <= 5 ? 'critical' : 'low',
        });
      }
    });

    // 심각도 순으로 정렬 (critical 먼저)
    stockAlerts.sort((a, b) => {
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (a.severity !== 'critical' && b.severity === 'critical') return 1;
      return a.currentStock - b.currentStock;
    });

    setAlerts(stockAlerts);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-zinc-400">로딩 중...</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 임계값 설정 */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800/80 bg-card/50">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-semibold">재고 임계값 설정</h3>
            <p className="text-sm text-zinc-400">이 값 이하로 떨어지면 알림이 표시됩니다.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value) || 10)}
            min="1"
            max="100"
            className="w-20 px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 text-sm"
          />
          <span className="text-sm text-zinc-400">개</span>
        </div>
      </div>

      {/* 알림 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="font-semibold text-red-400">심각 (5개 이하)</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {alerts.filter((a) => a.severity === 'critical').length}개
          </p>
        </div>

        <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold text-yellow-400">주의 ({threshold}개 이하)</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {alerts.filter((a) => a.severity === 'low').length}개
          </p>
        </div>
      </div>

      {/* 재고 경고 목록 */}
      {alerts.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-semibold">재고 경고 상품 목록</h3>
          {alerts.map((alert) => (
            <Link
              key={alert.product.id}
              href={`/products/${alert.product.id}`}
              className="block p-4 rounded-xl border border-zinc-800/80 bg-card/50 hover:border-amber-500/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 border ${
                      alert.severity === 'critical'
                        ? 'border-red-500/30'
                        : 'border-yellow-500/30'
                    } flex-shrink-0`}
                  >
                    {alert.product.thumbnailUrl || alert.product.imageUrl ? (
                      <img
                        src={alert.product.thumbnailUrl || alert.product.imageUrl || ''}
                        alt={alert.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold line-clamp-1">{alert.product.name}</h4>
                      {alert.severity === 'critical' && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          긴급
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-1">
                      {alert.product.description}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p
                    className={`text-lg font-bold ${
                      alert.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                    }`}
                  >
                    {alert.currentStock}개
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">재고 부족</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-400">
          <Package className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
          <p>재고 경고가 없습니다.</p>
          <p className="text-sm mt-1">모든 상품이 충분한 재고를 보유하고 있습니다.</p>
        </div>
      )}
    </div>
  );
}
