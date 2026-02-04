'use client';

import { useState, useEffect } from 'react';
import { regionSpecialties } from '@/data/korea-regions';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Package, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegionSpecialtyListProps {
  regionId: string;
}

export function RegionSpecialtyList({ regionId }: RegionSpecialtyListProps) {
  const [isLoading, setIsLoading] = useState(false);
  const specialties = regionSpecialties[regionId] || [];

  // 현재 계절 계산
  const currentMonth = new Date().getMonth() + 1;
  const getSeasonStatus = () => {
    if (currentMonth >= 3 && currentMonth <= 5) return '봄';
    if (currentMonth >= 6 && currentMonth <= 8) return '여름';
    if (currentMonth >= 9 && currentMonth <= 11) return '가을';
    return '겨울';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 sm:h-36 rounded-xl" />
        ))}
      </div>
    );
  }

  if (specialties.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        등록된 특산물이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {specialties.map((specialty, index) => (
        <div
          key={index}
          className={cn(
            'group relative overflow-hidden rounded-xl border',
            'bg-gradient-to-br from-card via-card/80 to-card/60',
            'border-zinc-800/80 hover:border-amber-500/50',
            'transition-all duration-300 hover:-translate-y-1',
            'shadow-lg hover:shadow-xl hover:shadow-amber-500/10'
          )}
        >
          {/* 배경 그라데이션 효과 */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* 내용 */}
          <div className="relative p-4 sm:p-5">
            {/* 아이콘 */}
            <div className="mb-3 sm:mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400" />
              </div>
            </div>

            {/* 특산물명 */}
            <h4 className="text-base sm:text-lg font-bold mb-2 group-hover:text-amber-300 transition-colors">
              {specialty}
            </h4>

            {/* 계절 정보 */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>연중 판매</span>
            </div>

            {/* 호버 시 글로우 효과 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/10 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
          </div>

          {/* 입체감을 위한 그림자 */}
          <div className="absolute inset-0 rounded-xl shadow-[inset_0_1px_10px_rgba(0,0,0,0.3)] pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
