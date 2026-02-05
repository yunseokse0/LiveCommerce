'use client';

import { useLiveRanking } from '@/store/live-ranking';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Link from 'next/link';
import { formatNumber } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function RankingTable() {
  const { ranking, isLoading } = useLiveRanking();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8 space-y-2">
      {ranking.map((entry) => (
        <Link
          key={entry.bj.id}
          href={`/live?stream=${entry.bj.id}`}
          className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-zinc-800/80 active:border-amber-500/50 transition-all duration-300 active:scale-[0.98] touch-manipulation"
        >
          <div className="w-8 sm:w-10 md:w-12 text-center flex-shrink-0">
            <span className="text-sm sm:text-base md:text-lg font-bold text-zinc-400">#{entry.rank}</span>
          </div>
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={entry.bj.thumbnailUrl}
              alt={entry.bj.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 48px, (max-width: 768px) 56px, 64px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{entry.bj.name}</h3>
              {entry.diffFromYesterday > 0 && (
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
              )}
              {entry.diffFromYesterday < 0 && (
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-zinc-400">
              <span className="whitespace-nowrap">{formatNumber(entry.viewerCount)}{t('live.viewers')} {t('live.watching')}</span>
              <span>•</span>
              <span className="whitespace-nowrap">{entry.currentScore.toFixed(1)}{t('ranking.score')}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
