'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X, Bell, ShoppingCart, Clock } from 'lucide-react';
import { useLiveRanking } from '@/store/live-ranking';
import { extractYouTubeVideoId } from '@/lib/utils';
import { PlatformBadge } from '@/components/platform-badge';
import { LiveChat } from '@/components/live-chat';
import { NativePlayer } from '@/components/native-player';
import { LiveProductPopup } from '@/components/live-product-popup';
import type { BJ } from '@/types/bj';
import type { Product } from '@/types/product';
import { useCart } from '@/store/cart';
import { useNotifications } from '@/store/notifications';

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
  const [offerEndsAt, setOfferEndsAt] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const { addItem } = useCart();
  const { addNotification } = useNotifications();

  useEffect(() => {
    setIsOpen(true);
  }, []);

  // 현재 소개 중인 상품 로드
  useEffect(() => {
    if (!featuredProductId) {
      setFeaturedProduct(null);
      setShowProductPopup(false);
      setOfferEndsAt(null);
      return;
    }

    // Mock 데이터에서 먼저 찾기
    import('@/data/mock-products').then(({ mockProducts }) => {
      const product = mockProducts.find((p) => p.id === featuredProductId);
      if (product) {
        setFeaturedProduct(product);
        setShowProductPopup(true);
        setOfferEndsAt(Date.now() + 10 * 60 * 1000);
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
          setOfferEndsAt(Date.now() + 10 * 60 * 1000);
        } else {
          // API 실패 시 Mock 데이터 재시도
          import('@/data/mock-products').then(({ mockProducts }) => {
            const product = mockProducts.find((p) => p.id === featuredProductId);
            if (product) {
              setFeaturedProduct(product);
              setShowProductPopup(true);
              setOfferEndsAt(Date.now() + 10 * 60 * 1000);
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
            setOfferEndsAt(Date.now() + 10 * 60 * 1000);
          }
        });
      });
  }, [featuredProductId]);

  useEffect(() => {
    if (!offerEndsAt) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const r = Math.max(0, Math.floor((offerEndsAt - Date.now()) / 1000));
      setRemaining(r);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [offerEndsAt]);

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

  const handleStickyAddToCart = () => {
    if (featuredProduct) {
      addItem(featuredProduct, 1);
    }
  };

  const handleStickyBuyNow = () => {
    if (featuredProduct) {
      addItem(featuredProduct, 1);
      router.push('/cart');
    }
  };

  const handleSubscribe = () => {
    addNotification({
      type: 'info',
      title: '라이브 알림 구독됨',
      message: `${bj.name} 라이브 알림을 설정했습니다.`,
      link: `/?stream=${bj.id}`,
      linkText: '바로 시청',
      category: 'live',
    });
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

      {featuredProduct && (
        <div className="fixed left-0 right-0 bottom-0 z-[10000]">
          <div className="mx-auto max-w-5xl">
            <div className="m-3 sm:m-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 to-amber-700/20 shadow-xl">
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                {featuredProduct.thumbnailUrl ? (
                  <img src={featuredProduct.thumbnailUrl} alt={featuredProduct.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-black/50 border border-amber-500/30 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-semibold truncate">{featuredProduct.name}</h3>
                    <button onClick={handleSubscribe} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border border-amber-500/40 hover:bg-amber-500/20 transition">
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-amber-400">알림 받기</span>
                    </button>
                  </div>
                  <div className="text-xs sm:text-sm text-amber-300 font-bold mt-0.5">
                    ₩{featuredProduct.price.toLocaleString()} · 잔여 {featuredProduct.stock}개
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 mr-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-200">{Math.floor(remaining / 60)
                    .toString()
                    .padStart(2, '0')}:{(remaining % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleStickyAddToCart} className="px-3 sm:px-4 py-2 rounded-xl bg-black/60 border border-amber-500/40 text-amber-300 hover:bg-black/80 transition">
                    담기
                  </button>
                  <button onClick={handleStickyBuyNow} className="px-3 sm:px-4 py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-black font-semibold transition inline-flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    즉시구매
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
