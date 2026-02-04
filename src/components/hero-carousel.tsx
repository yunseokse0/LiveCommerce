'use client';

import { useLiveRanking } from '@/store/live-ranking';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';

export function HeroCarousel() {
  const { liveList, isLoading } = useLiveRanking();

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  const featuredLive = liveList
    .filter((live) => live.title.toLowerCase().includes('엑셀'))
    .sort((a, b) => b.viewerCount - a.viewerCount)[0] || liveList[0];

  if (!featuredLive) {
    return null;
  }

  return (
    <section className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl md:rounded-2xl overflow-hidden border border-zinc-800/80">
      <Link href={`/live?stream=${featuredLive.bj.id}`} className="block h-full">
        <div className="relative w-full h-full">
          {featuredLive.thumbnailUrl && (
            <Image
              src={featuredLive.thumbnailUrl}
              alt={featuredLive.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
              <span className="px-2 py-0.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-semibold rounded">
                LIVE
              </span>
              <span className="text-xs sm:text-sm text-zinc-300">
                {featuredLive.viewerCount.toLocaleString()}명 시청
              </span>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-0.5 sm:mb-1 line-clamp-2">
              {featuredLive.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 truncate">{featuredLive.bj.name}</p>
          </div>
        </div>
      </Link>
    </section>
  );
}
