/**
 * 상품 관련 타입 정의
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  thumbnailUrl?: string; // 썸네일 이미지
  imageUrl?: string; // 대표 이미지
  detailImages?: string[]; // 상세 이미지 배열
  detailDescription?: string; // 상세 설명 (HTML 가능)
  bjId?: string;
  localProductId?: string;
  category?: string;
  tags?: string[]; // 태그 배열
  isSpecialty?: boolean; // 특산물 여부
  specialtyId?: string; // 특산물 ID (region-specialties 참조)
  regionId?: string; // 생산 지역 ID
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  thumbnailUrl?: string;
  imageUrl?: string;
  detailImages?: string[];
  detailDescription?: string;
  bjId?: string;
  localProductId?: string;
  category?: string;
  tags?: string[];
  isSpecialty?: boolean;
  specialtyId?: string;
  regionId?: string;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  thumbnailUrl?: string;
  imageUrl?: string;
  detailImages?: string[];
  detailDescription?: string;
  category?: string;
  tags?: string[];
  isSpecialty?: boolean;
  specialtyId?: string;
  regionId?: string;
  isActive?: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  sessionId?: string;
  totalAmount: number;
  discountAmount?: number; // 할인 금액
  coinPaymentAmount?: number; // 코인으로 결제한 금액
  finalAmount?: number; // 최종 결제 금액
  coinEarned?: number; // 적립된 코인 수
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  shippingAddress?: string;
  couponCode?: string; // 사용된 쿠폰 코드
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  freeGifts?: OrderFreeGift[]; // 사은품 목록
}

export interface OrderFreeGift {
  id: string;
  orderId: string;
  giftProductId: string;
  quantity: number;
  product?: Product;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  quantity: number;
  price: number;
  createdAt: string;
  product?: Product;
}

export interface OrderCreateInput {
  items: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress?: string;
  couponCode?: string; // 쿠폰 코드
  appliedPromotions?: {
    bogo?: string[]; // 적용된 1+1 프로모션 ID
    freeGifts?: string[]; // 적용된 사은품 프로모션 ID
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}
