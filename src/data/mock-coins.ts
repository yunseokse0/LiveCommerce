/**
 * 코인 시스템용 MOCK 데이터
 */

export interface CoinPrice {
  id: string;
  priceKrw: number;
  createdAt: string;
}

export interface CoinTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export const mockCoinPrice: CoinPrice = {
  id: 'price-1',
  priceKrw: 100, // 1 코인 = 100원
  createdAt: new Date().toISOString(),
};

export const mockCoinTransactions: CoinTransaction[] = [
  {
    id: 'tx-1',
    userId: 'user-1',
    type: 'earn',
    amount: 550,
    balanceAfter: 1550,
    description: '상품 구매로 인한 코인 적립',
    referenceId: 'order-1',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'spend',
    amount: -5000,
    balanceAfter: 1000,
    description: '상품 구매 시 코인 사용',
    referenceId: 'order-2',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-3',
    userId: 'user-1',
    type: 'earn',
    amount: 450,
    balanceAfter: 1450,
    description: '상품 구매로 인한 코인 적립',
    referenceId: 'order-3',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockUserCoinBalance = 1550; // 현재 잔액
