/**
 * 인피니트 스크롤 훅
 */

import { useEffect, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number; // 트리거 거리 (px)
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
}: UseInfiniteScrollOptions) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observerRef.current = observer;

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, onLoadMore, threshold]);

  return targetRef;
}
