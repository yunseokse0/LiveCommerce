'use client';

import { useLiveRanking } from '@/store/live-ranking';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { formatNumber } from '@/lib/utils';
import { Play } from 'lucide-react';

export function LiveGrid() {
  const { liveList, isLoading } = useLiveRanking();
  const router = useRouter();

  const handleClick = (live: LiveEntry) => {
    router.push(`/live?stream=${live.bj.id}`, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (liveList.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        현재 라이브 중인 방송이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {liveList.map((live) => (
        <button
          key={live.bj.id}
          onClick={() => handleClick(live)}
          className="group relative w-full text-left block rounded-lg sm:rounded-xl overflow-hidden border border-zinc-800/80 active:border-amber-500/50 transition-all duration-300 active:scale-[0.98] touch-manipulation"
        >
          <div className="relative aspect-video">
            {live.thumbnailUrl ? (
              <Image
                src={live.thumbnailUrl}
                alt={live.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full bg-secondary" />
            )}
            <div className="absolute inset-0 bg-black/30 group-active:bg-black/10 transition-colors" />
            <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded">
                LIVE
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity md:group-hover:opacity-100">
              <div className="bg-black/70 rounded-full p-2 sm:p-3">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
              </div>
            </div>
            <div className="absolute bottom-1.5 sm:bottom-2 right-1.5 sm:right-2">
              <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-black/70 text-white text-[10px] sm:text-xs rounded backdrop-blur-sm">
                {formatNumber(live.viewerCount)}명
              </span>
            </div>
          </div>
          <div className="p-2.5 sm:p-3">
            <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 mb-0.5 sm:mb-1 leading-tight">
              {live.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400 truncate">{live.bj.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
