/**
 * 코인 시스템용 MOCK 데이터
 */

export interface CoinPrice {
  id: string;
  priceKrw: number;
  createdAt: string;
}

import type { CoinTransaction } from '@/types/coin';

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
    amount: 840,
    balance: 2390,
    description: '상품 구매로 인한 코인 적립',
    orderId: 'order-4',
    status: 'completed',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-2',
    userId: 'user-1',
    type: 'spend',
    amount: -10000,
    balance: 1550,
    description: '상품 구매 시 코인 사용',
    orderId: 'order-5',
    status: 'completed',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-3',
    userId: 'user-1',
    type: 'earn',
    amount: 550,
    balance: 2550,
    description: '상품 구매로 인한 코인 적립',
    orderId: 'order-1',
    status: 'completed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-4',
    userId: 'user-1',
    type: 'spend',
    amount: -5000,
    balance: 2000,
    description: '상품 구매 시 코인 사용',
    orderId: 'order-2',
    status: 'completed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-5',
    userId: 'user-1',
    type: 'earn',
    amount: 450,
    balance: 7000,
    description: '상품 구매로 인한 코인 적립',
    orderId: 'order-3',
    status: 'completed',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx-6',
    userId: 'user-1',
    type: 'earn',
    amount: 1000,
    balance: 6550,
    description: '이벤트 보너스 코인',
    status: 'completed',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockUserCoinBalance = 2390; // 현재 잔액
