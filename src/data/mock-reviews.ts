/**
 * 리뷰 Mock 데이터
 */

export interface MockReview {
  id: string;
  product_id: string;
  user_id: string;
  order_id?: string;
  order_item_id?: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  is_visible: boolean;
  created_at: string;
  user?: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
}

export const mockReviews: MockReview[] = [
  {
    id: 'review-1',
    product_id: 'product-1',
    user_id: 'user-1',
    order_id: 'order-1',
    rating: 5,
    title: '정말 맛있어요!',
    content: '신선하고 맛있습니다. 다음에도 주문할게요.',
    images: [],
    is_verified_purchase: true,
    helpful_count: 12,
    is_visible: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-1',
      name: '김고객',
      avatar_url: undefined,
    },
  },
  {
    id: 'review-2',
    product_id: 'product-1',
    user_id: 'user-2',
    order_id: 'order-2',
    rating: 4,
    title: '좋아요',
    content: '가격 대비 품질이 좋습니다.',
    images: [],
    is_verified_purchase: true,
    helpful_count: 5,
    is_visible: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-2',
      name: '이구매',
      avatar_url: undefined,
    },
  },
  {
    id: 'review-3',
    product_id: 'product-2',
    user_id: 'user-3',
    order_id: 'order-3',
    rating: 5,
    title: '최고예요!',
    content: '정말 신선하고 맛있어요. 강력 추천합니다.',
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'],
    is_verified_purchase: true,
    helpful_count: 20,
    is_visible: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'user-3',
      name: '박리뷰',
      avatar_url: undefined,
    },
  },
];

// 로컬 스토리지 키
const REVIEWS_STORAGE_KEY = 'livecommerce_reviews';

/**
 * 로컬 스토리지에서 리뷰 가져오기
 */
export function getLocalReviews(): MockReview[] {
  if (typeof window === 'undefined') return mockReviews;
  
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return [...mockReviews, ...parsed];
    }
  } catch (error) {
    console.error('리뷰 로드 오류:', error);
  }
  
  return mockReviews;
}

/**
 * 로컬 스토리지에 리뷰 저장
 */
export function saveLocalReview(review: MockReview): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getLocalReviews();
    const filtered = existing.filter((r) => r.id !== review.id);
    const updated = [...filtered, review];
    
    // mock 데이터 제외하고 저장
    const customReviews = updated.filter((r) => !mockReviews.find((mr) => mr.id === r.id));
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(customReviews));
  } catch (error) {
    console.error('리뷰 저장 오류:', error);
  }
}

/**
 * 로컬 스토리지에서 리뷰 삭제
 */
export function deleteLocalReview(reviewId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getLocalReviews();
    const filtered = existing.filter((r) => r.id !== reviewId);
    
    // mock 데이터 제외하고 저장
    const customReviews = filtered.filter((r) => !mockReviews.find((mr) => mr.id === r.id));
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(customReviews));
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
  }
}
