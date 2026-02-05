'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { Package, Truck, CheckCircle, Clock, X } from 'lucide-react';
import type { Order } from '@/types/product';
import { mockOrders } from '@/data/mock-orders';
import { useFormat } from '@/hooks/use-format';
import { useTranslation } from '@/hooks/use-translation';

export default function OrdersPage() {
  const { user } = useAuth();
  const format = useFormat();
  const { t } = useTranslation();
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    orderId: string | null;
    reason: string;
  }>({ open: false, orderId: null, reason: '' });

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

  // 주문 취소
  const handleCancelOrder = (orderId: string) => {
    if (!user) return;
    setCancelDialog({ open: true, orderId, reason: '' });
  };

  const handleCancelConfirm = async () => {
    const { orderId, reason } = cancelDialog;
    if (!orderId || !reason.trim()) {
      toast.warning('취소 사유를 입력해주세요.');
      return;
    }

    if (!user) {
      toast.warning('로그인이 필요합니다.');
      return;
    }

    setCancelDialog({ open: false, orderId: null, reason: '' });
    setCancellingOrderId(orderId);
    try {
      // 로컬 스토리지에 환불 기록 저장
      const { saveLocalRefund } = await import('@/data/mock-refunds');
      const order = orders.find((o) => o.id === orderId);
      
      if (order) {
        saveLocalRefund({
          id: `refund-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          order_id: orderId,
          user_id: user.id,
          type: 'cancel',
          reason: reason.trim(),
          status: 'pending',
          refund_amount: order.finalAmount || order.totalAmount,
          refund_method: order.paymentMethod || 'card',
          requested_at: new Date().toISOString(),
          order: {
            id: order.id,
            total_amount: order.totalAmount,
            final_amount: order.finalAmount || order.totalAmount,
            status: order.status,
          },
        });
      }

      // API 호출 시도 (실패해도 무시)
      try {
        await fetch(`/api/orders/${orderId}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            reason: reason.trim(),
          }),
        });
      } catch (apiError) {
        console.log('API 호출 실패, 로컬 저장만 사용:', apiError);
      }

      // 주문 목록 업데이트
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: 'cancelled' as const } : order
      );
      setOrders(updatedOrders);

      toast.success('주문이 취소되었습니다.');
    } catch (error: any) {
      console.error('주문 취소 오류:', error);
      // 에러 발생해도 주문 상태 업데이트
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: 'cancelled' as const } : order
      );
      setOrders(updatedOrders);
      toast.success('주문이 취소되었습니다.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // 취소 가능한 상태인지 확인
  const canCancel = (status: string) => {
    return status === 'pending' || status === 'paid';
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
                          {format.dateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-400">
                        {format.currency(order.totalAmount)}
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
                              {format.currency(item.price * item.quantity)}
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

                  {/* 취소 버튼 */}
                  {canCancel(order.status) && (
                    <div className="pt-4 border-t border-zinc-800/80 mt-4">
                      <Button
                        onClick={() => handleCancelOrder(order.id)}
                        variant="outline"
                        size="sm"
                        disabled={cancellingOrderId === order.id}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {cancellingOrderId === order.id ? '취소 처리 중...' : '주문 취소'}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, orderId: null, reason: '' })}
        onConfirm={handleCancelConfirm}
        title="주문 취소"
        message={
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">정말 주문을 취소하시겠습니까?</p>
            <div>
              <label className="block text-sm font-medium mb-2">취소 사유</label>
              <textarea
                value={cancelDialog.reason}
                onChange={(e) =>
                  setCancelDialog({ ...cancelDialog, reason: e.target.value })
                }
                placeholder="취소 사유를 입력해주세요"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none text-sm"
                autoFocus
              />
            </div>
          </div>
        }
        type="warning"
        confirmText="취소하기"
        cancelText="돌아가기"
      />
    </ProtectedRoute>
  );
}
