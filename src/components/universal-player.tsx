'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { useLiveRanking } from '@/store/live-ranking';
import { extractYouTubeVideoId } from '@/lib/utils';
import { PlatformBadge } from '@/components/platform-badge';
import { LiveChat } from '@/components/live-chat';
import { NativePlayer } from '@/components/native-player';
import type { BJ } from '@/types/bj';

interface UniversalPlayerProps {
  bj: BJ;
  title: string;
  streamUrl: string;
  hlsUrl?: string; // 자체 플랫폼 HLS 스트림 URL
}

export function UniversalPlayer({ bj, title, streamUrl, hlsUrl }: UniversalPlayerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    router.back();
  };

  if (!isOpen) return null;

  const videoId = bj.platform === 'youtube' ? extractYouTubeVideoId(streamUrl) : null;
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
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
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                style={{ minHeight: '200px' }}
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
          <LiveChat streamId={bj.id} />
        </div>
      </div>
    </div>
  );
}
