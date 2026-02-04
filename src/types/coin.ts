/**
 * 코인 시스템 타입 정의
 */

export type CoinTransactionType = 'earn' | 'spend' | 'refund' | 'admin_adjust';
export type CoinTransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface Coin {
  id: string;
  userId: string;
  balance: number; // 현재 잔액
  totalEarned: number; // 총 적립
  totalSpent: number; // 총 사용
  updatedAt: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  type: CoinTransactionType;
  amount: number; // 양수: 적립, 음수: 사용
  balance: number; // 거래 후 잔액
  description: string;
  orderId?: string; // 주문 ID (구매 적립/사용 시)
  status: CoinTransactionStatus;
  createdAt: string;
}

export interface CoinPrice {
  id: string;
  price: number; // 1코인 = ?원
  effectiveFrom: string; // 적용 시작일
  effectiveUntil?: string; // 적용 종료일 (현재 시세는 null)
  isActive: boolean;
  createdAt: string;
}

export interface CoinEarnRule {
  id: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed'; // 구매 금액의 퍼센트 또는 고정 금액
  value: number; // 퍼센트 또는 고정 금액
  minPurchaseAmount?: number; // 최소 구매 금액
  maxEarnAmount?: number; // 최대 적립 금액
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoinEarnRuleCreateInput {
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchaseAmount?: number;
  maxEarnAmount?: number;
}
