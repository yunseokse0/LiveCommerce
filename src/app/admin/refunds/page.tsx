'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

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
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<Record<string, string>>({});

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

      if (data.success) {
        setRefunds(data.refunds || []);
      }
    } catch (error) {
      console.error('환불 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (refundId: string) => {
    if (!confirm('환불을 승인하시겠습니까?')) return;

    setProcessingId(refundId);
    try {
      const response = await fetch(`/api/admin/refunds/${refundId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNote: adminNote[refundId] || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchRefunds();
        alert('환불이 승인되었습니다.');
      } else {
        throw new Error(data.error || '환불 승인 실패');
      }
    } catch (error: any) {
      console.error('환불 승인 오류:', error);
      alert(error.message || '환불 승인을 처리할 수 없습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (refundId: string) => {
    const note = adminNote[refundId] || prompt('거부 사유를 입력해주세요:');
    if (!note || !note.trim()) {
      return;
    }

    if (!confirm('환불을 거부하시겠습니까?')) return;

    setProcessingId(refundId);
    try {
      const response = await fetch(`/api/admin/refunds/${refundId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminNote: note.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchRefunds();
        alert('환불이 거부되었습니다.');
      } else {
        throw new Error(data.error || '환불 거부 실패');
      }
    } catch (error: any) {
      console.error('환불 거부 오류:', error);
      alert(error.message || '환불 거부를 처리할 수 없습니다.');
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
      <Header />
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
                        <p className="text-sm">{refund.refund_account}</p>
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
    </ProtectedRoute>
  );
}
