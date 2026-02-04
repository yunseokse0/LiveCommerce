'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import type { BJ } from '@/types/bj';
import { Plus, Trash2 } from 'lucide-react';

export function BJList() {
  const [bjs, setBjs] = useState<BJ[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBJs();
  }, []);

  const fetchBJs = async () => {
    try {
      // TODO: API 구현
      setIsLoading(false);
    } catch (error) {
      console.error('크리에이터 목록 조회 오류:', error);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold">크리에이터 목록</h3>
        <Button size="sm" className="touch-manipulation">
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          <span className="hidden sm:inline">추가</span>
        </Button>
      </div>
      
      <div className="space-y-2">
        {bjs.length === 0 ? (
          <div className="text-center py-6 sm:py-8 text-zinc-400 text-sm sm:text-base">
            등록된 크리에이터가 없습니다.
          </div>
        ) : (
          bjs.map((bj) => (
            <div
              key={bj.id}
              className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-zinc-800/80"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={bj.thumbnailUrl}
                  alt={bj.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 40px, 48px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base truncate">{bj.name}</h4>
                <p className="text-xs sm:text-sm text-zinc-400 truncate">{bj.platform}</p>
              </div>
              <Button variant="ghost" size="sm" className="flex-shrink-0 touch-manipulation">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
