'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import { Play, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LiveEntry } from '@/types/bj';

interface RegionLiveStreamsProps {
  regionId: string;
}

export function RegionLiveStreams({ regionId }: RegionLiveStreamsProps) {
  const [streams, setStreams] = useState<LiveEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/region-streams?regionId=${regionId}`);
        const data = await response.json();
        if (data.success) {
          setStreams(data.streams);
        }
      } catch (error) {
        console.error('지역 방송 조회 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (regionId) {
      fetchStreams();
    }
  }, [regionId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 sm:h-56 rounded-xl" />
        ))}
      </div>
    );
  }

  if (filteredStreams.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl border border-zinc-800/80 bg-card/50">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800/50 mb-4">
          <Play className="w-8 h-8 text-zinc-500" />
        </div>
        <p className="text-zinc-400">현재 이 지역의 라이브 방송이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {streams.map((live) => (
        <Link
          key={live.bj.id}
          href={`/live?stream=${live.bj.id}`}
          className={cn(
            'group relative block rounded-xl overflow-hidden border',
            'bg-gradient-to-br from-card via-card/90 to-card/80',
            'border-zinc-800/80 active:border-amber-500/50',
            'transition-all duration-300 active:scale-[0.98]',
            'shadow-lg hover:shadow-xl hover:shadow-amber-500/10',
            'touch-manipulation'
          )}
        >
          {/* 썸네일 */}
          <div className="relative aspect-video">
            {live.thumbnailUrl ? (
              <Image
                src={live.thumbnailUrl}
                alt={live.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900" />
            )}

            {/* 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* LIVE 배지 */}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded backdrop-blur-sm">
                LIVE
              </span>
            </div>

            {/* 플레이 아이콘 */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity md:group-hover:opacity-100">
              <div className="bg-black/70 rounded-full p-3 backdrop-blur-sm">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
              </div>
            </div>

            {/* 시청자 수 */}
            <div className="absolute bottom-2 right-2">
              <span className="px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-sm">
                {formatNumber(live.viewerCount)}명
              </span>
            </div>
          </div>

          {/* 정보 */}
          <div className="p-3 sm:p-4 relative">
            {/* 지역 배지 */}
            <div className="flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] sm:text-xs text-amber-400 font-medium">
                지역 방송
              </span>
            </div>

            {/* 제목 */}
            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1.5 group-hover:text-amber-300 transition-colors">
              {live.title}
            </h3>

            {/* 크리에이터명 */}
            <p className="text-xs sm:text-sm text-zinc-400 truncate">
              {live.bj.name}
            </p>

            {/* 호버 시 글로우 효과 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
          </div>

          {/* 입체감 그림자 */}
          <div className="absolute inset-0 rounded-xl shadow-[inset_0_1px_10px_rgba(0,0,0,0.3)] pointer-events-none" />
        </Link>
      ))}
    </div>
  );
}
