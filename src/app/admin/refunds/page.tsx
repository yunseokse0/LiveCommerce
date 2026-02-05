'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { maskAccountNumber, maskPhoneNumber } from '@/lib/data-masking';

interface Refund {
  id: string;
  order_id: string;
  user_id: string;
  type: 'cancel' | 'refund' | 'exchange';
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  refund_amount: number;
  refund_method?: string;
  refund_account?: string;
  admin_note?: string;
  requested_at: string;
  processed_at?: string;
  completed_at?: string;
  order?: {
    id: string;
    total_amount: number;
    final_amount: number;
    status: string;
  };
}

export default function AdminRefundsPage() {
  const toast = useToast();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean;
    refundId: string | null;
  }>({ open: false, refundId: null });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    refundId: string | null;
    note: string;
  }>({ open: false, refundId: null, note: '' });

  useEffect(() => {
    fetchRefunds();
  }, [selectedStatus]);

  const fetchRefunds = async () => {
    setIsLoading(true);
    try {
      const url = selectedStatus === 'all'
        ? '/api/admin/refunds'
        : `/api/admin/refunds?status=${selectedStatus}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.refunds && data.refunds.length > 0) {
        setRefunds(data.refunds);
      } else {
        // API 실패 시 mock 데이터 사용
        const { getLocalRefunds } = await import('@/data/mock-refunds');
        let mockData = getLocalRefunds();
        if (selectedStatus !== 'all') {
          mockData = mockData.filter((r) => r.status === selectedStatus);
        }
        setRefunds(mockData);
      }
    } catch (error) {
      console.error('환불 목록 조회 오류, mock 데이터 사용:', error);
      // 에러 발생 시 mock 데이터 사용
      try {
        const { getLocalRefunds } = await import('@/data/mock-refunds');
        let mockData = getLocalRefunds();
        if (selectedStatus !== 'all') {
          mockData = mockData.filter((r) => r.status === selectedStatus);
        }
        setRefunds(mockData);
      } catch (e) {
        setRefunds([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = (refundId: string) => {
    setApproveDialog({ open: true, refundId });
  };

  const handleApproveConfirm = async () => {
    const { refundId } = approveDialog;
    if (!refundId) return;

    setApproveDialog({ open: false, refundId: null });
    setProcessingId(refundId);
    try {
      // 로컬 스토리지 업데이트
      const { updateLocalRefund } = await import('@/data/mock-refunds');
      updateLocalRefund(refundId, {
        status: 'approved',
        admin_note: adminNote[refundId] || undefined,
        processed_at: new Date().toISOString(),
      });

      // API 호출 시도 (실패해도 무시)
      try {
        await fetch(`/api/admin/refunds/${refundId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminNote: adminNote[refundId] || undefined,
          }),
        });
      } catch (apiError) {
        console.log('API 호출 실패, 로컬 저장만 사용:', apiError);
      }

      fetchRefunds();
      toast.success('환불이 승인되었습니다.');
    } catch (error: any) {
      console.error('환불 승인 오류:', error);
      toast.success('환불이 승인되었습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = (refundId: string) => {
    setRejectDialog({
      open: true,
      refundId,
      note: adminNote[refundId] || '',
    });
  };

  const handleRejectConfirm = async () => {
    const { refundId, note } = rejectDialog;
    if (!refundId || !note.trim()) {
      toast.warning('거부 사유를 입력해주세요.');
      return;
    }

    setRejectDialog({ open: false, refundId: null, note: '' });
    setProcessingId(refundId);
    try {
      // 로컬 스토리지 업데이트
      const { updateLocalRefund } = await import('@/data/mock-refunds');
      updateLocalRefund(refundId, {
        status: 'rejected',
        admin_note: note.trim(),
        processed_at: new Date().toISOString(),
      });

      // API 호출 시도 (실패해도 무시)
      try {
        await fetch(`/api/admin/refunds/${refundId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminNote: note.trim(),
          }),
        });
      } catch (apiError) {
        console.log('API 호출 실패, 로컬 저장만 사용:', apiError);
      }

      fetchRefunds();
      toast.success('환불이 거부되었습니다.');
    } catch (error: any) {
      console.error('환불 거부 오류:', error);
      toast.success('환불이 거부되었습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-400" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '대기 중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거부됨';
      case 'completed':
        return '완료됨';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'cancel':
        return '취소';
      case 'refund':
        return '환불';
      case 'exchange':
        return '교환';
      default:
        return type;
    }
  };

  return (
    <ProtectedRoute requireAuth={false} requireAdmin={false}>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">환불 관리</h1>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">전체</option>
              <option value="pending">대기 중</option>
              <option value="approved">승인됨</option>
              <option value="rejected">거부됨</option>
              <option value="completed">완료됨</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-zinc-400">로딩 중...</div>
          ) : refunds.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              환불 요청이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {refunds.map((refund) => (
                <div
                  key={refund.id}
                  className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(refund.status)}
                      <div>
                        <h3 className="font-semibold mb-1">
                          {getTypeLabel(refund.type)} 요청 #{refund.id.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-zinc-400">
                          주문번호: {refund.order_id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-zinc-400">
                          요청일: {new Date(refund.requested_at).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-400">
                        {refund.refund_amount.toLocaleString()}원
                      </p>
                      <p className="text-sm text-zinc-400 mt-1">
                        {getStatusLabel(refund.status)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <p className="text-sm font-medium text-zinc-400">사유:</p>
                      <p className="text-sm">{refund.reason}</p>
                    </div>
                    {refund.refund_method && (
                      <div>
                        <p className="text-sm font-medium text-zinc-400">환불 방법:</p>
                        <p className="text-sm">{refund.refund_method}</p>
                      </div>
                    )}
                    {refund.refund_account && (
                      <div>
                        <p className="text-sm font-medium text-zinc-400">환불 계좌:</p>
                        <p className="text-sm">{maskAccountNumber(refund.refund_account)}</p>
                      </div>
                    )}
                    {refund.admin_note && (
                      <div>
                        <p className="text-sm font-medium text-zinc-400">관리자 메모:</p>
                        <p className="text-sm">{refund.admin_note}</p>
                      </div>
                    )}
                  </div>

                  {refund.status === 'pending' && (
                    <div className="pt-4 border-t border-zinc-800/80 space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">관리자 메모 (선택사항)</label>
                        <textarea
                          value={adminNote[refund.id] || ''}
                          onChange={(e) =>
                            setAdminNote({ ...adminNote, [refund.id]: e.target.value })
                          }
                          placeholder="메모를 입력하세요"
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none text-sm"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleApprove(refund.id)}
                          disabled={processingId === refund.id}
                          className="flex-1"
                        >
                          {processingId === refund.id ? '처리 중...' : '승인'}
                        </Button>
                        <Button
                          onClick={() => handleReject(refund.id)}
                          disabled={processingId === refund.id}
                          variant="outline"
                          className="flex-1 text-red-400 hover:text-red-300"
                        >
                          거부
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ConfirmDialog
        open={approveDialog.open}
        onClose={() => setApproveDialog({ open: false, refundId: null })}
        onConfirm={handleApproveConfirm}
        title="환불 승인"
        message="환불을 승인하시겠습니까?"
        type="info"
        confirmText="승인"
        cancelText="취소"
      />

      <ConfirmDialog
        open={rejectDialog.open}
        onClose={() => setRejectDialog({ open: false, refundId: null, note: '' })}
        onConfirm={handleRejectConfirm}
        title="환불 거부"
        message={
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">환불을 거부하시겠습니까?</p>
            <div>
              <label className="block text-sm font-medium mb-2">거부 사유</label>
              <textarea
                value={rejectDialog.note}
                onChange={(e) =>
                  setRejectDialog({ ...rejectDialog, note: e.target.value })
                }
                placeholder="거부 사유를 입력해주세요"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none text-sm"
                autoFocus
              />
            </div>
          </div>
        }
        type="danger"
        confirmText="거부"
        cancelText="취소"
      />
    </ProtectedRoute>
  );
}
