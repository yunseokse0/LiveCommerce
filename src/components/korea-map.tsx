'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLiveRanking } from '@/store/live-ranking';
import { koreaRegions, regionSpecialties } from '@/data/korea-regions';
import type { Region } from '@/types/region';
import { Sparkles, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KoreaMapProps {
  onRegionSelect?: (region: Region) => void;
  selectedRegionId?: string;
}

export function KoreaMap({ onRegionSelect, selectedRegionId }: KoreaMapProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const { liveList } = useLiveRanking();

  // 지역별 라이브 방송 수 계산
  const getRegionLiveCount = (regionId: string) => {
    // TODO: 실제로는 크리에이터의 지역 정보를 기반으로 계산
    // 현재는 랜덤으로 시뮬레이션
    return Math.floor(Math.random() * 5);
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
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
          <style jsx>{`
            @keyframes shimmer {
              0%, 100% { transform: translateX(-100%); }
              50% { transform: translateX(100%); }
            }
          `}</style>
          {/* 지도 이미지 컨테이너 */}
          <div className="relative w-full h-full">
            {/* 실제 한국 지도 이미지 - 외부 이미지 URL 사용 또는 로컬 이미지 */}
            <div className="relative w-full h-full">
              {/* 한국 지도 SVG (더 정확한 형태) */}
              <svg
                viewBox="0 0 800 1000"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  {/* 지도 그라데이션 */}
                  <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(20, 20, 30, 0.9)" />
                    <stop offset="30%" stopColor="rgba(30, 30, 40, 0.8)" />
                    <stop offset="70%" stopColor="rgba(40, 35, 50, 0.7)" />
                    <stop offset="100%" stopColor="rgba(25, 25, 35, 0.9)" />
                  </linearGradient>
                  
                  {/* 입체감 그림자 필터 */}
                  <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                    <feOffset dx="2" dy="2" result="offsetblur"/>
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3"/>
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  
                  {/* 글로우 효과 */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* 한국 지도 윤곽 (더 정확한 형태) */}
                <g filter="url(#shadow)">
                  {/* 본토 */}
                  <path
                    d="M 200 150 
                       L 280 160 L 350 180 L 420 220 
                       L 480 280 L 520 350 L 540 420 
                       L 530 500 L 500 580 L 460 640 
                       L 400 680 L 320 700 L 240 690 
                       L 180 660 L 140 610 L 120 550 
                       L 110 480 L 120 410 L 150 350 
                       L 180 280 L 200 220 Z"
                    fill="url(#mapGradient)"
                    stroke="rgba(251, 191, 36, 0.4)"
                    strokeWidth="3"
                    className="transition-all duration-500"
                  />
                  
                  {/* 제주도 */}
                  <ellipse
                    cx="150"
                    cy="900"
                    rx="40"
                    ry="60"
                    fill="url(#mapGradient)"
                    stroke="rgba(251, 191, 36, 0.4)"
                    strokeWidth="2"
                    className="transition-all duration-500"
                  />
                  
                  {/* 지형감을 위한 하이라이트 */}
                  <path
                    d="M 200 150 
                       L 280 160 L 350 180 L 420 220 
                       L 480 280 L 520 350 L 540 420 
                       L 530 500 L 500 580 L 460 640 
                       L 400 680 L 320 700 L 240 690 
                       L 180 660 L 140 610 L 120 550 
                       L 110 480 L 120 410 L 150 350 
                       L 180 280 L 200 220 Z"
                    fill="url(#highlightGradient)"
                    opacity="0.2"
                    className="pointer-events-none"
                  />
                  
                  <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(251, 191, 36, 0.3)" />
                    <stop offset="100%" stopColor="rgba(251, 191, 36, 0)" />
                  </linearGradient>
                </g>
                
                {/* 입체감을 위한 추가 레이어 */}
                <g opacity="0.1">
                  <path
                    d="M 200 150 
                       L 280 160 L 350 180 L 420 220 
                       L 480 280 L 520 350 L 540 420 
                       L 530 500 L 500 580 L 460 640 
                       L 400 680 L 320 700 L 240 690 
                       L 180 660 L 140 610 L 120 550 
                       L 110 480 L 120 410 L 150 350 
                       L 180 280 L 200 220 Z"
                    fill="white"
                    transform="translate(5, 5)"
                  />
                </g>
              </svg>
              
              {/* 실제 한국 지도 이미지를 사용하려면 아래 주석을 해제하고 이미지 URL을 설정하세요 */}
              {/* 
              <Image
                src="/korea-map.png" // 또는 외부 이미지 URL
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
                            {liveCount}개 방송 중
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
