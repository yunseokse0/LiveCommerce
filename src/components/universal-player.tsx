'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useLiveRanking } from '@/store/live-ranking';
import { extractYouTubeVideoId } from '@/lib/utils';
import { PlatformBadge } from '@/components/platform-badge';
import { LiveChat } from '@/components/live-chat';
import { NativePlayer } from '@/components/native-player';
import { LiveProductPopup } from '@/components/live-product-popup';
import type { BJ } from '@/types/bj';
import type { Product } from '@/types/product';

interface UniversalPlayerProps {
  bj: BJ;
  title: string;
  streamUrl: string;
  hlsUrl?: string; // 자체 플랫폼 HLS 스트림 URL
  featuredProductId?: string; // 현재 소개 중인 상품 ID
}

export function UniversalPlayer({ bj, title, streamUrl, hlsUrl, featuredProductId }: UniversalPlayerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [showProductPopup, setShowProductPopup] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  // 현재 소개 중인 상품 로드
  useEffect(() => {
    if (!featuredProductId) {
      setFeaturedProduct(null);
      setShowProductPopup(false);
      return;
    }

    // Mock 데이터에서 먼저 찾기
    import('@/data/mock-products').then(({ mockProducts }) => {
      const product = mockProducts.find((p) => p.id === featuredProductId);
      if (product) {
        setFeaturedProduct(product);
        setShowProductPopup(true);
        return;
      }
    });

    // API 호출
    fetch(`/api/products/${featuredProductId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          setFeaturedProduct(data.product);
          setShowProductPopup(true);
        } else {
          // API 실패 시 Mock 데이터 재시도
          import('@/data/mock-products').then(({ mockProducts }) => {
            const product = mockProducts.find((p) => p.id === featuredProductId);
            if (product) {
              setFeaturedProduct(product);
              setShowProductPopup(true);
            }
          });
        }
      })
      .catch((error) => {
        console.error('상품 조회 오류:', error);
        // 에러 발생 시 Mock 데이터 재시도
        import('@/data/mock-products').then(({ mockProducts }) => {
          const product = mockProducts.find((p) => p.id === featuredProductId);
          if (product) {
            setFeaturedProduct(product);
            setShowProductPopup(true);
          }
        });
      });
  }, [featuredProductId]);

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  const handleProductPopupClose = () => {
    setShowProductPopup(false);
  };

  const handleAddToCart = () => {
    // 구매 알림은 LiveChat에서 처리
    // 여기서는 팝업만 닫지 않고 유지
    if (featuredProduct) {
      // LiveChat에 구매 알림 전달 (useChat 훅을 통해)
      // 실제로는 LiveChat 컴포넌트 내부에서 처리
    }
  };

  if (!isOpen) return null;

  const videoId = bj.platform === 'youtube' ? extractYouTubeVideoId(streamUrl) : null;
  // YouTube 영상 재생을 위한 최적화된 embed URL
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}&mute=0`
    : null;

  return (
    <div className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-sm">
      {/* 닫기 버튼 */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <button
          onClick={handleClose}
          className="p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-black/90 active:bg-black transition-colors touch-manipulation"
          aria-label="닫기"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      </div>

      {/* 모바일: 세로 레이아웃 (비디오 → 제목 → 채팅) */}
      <div className="h-full flex flex-col md:flex-row">
        {/* 비디오 플레이어 */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 relative min-h-[200px] sm:min-h-[300px] md:min-h-0 bg-black">
            {bj.platform === 'youtube' && embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ minHeight: '200px' }}
                frameBorder="0"
                title={title}
              />
            ) : bj.platform === 'native' && hlsUrl ? (
              <NativePlayer
                hlsUrl={hlsUrl}
                autoplay={true}
                controls={true}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm sm:text-base">
                {hlsUrl ? '스트림을 로딩 중...' : '스트림 URL이 없습니다.'}
              </div>
            )}
          </div>
          {/* 제목 및 정보 */}
          <div className="p-3 sm:p-4 border-t border-zinc-800/80 flex-shrink-0">
            <div className="flex items-start gap-2 mb-1.5 sm:mb-2">
              <PlatformBadge platform={bj.platform} className="flex-shrink-0" />
              <h2 className="text-sm sm:text-base md:text-lg font-semibold line-clamp-2 flex-1">
                {title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 truncate">{bj.name}</p>
          </div>
        </div>

        {/* 채팅 - 모바일: 하단, 데스크톱: 오른쪽 */}
        <div className="w-full md:w-80 h-[40vh] md:h-full border-t md:border-t-0 md:border-l border-zinc-800/80 flex-shrink-0">
          <LiveChat streamId={bj.id} creatorId={bj.id} onPurchaseNotification={handleAddToCart} />
        </div>
      </div>

      {/* 실시간 상품 팝업 */}
      {showProductPopup && featuredProduct && (
        <LiveProductPopup
          product={featuredProduct}
          streamId={bj.id}
          onClose={handleProductPopupClose}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}
