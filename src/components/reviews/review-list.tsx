'use client';

import { useState, useEffect } from 'react';
import { Star, ThumbsUp, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import type { Product } from '@/types/product';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  user?: {
    id: string;
    name?: string;
    avatar_url?: string;
  };
}

interface ReviewListProps {
  productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews || []);
        
        // 평균 평점 계산
        if (data.reviews && data.reviews.length > 0) {
          const avg = data.reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / data.reviews.length;
          setAverageRating(avg);
          setTotalReviews(data.reviews.length);
        }
      }
    } catch (error) {
      console.error('리뷰 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-amber-400 text-amber-400'
            : 'fill-none text-zinc-600'
        }`}
      />
    ));
  };

  if (isLoading) {
    return <div className="text-center py-8 text-zinc-400">로딩 중...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-400">
        아직 작성된 리뷰가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 평점 요약 */}
      <div className="p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {renderStars(Math.round(averageRating))}
            </div>
            <div className="text-sm text-zinc-400 mt-1">{totalReviews}개 리뷰</div>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => Math.round(r.rating) === star).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{star}점</span>
                  <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-zinc-400 w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm"
          >
            <div className="flex items-start gap-4">
              {/* 사용자 아바타 */}
              <div className="flex-shrink-0">
                {review.user?.avatar_url ? (
                  <Image
                    src={review.user.avatar_url}
                    alt={review.user.name || '사용자'}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {review.user?.name?.[0] || 'U'}
                    </span>
                  </div>
                )}
              </div>

              {/* 리뷰 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">
                    {review.user?.name || '익명'}
                  </span>
                  {review.is_verified_purchase && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                      구매인증
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold mb-1">{review.title}</h4>
                )}

                <p className="text-sm text-zinc-300 mb-3 whitespace-pre-wrap">
                  {review.content}
                </p>

                {/* 리뷰 이미지 */}
                {review.images && review.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                    {review.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-zinc-800 border border-zinc-800/80"
                      >
                        <Image
                          src={imageUrl}
                          alt={`리뷰 이미지 ${index + 1}`}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {new Date(review.created_at).toLocaleDateString('ko-KR')}
                  </span>
                  <button className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition-colors">
                    <ThumbsUp className="w-3 h-3" />
                    도움됨 ({review.helpful_count})
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
