'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/store/auth';
import type { Order } from '@/types/product';

interface DeliveryManagerProps {
  className?: string;
  adminMode?: boolean;
}

export function DeliveryManager({ className, adminMode = false }: DeliveryManagerProps) {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // 배송 목록 조회
  const fetchDeliveries = async () => {
    if (!adminMode && !user) return;

    setIsLoading(true);
    try {
      const url = adminMode 
        ? '/api/delivery/list'
        : `/api/delivery/list?bjId=${user!.id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('배송 목록 조회 실패');

      const data = await response.json();
      setDeliveries(data.deliveries || []);
    } catch (error) {
      console.error('배송 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [user, adminMode]);

  // 배송 상태 업데이트
  const updateDeliveryStatus = async (orderId: string, status: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/delivery/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('배송 상태 업데이트 실패');

      fetchDeliveries();
      toast.success('배송 상태가 업데이트되었습니다.');
    } catch (error) {
      console.error('배송 상태 업데이트 오류:', error);
      toast.error('배송 상태를 업데이트할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 상태별 필터링
  const filteredDeliveries = selectedStatus === 'all'
    ? deliveries
    : deliveries.filter((d) => d.status === selectedStatus);

  // 상태 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-amber-400" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  // 상태 라벨
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return '결제 완료';
      case 'shipped':
        return '배송 중';
      case 'delivered':
        return '배송 완료';
      default:
        return status;
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold">배송 관리</h3>
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-secondary border border-zinc-800/80 text-sm focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">전체</option>
          <option value="paid">결제 완료</option>
          <option value="shipped">배송 중</option>
          <option value="delivered">배송 완료</option>
        </select>
      </div>

      {isLoading && deliveries.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">로딩 중...</div>
      ) : filteredDeliveries.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">
          배송 중인 주문이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <div
              key={delivery.orderId}
              className="p-4 rounded-lg border border-zinc-800/80 bg-card/50 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(delivery.status)}
                    <span className="font-semibold">
                      주문 #{delivery.orderId.substring(0, 8)}
                    </span>
                    <span className="text-sm text-zinc-400">
                      {getStatusLabel(delivery.status)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-1">
                    주문일: {new Date(delivery.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  {delivery.shippingAddress && (
                    <p className="text-sm text-zinc-400">
                      배송지: {delivery.shippingAddress.split('\n')[0]}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-amber-400">
                    {delivery.totalAmount.toLocaleString()}원
                  </p>
                </div>
              </div>

              {/* 주문 상품 목록 */}
              {delivery.items && delivery.items.length > 0 && (
                <div className="mb-3 pt-3 border-t border-zinc-800/80">
                  <p className="text-xs text-zinc-400 mb-2">주문 상품:</p>
                  <div className="space-y-1">
                    {delivery.items.map((item: any, index: number) => (
                      <div key={index} className="text-sm">
                        <span className="text-zinc-300">
                          {item.products?.name || '상품명 없음'}
                        </span>
                        <span className="text-zinc-500 ml-2">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 배송 상태 업데이트 버튼 */}
              <div className="flex gap-2 pt-3 border-t border-zinc-800/80">
                {delivery.status === 'paid' && (
                  <Button
                    onClick={() => updateDeliveryStatus(delivery.orderId, 'shipped')}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    배송 시작
                  </Button>
                )}
                {delivery.status === 'shipped' && (
                  <Button
                    onClick={() => updateDeliveryStatus(delivery.orderId, 'delivered')}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    배송 완료
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
