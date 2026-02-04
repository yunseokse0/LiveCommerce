'use client';

import { useState, useEffect } from 'react';
import { useLiveRanking } from '@/store/live-ranking';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useLiveRankingPolling } from '@/hooks/use-live-ranking';
import Image from 'next/image';
import { Save } from 'lucide-react';

export function RankingEditTable() {
  const { ranking, isLoading } = useLiveRanking();
  useLiveRankingPolling(30000);
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});

  const handleScoreChange = (bjId: string, score: number) => {
    setEditedScores((prev) => ({
      ...prev,
      [bjId]: score,
    }));
  };

  const handleSave = async (bjId: string) => {
    const newScore = editedScores[bjId];
    if (newScore === undefined) return;

    try {
      // TODO: API 구현
      const response = await fetch('/api/admin/update-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bjId, score: newScore }),
      });

      if (response.ok) {
        setEditedScores((prev) => {
          const next = { ...prev };
          delete next[bjId];
          return next;
        });
      }
    } catch (error) {
      console.error('점수 업데이트 오류:', error);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  return (
    <div className="space-y-2">
      {ranking.map((entry) => {
        const editedScore = editedScores[entry.bj.id] ?? entry.currentScore;
        const hasChanges = editedScore !== entry.currentScore;

        return (
          <div
            key={entry.bj.id}
            className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-zinc-800/80"
          >
            <div className="w-6 sm:w-8 text-center flex-shrink-0">
              <span className="text-xs sm:text-sm font-semibold">#{entry.rank}</span>
            </div>
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={entry.bj.thumbnailUrl}
                alt={entry.bj.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 32px, 40px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-xs sm:text-sm truncate">{entry.bj.name}</h4>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <input
                type="number"
                value={editedScore}
                onChange={(e) =>
                  handleScoreChange(entry.bj.id, parseFloat(e.target.value) || 0)
                }
                className="w-20 sm:w-24 px-2 py-1.5 sm:py-1 text-xs sm:text-sm rounded bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 touch-manipulation"
              />
              {hasChanges && (
                <Button
                  size="sm"
                  onClick={() => handleSave(entry.bj.id)}
                  className="touch-manipulation"
                >
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
