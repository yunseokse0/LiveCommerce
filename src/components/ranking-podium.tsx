'use client';

import { useLiveRanking } from '@/store/live-ranking';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export function RankingPodium() {
  const { ranking, isLoading } = useLiveRanking();

  if (isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  const top3 = ranking.slice(0, 3);

  if (top3.length < 3) {
    return null;
  }

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 px-2">
      {/* 2위 */}
      <Link
        href={`/live?stream=${top3[1].bj.id}`}
        className="flex flex-col items-center group touch-manipulation active:scale-95 transition-transform"
      >
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-1.5 sm:mb-2 border-2 border-zinc-400 group-active:border-amber-500/50 transition-colors">
          <Image
            src={top3[1].bj.thumbnailUrl}
            alt={top3[1].bj.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 80px"
          />
        </div>
        <div className="bg-zinc-400/20 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg mb-1 sm:mb-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-zinc-400" />
        </div>
        <span className="text-xs sm:text-sm font-semibold">2위</span>
        <span className="text-[10px] sm:text-xs text-zinc-400 text-center line-clamp-1 max-w-[60px] sm:max-w-none">
          {top3[1].bj.name}
        </span>
      </Link>

      {/* 1위 */}
      <Link
        href={`/live?stream=${top3[0].bj.id}`}
        className="flex flex-col items-center group touch-manipulation active:scale-95 transition-transform"
      >
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-1.5 sm:mb-2 border-2 border-yellow-300 group-active:border-amber-500 transition-colors">
          <Image
            src={top3[0].bj.thumbnailUrl}
            alt={top3[0].bj.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
          />
        </div>
        <div className="bg-yellow-300/20 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg mb-1 sm:mb-2">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-yellow-300" />
        </div>
        <span className="text-sm sm:text-base font-bold">1위</span>
        <span className="text-xs sm:text-sm text-zinc-300 text-center line-clamp-1 max-w-[70px] sm:max-w-none">
          {top3[0].bj.name}
        </span>
      </Link>

      {/* 3위 */}
      <Link
        href={`/live?stream=${top3[2].bj.id}`}
        className="flex flex-col items-center group touch-manipulation active:scale-95 transition-transform"
      >
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-1.5 sm:mb-2 border-2 border-amber-600 group-active:border-amber-500/50 transition-colors">
          <Image
            src={top3[2].bj.thumbnailUrl}
            alt={top3[2].bj.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 56px, (max-width: 768px) 64px, 80px"
          />
        </div>
        <div className="bg-amber-600/20 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg mb-1 sm:mb-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-600" />
        </div>
        <span className="text-xs sm:text-sm font-semibold">3위</span>
        <span className="text-[10px] sm:text-xs text-zinc-400 text-center line-clamp-1 max-w-[60px] sm:max-w-none">
          {top3[2].bj.name}
        </span>
      </Link>
    </div>
  );
}
