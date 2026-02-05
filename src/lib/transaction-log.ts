/**
 * 트랜잭션 로그 시스템
 * 코인 및 결제 데이터의 모든 증감 이력을 기록
 */

export type TransactionType = 'coin_earn' | 'coin_spend' | 'payment' | 'refund' | 'order_cancel';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface TransactionLog {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number; // 양수: 증가, 음수: 감소
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  metadata?: Record<string, unknown>; // 추가 정보 (주문 ID, 상품 ID 등)
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'transaction-logs';
const MAX_LOGS = 1000; // 최대 로그 개수

/**
 * 트랜잭션 로그 저장
 */
export function saveTransactionLog(log: Omit<TransactionLog, 'id' | 'createdAt'>): void {
  if (typeof window === 'undefined') return;

  try {
    const existingLogs = getTransactionLogs();
    const newLog: TransactionLog = {
      ...log,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...existingLogs].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('트랜잭션 로그 저장 오류:', error);
  }
}

/**
 * 트랜잭션 로그 조회
 */
export function getTransactionLogs(userId?: string): TransactionLog[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const logs: TransactionLog[] = JSON.parse(stored);
    
    if (userId) {
      return logs.filter((log) => log.userId === userId);
    }

    return logs;
  } catch (error) {
    console.error('트랜잭션 로그 조회 오류:', error);
    return [];
  }
}

/**
 * 특정 타입의 트랜잭션 로그 조회
 */
export function getTransactionLogsByType(
  type: TransactionType,
  userId?: string
): TransactionLog[] {
  const logs = getTransactionLogs(userId);
  return logs.filter((log) => log.type === type);
}

/**
 * 기간별 트랜잭션 로그 조회
 */
export function getTransactionLogsByDateRange(
  startDate: Date,
  endDate: Date,
  userId?: string
): TransactionLog[] {
  const logs = getTransactionLogs(userId);
  return logs.filter((log) => {
    const logDate = new Date(log.createdAt);
    return logDate >= startDate && logDate <= endDate;
  });
}

/**
 * 트랜잭션 로그 업데이트
 */
export function updateTransactionLog(
  id: string,
  updates: Partial<Pick<TransactionLog, 'status' | 'balanceAfter' | 'updatedAt'>>
): void {
  if (typeof window === 'undefined') return;

  try {
    const logs = getTransactionLogs();
    const updatedLogs = logs.map((log) =>
      log.id === id
        ? {
            ...log,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : log
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('트랜잭션 로그 업데이트 오류:', error);
  }
}

/**
 * 코인 적립 로그 생성
 */
export function logCoinEarn(
  userId: string,
  amount: number,
  balanceBefore: number,
  balanceAfter: number,
  description: string,
  metadata?: Record<string, unknown>
): void {
  saveTransactionLog({
    userId,
    type: 'coin_earn',
    status: 'completed',
    amount,
    balanceBefore,
    balanceAfter,
    description,
    metadata,
  });
}

/**
 * 코인 사용 로그 생성
 */
export function logCoinSpend(
  userId: string,
  amount: number,
  balanceBefore: number,
  balanceAfter: number,
  description: string,
  metadata?: Record<string, unknown>
): void {
  saveTransactionLog({
    userId,
    type: 'coin_spend',
    status: 'completed',
    amount: -amount, // 음수로 저장
    balanceBefore,
    balanceAfter,
    description,
    metadata,
  });
}

/**
 * 결제 로그 생성
 */
export function logPayment(
  userId: string,
  amount: number,
  description: string,
  metadata?: Record<string, unknown>
): void {
  saveTransactionLog({
    userId,
    type: 'payment',
    status: 'pending',
    amount: -amount, // 결제는 음수
    balanceBefore: 0, // 결제는 잔액과 무관
    balanceAfter: 0,
    description,
    metadata,
  });
}

/**
 * 환불 로그 생성
 */
export function logRefund(
  userId: string,
  amount: number,
  description: string,
  metadata?: Record<string, unknown>
): void {
  saveTransactionLog({
    userId,
    type: 'refund',
    status: 'pending',
    amount,
    balanceBefore: 0,
    balanceAfter: 0,
    description,
    metadata,
  });
}
