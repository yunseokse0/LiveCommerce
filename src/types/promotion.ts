/**
 * 프로모션 관련 타입 정의
 */

export type PromotionType = 'coupon' | 'buy_one_get_one' | 'free_gift' | 'discount';
export type DiscountType = 'percentage' | 'fixed' | 'free_shipping';

export interface Coupon {
  id: string;
  name: string; // 쿠폰명
  code: string; // 쿠폰 코드
  description?: string; // 쿠폰 설명
  type: DiscountType; // 할인 타입
  value: number; // 할인 값 (퍼센트 또는 금액)
  minPurchaseAmount?: number; // 최소 구매 금액
  maxDiscountAmount?: number; // 최대 할인 금액 (퍼센트 할인 시)
  validFrom: string; // 유효 시작일
  validUntil: string; // 유효 종료일
  usageLimit?: number; // 사용 횟수 제한
  usageCount: number; // 현재 사용 횟수
  perUserLimit?: number; // 사용자당 사용 제한
  bjId?: string; // 크리에이터 ID (크리에이터 전용 쿠폰)
  productIds?: string[]; // 적용 가능한 상품 ID 목록
  categoryIds?: string[]; // 적용 가능한 카테고리 ID 목록
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BuyOneGetOne {
  id: string;
  name: string; // 프로모션명
  description?: string;
  productId: string; // 1+1 대상 상품 ID
  freeProductId?: string; // 무료로 제공할 상품 ID (없으면 같은 상품)
  minQuantity: number; // 최소 구매 수량 (예: 2개 이상 구매 시)
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  bjId?: string; // 크리에이터 ID
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FreeGift {
  id: string;
  name: string; // 사은품명
  description?: string;
  giftProductId: string; // 사은품 상품 ID
  minPurchaseAmount?: number; // 최소 구매 금액
  minQuantity?: number; // 최소 구매 수량
  productIds?: string[]; // 적용 가능한 상품 ID 목록
  validFrom: string;
  validUntil: string;
  stock: number; // 사은품 재고
  usageLimit?: number; // 총 제공 제한
  usageCount: number; // 현재 제공 횟수
  bjId?: string; // 크리에이터 ID
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponCreateInput {
  name: string;
  code?: string; // 자동 생성 가능
  description?: string;
  type: DiscountType;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  perUserLimit?: number;
  bjId?: string;
  productIds?: string[];
  categoryIds?: string[];
}

export interface BuyOneGetOneCreateInput {
  name: string;
  description?: string;
  productId: string;
  freeProductId?: string;
  minQuantity: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  bjId?: string;
}

export interface FreeGiftCreateInput {
  name: string;
  description?: string;
  giftProductId: string;
  minPurchaseAmount?: number;
  minQuantity?: number;
  productIds?: string[];
  validFrom: string;
  validUntil: string;
  stock: number;
  usageLimit?: number;
  bjId?: string;
}

export interface CouponValidation {
  isValid: boolean;
  error?: string;
  discountAmount?: number; // 적용 가능한 할인 금액
}
