'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/store/auth';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import type { Order } from '@/types/product';
import { mockOrders } from '@/data/mock-orders';

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 주문 목록 조회
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    // 먼저 MOCK 데이터 사용
    const userOrders = mockOrders.filter((o) => o.userId === user.id);
    if (userOrders.length > 0) {
      setOrders(userOrders);
      setIsLoading(false);
    }

    // API 호출 시도
    fetch(`/api/orders?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.orders && data.orders.length > 0) {
          setOrders(data.orders);
        } else {
          // API 실패 시 MOCK 데이터 유지
          setOrders(userOrders);
        }
      })
      .catch((error) => {
        console.error('주문 목록 조회 오류, MOCK 데이터 사용:', error);
        // 에러 발생 시 MOCK 데이터 유지
        setOrders(userOrders);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  // 상태 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'paid':
        return <Package className="w-5 h-5 text-blue-400" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-amber-400" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <Package className="w-5 h-5 text-zinc-400" />;
    }
  };

  // 상태 라벨
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '결제 대기';
      case 'paid':
        return '결제 완료';
      case 'shipped':
        return '배송 중';
      case 'delivered':
        return '배송 완료';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-6xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">주문 내역</h1>

          {isLoading ? (
            <div className="text-center py-12 text-zinc-400">로딩 중...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              주문 내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold mb-1">
                          주문 #{order.id.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          {new Date(order.createdAt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-400">
                        {order.totalAmount.toLocaleString()}원
                      </p>
                      <p className="text-sm text-zinc-400 mt-1">
                        {getStatusLabel(order.status)}
                      </p>
                    </div>
                  </div>

                  {/* 주문 상품 목록 */}
                  {order.items && order.items.length > 0 && (
                    <div className="pt-4 border-t border-zinc-800/80">
                      <p className="text-sm font-medium mb-2">주문 상품:</p>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <span className="text-zinc-300">
                                {item.product?.name || '상품명 없음'}
                              </span>
                              <span className="text-zinc-500 ml-2">
                                x{item.quantity}
                              </span>
                            </div>
                            <span className="text-zinc-400">
                              {(item.price * item.quantity).toLocaleString()}원
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 배송 정보 */}
                  {order.shippingAddress && (
                    <div className="pt-4 border-t border-zinc-800/80 mt-4">
                      <p className="text-sm font-medium mb-1">배송지:</p>
                      <p className="text-sm text-zinc-400">
                        {order.shippingAddress.split('\n')[0]}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
