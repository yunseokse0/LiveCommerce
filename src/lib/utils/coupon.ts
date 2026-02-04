/**
 * 쿠폰 유틸리티 함수
 */

import type { Coupon, CouponValidation } from '@/types/promotion';

/**
 * 쿠폰 코드 생성
 */
export function generateCouponCode(prefix: string = 'LC'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * 쿠폰 유효성 검증
 */
export function validateCoupon(
  coupon: Coupon,
  purchaseAmount: number,
  userId?: string,
  productIds?: string[]
): CouponValidation {
  // 활성 상태 확인
  if (!coupon.isActive) {
    return {
      isValid: false,
      error: '사용할 수 없는 쿠폰입니다.',
    };
  }

  // 유효 기간 확인
  const now = new Date();
  const validFrom = new Date(coupon.validFrom);
  const validUntil = new Date(coupon.validUntil);

  if (now < validFrom) {
    return {
      isValid: false,
      error: '아직 사용할 수 없는 쿠폰입니다.',
    };
  }

  if (now > validUntil) {
    return {
      isValid: false,
      error: '만료된 쿠폰입니다.',
    };
  }

  // 사용 횟수 제한 확인
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return {
      isValid: false,
      error: '쿠폰 사용 횟수가 초과되었습니다.',
    };
  }

  // 최소 구매 금액 확인
  if (coupon.minPurchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
    return {
      isValid: false,
      error: `최소 ${coupon.minPurchaseAmount.toLocaleString()}원 이상 구매해야 합니다.`,
    };
  }

  // 상품 제한 확인
  if (coupon.productIds && coupon.productIds.length > 0 && productIds) {
    const hasValidProduct = productIds.some((id) => coupon.productIds?.includes(id));
    if (!hasValidProduct) {
      return {
        isValid: false,
        error: '이 쿠폰은 해당 상품에 사용할 수 없습니다.',
      };
    }
  }

  // 할인 금액 계산
  let discountAmount = 0;

  if (coupon.type === 'percentage') {
    discountAmount = Math.floor((purchaseAmount * coupon.value) / 100);
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.type === 'fixed') {
    discountAmount = coupon.value;
  } else if (coupon.type === 'free_shipping') {
    // 배송비는 주문 처리 시 별도 계산
    discountAmount = 0;
  }

  // 구매 금액보다 할인 금액이 클 수 없음
  discountAmount = Math.min(discountAmount, purchaseAmount);

  return {
    isValid: true,
    discountAmount,
  };
}

/**
 * 쿠폰 할인 금액 계산
 */
export function calculateCouponDiscount(
  coupon: Coupon,
  purchaseAmount: number
): number {
  if (coupon.type === 'percentage') {
    const discount = Math.floor((purchaseAmount * coupon.value) / 100);
    if (coupon.maxDiscountAmount) {
      return Math.min(discount, coupon.maxDiscountAmount);
    }
    return discount;
  } else if (coupon.type === 'fixed') {
    return Math.min(coupon.value, purchaseAmount);
  }
  return 0;
}
