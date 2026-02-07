'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLiveRanking } from '@/store/live-ranking';
import { koreaRegions, regionSpecialties } from '@/data/korea-regions';
import { koreaMapPathDetailed } from '@/data/korea-map-svg';
import type { Region } from '@/types/region';
import { Sparkles, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface KoreaMapProps {
  onRegionSelect?: (region: Region) => void;
  selectedRegionId?: string;
}

export function KoreaMap({ onRegionSelect, selectedRegionId }: KoreaMapProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [regionLiveCounts, setRegionLiveCounts] = useState<Record<string, number>>({});
  const { liveList } = useLiveRanking();
  const { t } = useTranslation();

  // 클라이언트에서만 실행되도록 useEffect 사용
  useEffect(() => {
    // 지역별 라이브 방송 수 계산 (프론트엔드 확인용 고정값)
    const counts: Record<string, number> = {};
    koreaRegions.forEach((region) => {
      // 지역 ID를 기반으로 일관된 값 생성 (Hydration 에러 방지)
      const hash = region.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      counts[region.id] = hash % 5; // 0-4 사이의 고정값
    });
    setRegionLiveCounts(counts);
  }, []);

  // 지역별 라이브 방송 수 계산
  const getRegionLiveCount = (regionId: string) => {
    return regionLiveCounts[regionId] || 0;
  };

  const handleRegionClick = (region: Region) => {
    onRegionSelect?.(region);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* 한국 지도 이미지 컨테이너 */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5]">
        {/* 배경 그라데이션 효과 - 역동적인 애니메이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-background to-emerald-900/20 rounded-3xl overflow-hidden">
          {/* 움직이는 그라데이션 오버레이 */}
          <div className="absolute inset-0 shimmer-animation bg-gradient-to-r from-transparent via-amber-500/5 to-transparent pointer-events-none" />
          {/* 지도 이미지 컨테이너 */}
          <div className="relative w-full h-full">
              {/* 한국 지도 SVG (오픈소스 데이터 기반) */}
            <svg
              viewBox="0 0 600 1200"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* 지도 그라데이션 */}
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(30, 30, 40, 0.95)" />
                  <stop offset="30%" stopColor="rgba(40, 35, 50, 0.9)" />
                  <stop offset="70%" stopColor="rgba(35, 35, 45, 0.85)" />
                  <stop offset="100%" stopColor="rgba(25, 25, 35, 0.95)" />
                </linearGradient>
                
                {/* 입체감 그림자 필터 */}
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                  <feOffset dx="3" dy="3" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.4"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                {/* 글로우 효과 */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(251, 191, 36, 0.4)" />
                  <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
                </linearGradient>
              </defs>
              
              {/* 한국 본토 - 오픈소스 데이터 기반 */}
              <g filter="url(#shadow)">
                <path
                  d={koreaMapPathDetailed.mainland}
                  fill="url(#mapGradient)"
                  stroke="rgba(251, 191, 36, 0.5)"
                  strokeWidth="4"
                  className="transition-all duration-500"
                />
                
                {/* 제주도 */}
                <path
                  d={koreaMapPathDetailed.jeju}
                  fill="url(#mapGradient)"
                  stroke="rgba(251, 191, 36, 0.5)"
                  strokeWidth="3"
                  className="transition-all duration-500"
                />
                
                {/* 지형감을 위한 하이라이트 */}
                <path
                  d={koreaMapPathDetailed.mainland}
                  fill="url(#highlightGradient)"
                  opacity="0.25"
                  className="pointer-events-none"
                />
              </g>
              
              {/* 입체감을 위한 추가 레이어 */}
              <g opacity="0.15">
                <path
                  d={koreaMapPathDetailed.mainland}
                  fill="white"
                  transform="translate(6, 6)"
                />
              </g>
            </svg>
              
              {/* 실제 한국 지도 이미지를 사용하려면 아래 주석을 해제하고 이미지 URL을 설정하세요 */}
              {/* 
              <Image
                src="/korea-map.png"
                alt="한국 지도"
                fill
                className="object-contain opacity-90"
                priority
              />
              */}

            {/* 지역 마커들 */}
            {koreaRegions.map((region) => {
              const isSelected = selectedRegionId === region.id;
              const isHovered = hoveredRegionId === region.id;
              const liveCount = getRegionLiveCount(region.id);
              const specialties = regionSpecialties[region.id] || [];

              return (
                <div
                  key={region.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{
                    left: `${region.centerX}%`,
                    top: `${region.centerY}%`,
                  }}
                  onMouseEnter={() => setHoveredRegionId(region.id)}
                  onMouseLeave={() => setHoveredRegionId(null)}
                  onClick={() => handleRegionClick(region)}
                >
                  {/* 지역 포인트 */}
                  <div className="relative group cursor-pointer touch-manipulation">
                    {/* 펄스 애니메이션 (라이브 방송이 있을 때) - 역동적인 효과 */}
                    {liveCount > 0 && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-amber-500/40 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                        <div className="absolute inset-0 rounded-full bg-red-500/30 animate-pulse" />
                      </>
                    )}

                    {/* 메인 마커 */}
                    <div
                      className={cn(
                        'relative rounded-full transition-all duration-300',
                        'shadow-lg backdrop-blur-sm',
                        {
                          'scale-125 z-20': isSelected || isHovered,
                          'scale-100 z-10': !isSelected && !isHovered,
                        }
                      )}
                    >
                      {/* 외곽 글로우 효과 */}
                      <div
                        className={cn(
                          'absolute inset-0 rounded-full blur-md transition-all duration-300',
                          {
                            'bg-amber-500/50 scale-150': isSelected || isHovered,
                            'bg-amber-500/20 scale-100': !isSelected && !isHovered,
                          }
                        )}
                      />

                      {/* 내부 원 - 입체감 강화 */}
                      <div
                        className={cn(
                          'relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full',
                          'flex items-center justify-center',
                          'border-2 transition-all duration-300',
                          'before:absolute before:inset-0 before:rounded-full before:opacity-50',
                          {
                            'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.8),inset_0_2px_10px_rgba(251,191,36,0.3)] before:bg-gradient-to-br before:from-white/20 before:to-transparent':
                              isSelected,
                            'bg-gradient-to-br from-amber-500/80 via-amber-600/80 to-amber-700/80 border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.5),inset_0_1px_5px_rgba(251,191,36,0.2)] before:bg-gradient-to-br before:from-white/10 before:to-transparent':
                              isHovered && !isSelected,
                            'bg-gradient-to-br from-zinc-600/60 via-zinc-700/60 to-zinc-800/60 border-zinc-500/30 shadow-[0_0_15px_rgba(0,0,0,0.4),inset_0_1px_5px_rgba(0,0,0,0.2)] before:bg-gradient-to-br before:from-white/5 before:to-transparent':
                              !isSelected && !isHovered,
                          }
                        )}
                      >
                        {/* 아이콘 */}
                        {liveCount > 0 ? (
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        ) : (
                          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-300/70" />
                        )}

                        {/* 라이브 카운트 배지 */}
                        {liveCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background">
                            <span className="text-[8px] sm:text-[10px] font-bold text-white">
                              {liveCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 호버/선택 시 정보 툴팁 */}
                    {(isHovered || isSelected) && (
                      <div
                        className={cn(
                          'absolute top-full left-1/2 transform -translate-x-1/2 mt-2',
                          'px-3 py-2 rounded-lg bg-card/95 backdrop-blur-md',
                          'border border-amber-500/50 shadow-xl',
                          'min-w-[120px] sm:min-w-[150px]',
                          'animate-in fade-in slide-in-from-top-2 duration-200',
                          'z-30'
                        )}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <div className="text-xs sm:text-sm font-semibold text-amber-300 mb-1">
                          {region.name}
                        </div>
                        {specialties.length > 0 && (
                          <div className="text-[10px] sm:text-xs text-zinc-400">
                            {specialties.slice(0, 2).join(', ')}
                            {specialties.length > 2 && '...'}
                          </div>
                        )}
                        {liveCount > 0 && (
                          <div className="text-[10px] sm:text-xs text-red-400 mt-1">
                            {t('map.liveNowCount', { count: liveCount })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 입체감을 위한 그림자 효과 */}
        <div className="absolute inset-0 rounded-3xl shadow-[inset_0_2px_20px_rgba(0,0,0,0.5),0_10px_40px_rgba(0,0,0,0.3)] pointer-events-none" />
      </div>
    </div>
  );
}
