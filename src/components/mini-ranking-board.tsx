'use client';

import { useLiveRanking } from '@/store/live-ranking';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

export function MiniRankingBoard() {
  const { ranking, isLoading } = useLiveRanking();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  const top5 = ranking.slice(0, 5);

  if (top5.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        랭킹 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {top5.map((entry, index) => (
        <Link
          key={entry.bj.id}
          href={`/live?stream=${entry.bj.id}`}
          className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-zinc-800/80 active:border-amber-500/50 transition-all duration-300 active:scale-[0.98] touch-manipulation"
        >
          <div className="flex-shrink-0 w-6 sm:w-8 text-center">
            {index === 0 && <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 mx-auto" />}
            {index === 1 && <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-400 mx-auto" />}
            {index === 2 && <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 mx-auto" />}
            {index > 2 && (
              <span className="text-xs sm:text-sm font-semibold text-zinc-400">
                {entry.rank}
              </span>
            )}
          </div>
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={entry.bj.thumbnailUrl}
              alt={entry.bj.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 40px, 48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <h3 className="font-semibold text-xs sm:text-sm truncate">{entry.bj.name}</h3>
              {entry.diffFromYesterday > 0 && (
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
              )}
              {entry.diffFromYesterday < 0 && (
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-zinc-400">
              <span>{formatNumber(entry.viewerCount)}명</span>
              <span>•</span>
              <span>{entry.currentScore.toFixed(1)}점</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
