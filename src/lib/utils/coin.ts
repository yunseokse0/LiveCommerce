/**
 * 코인 유틸리티 함수
 */

import type { CoinPrice, CoinEarnRule } from '@/types/coin';

/**
 * 현재 코인 시세 조회
 */
export function getCurrentCoinPrice(prices: CoinPrice[]): CoinPrice | null {
  const now = new Date();
  const activePrice = prices.find(
    (price) =>
      price.isActive &&
      new Date(price.effectiveFrom) <= now &&
      (!price.effectiveUntil || new Date(price.effectiveUntil) > now)
  );
  return activePrice || null;
}

/**
 * 구매 금액에 따른 코인 적립 계산
 */
export function calculateCoinEarn(
  purchaseAmount: number,
  earnRule: CoinEarnRule
): number {
  if (!earnRule.isActive) return 0;

  // 최소 구매 금액 확인
  if (earnRule.minPurchaseAmount && purchaseAmount < earnRule.minPurchaseAmount) {
    return 0;
  }

  let earnAmount = 0;

  if (earnRule.type === 'percentage') {
    // 구매 금액의 퍼센트
    earnAmount = Math.floor((purchaseAmount * earnRule.value) / 100);
  } else {
    // 고정 금액
    earnAmount = earnRule.value;
  }

  // 최대 적립 금액 제한
  if (earnRule.maxEarnAmount) {
    earnAmount = Math.min(earnAmount, earnRule.maxEarnAmount);
  }

  return earnAmount;
}

/**
 * 코인을 원화로 변환
 */
export function coinToWon(coins: number, coinPrice: CoinPrice | null): number {
  if (!coinPrice) return 0;
  return Math.floor(coins * coinPrice.price);
}

/**
 * 원화를 코인으로 변환
 */
export function wonToCoin(won: number, coinPrice: CoinPrice | null): number {
  if (!coinPrice || coinPrice.price === 0) return 0;
  return Math.floor(won / coinPrice.price);
}

/**
 * 코인 잔액이 충분한지 확인
 */
export function hasEnoughCoins(balance: number, required: number): boolean {
  return balance >= required;
}
