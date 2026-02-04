/**
 * 환불 Mock 데이터
 */

export interface MockRefund {
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

export const mockRefunds: MockRefund[] = [
  {
    id: 'refund-1',
    order_id: 'order-1',
    user_id: 'user-1',
    type: 'cancel',
    reason: '단순 변심',
    status: 'pending',
    refund_amount: 50000,
    refund_method: 'card',
    requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    order: {
      id: 'order-1',
      total_amount: 50000,
      final_amount: 50000,
      status: 'paid',
    },
  },
];

// 로컬 스토리지 키
const REFUNDS_STORAGE_KEY = 'livecommerce_refunds';

/**
 * 로컬 스토리지에서 환불 목록 가져오기
 */
export function getLocalRefunds(): MockRefund[] {
  if (typeof window === 'undefined') return mockRefunds;
  
  try {
    const stored = localStorage.getItem(REFUNDS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return [...mockRefunds, ...parsed];
    }
  } catch (error) {
    console.error('환불 목록 로드 오류:', error);
  }
  
  return mockRefunds;
}

/**
 * 로컬 스토리지에 환불 저장
 */
export function saveLocalRefund(refund: MockRefund): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getLocalRefunds();
    const filtered = existing.filter((r) => r.id !== refund.id);
    const updated = [...filtered, refund];
    
    // mock 데이터 제외하고 저장
    const customRefunds = updated.filter((r) => !mockRefunds.find((mr) => mr.id === r.id));
    localStorage.setItem(REFUNDS_STORAGE_KEY, JSON.stringify(customRefunds));
  } catch (error) {
    console.error('환불 저장 오류:', error);
  }
}

/**
 * 로컬 스토리지에서 환불 업데이트
 */
export function updateLocalRefund(refundId: string, updates: Partial<MockRefund>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getLocalRefunds();
    const updated = existing.map((r) =>
      r.id === refundId ? { ...r, ...updates } : r
    );
    
    // mock 데이터 제외하고 저장
    const customRefunds = updated.filter((r) => !mockRefunds.find((mr) => mr.id === r.id));
    localStorage.setItem(REFUNDS_STORAGE_KEY, JSON.stringify(customRefunds));
  } catch (error) {
    console.error('환불 업데이트 오류:', error);
  }
}
