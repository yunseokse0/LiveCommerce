'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Play, Eye, Clock } from 'lucide-react';
import type { LiveEntry } from '@/types/bj';
import { PlatformBadge } from './platform-badge';
import { useTranslation } from '@/hooks/use-translation';

interface LiveStreamCardProps {
  stream: LiveEntry;
  showRank?: boolean;
  rank?: number;
}

export function LiveStreamCard({ stream, showRank = false, rank }: LiveStreamCardProps) {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // 플레이어 모달 열기
    router.push(`/live?stream=${stream.bj.id}`, { scroll: false });
  };

  const formatViewerCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}만`;
    }
    return count.toLocaleString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (stream.isLive) {
      if (diffMins < 60) {
        return t('live.startedMinutesAgo', { minutes: diffMins });
      } else if (diffHours < 24) {
        return t('live.startedHoursAgo', { hours: diffHours });
      } else {
        return t('live.startedDaysAgo', { days: diffDays });
      }
    } else {
      if (diffMins < 60) {
        return t('live.endedMinutesAgo', { minutes: diffMins });
      } else if (diffHours < 24) {
        return t('live.endedHoursAgo', { hours: diffHours });
      } else {
        return t('live.endedDaysAgo', { days: diffDays });
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group relative w-full text-left block rounded-2xl overflow-hidden border border-zinc-800/80 bg-card/50 backdrop-blur-sm hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 active:scale-[0.98] touch-manipulation"
    >
      {/* 썸네일 */}
      <div className="relative aspect-video bg-zinc-900 overflow-hidden">
        {!imageError && stream.thumbnailUrl ? (
          <Image
            src={stream.thumbnailUrl}
            alt={stream.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Play className="w-12 h-12 text-zinc-600" />
          </div>
        )}

        {/* 라이브 배지 */}
        {stream.isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-semibold text-white">LIVE</span>
          </div>
        )}

        {/* 순위 배지 */}
        {showRank && rank && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-500/90 backdrop-blur-sm flex items-center justify-center">
            <span className="text-sm font-bold text-black">{rank}</span>
          </div>
        )}

        {/* 시청자 수 */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
          <Eye className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-medium text-white">
            {formatViewerCount(stream.viewerCount)} {t('live.viewers')}
          </span>
        </div>

        {/* 플레이 오버레이 */}
        {!stream.isLive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="p-4">
        {/* 크리에이터 정보 */}
        {stream.bj && (
          <div className="flex items-center gap-2 mb-2">
            {stream.bj.profileImageUrl ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={stream.bj.profileImageUrl}
                  alt={stream.bj.name}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-zinc-700 flex-shrink-0" />
            )}
            <span className="text-sm text-zinc-400 truncate">{stream.bj.name}</span>
            <PlatformBadge platform={stream.platform || 'youtube'} />
          </div>
        )}

        {/* 제목 */}
        <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
          {stream.title}
        </h3>

        {/* 시간 정보 */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimeAgo(stream.startedAt)}</span>
        </div>
      </div>
    </button>
  );
}
