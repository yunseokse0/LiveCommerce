'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/header';
import { RegionSpecialtyList } from '@/components/region-specialty-list';
import { RegionSpecialtyListView } from '@/components/region-specialty-list-view';
import { RegionLiveStreams } from '@/components/region-live-streams';
import type { Region } from '@/types/region';
import { MapPin, Sparkles, List, Map } from 'lucide-react';

// Leaflet은 클라이언트에서만 렌더링 (SSR 방지) - 로딩 최적화
const KoreaMapLeaflet = dynamic(
  () => import('@/components/korea-map-leaflet-v2').then((mod) => ({ default: mod.KoreaMapLeaflet })),
  { 
    ssr: false,
    loading: () => (
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden border border-amber-500/30 bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <div className="text-sm text-zinc-400">지도를 불러오는 중...</div>
          </div>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const handleRegionSelect = (region: Region) => {
    setSelectedRegion(region);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          {/* 헤더 */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">전국 제철 특산물 지도</h1>
              </div>
              {/* 리스트 뷰 토글 버튼 */}
              <button
                onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-amber-700/30 transition-all duration-200 active:scale-95"
                aria-label={viewMode === 'map' ? '리스트 보기' : '지도 보기'}
              >
                {viewMode === 'map' ? (
                  <>
                    <List className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    <span className="text-xs sm:text-sm font-medium text-amber-400 hidden sm:inline">
                      리스트
                    </span>
                  </>
                ) : (
                  <>
                    <Map className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                    <span className="text-xs sm:text-sm font-medium text-amber-400 hidden sm:inline">
                      지도
                    </span>
                  </>
                )}
              </button>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 px-1">
              지역별 제철 특산물을 확인하고 라이브 방송을 만나보세요
            </p>
            <p className="text-xs sm:text-sm text-zinc-500 px-1 mt-1">
              🗺️ 한눈에 보는 전국 제철 특산물 지도
            </p>
          </div>

          {/* 지도/리스트 뷰 */}
          {viewMode === 'map' ? (
            <>
              {/* 지도 섹션 */}
              <section className="mb-6 sm:mb-8">
                <KoreaMapLeaflet
                  onRegionSelect={handleRegionSelect}
                  selectedRegionId={selectedRegion?.id}
                />
              </section>

              {/* 선택된 지역 정보 */}
              {selectedRegion && (
                <div className="space-y-6 sm:space-y-8">
                  {/* 지역 헤더 */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/30 border border-amber-500/50 shadow-lg">
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1">
                          {selectedRegion.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400">
                          특산물과 라이브 방송을 확인하세요
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 특산물 목록 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      지역 특산물
                    </h3>
                    <RegionSpecialtyList regionId={selectedRegion.id} />
                  </section>

                  {/* 라이브 방송 목록 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      지역 라이브 방송
                    </h3>
                    <RegionLiveStreams regionId={selectedRegion.id} />
                  </section>
                </div>
              )}

              {/* 지역 미선택 시 안내 */}
              {!selectedRegion && (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                    <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                  </div>
                  <p className="text-base sm:text-lg text-zinc-400">
                    지도에서 지역을 선택하세요
                  </p>
                </div>
              )}
            </>
          ) : (
            /* 리스트 뷰 */
            <div className="space-y-6 sm:space-y-8">
              {/* 지역 선택 또는 전체 보기 */}
              {selectedRegion ? (
                <>
                  {/* 지역 헤더 */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/30 border border-amber-500/50 shadow-lg">
                          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />
                        </div>
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold mb-1">
                            {selectedRegion.name}
                          </h2>
                          <p className="text-xs sm:text-sm text-zinc-400">
                            특산물과 라이브 방송을 확인하세요
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedRegion(null)}
                        className="px-3 py-1.5 text-xs sm:text-sm text-zinc-400 hover:text-amber-400 transition-colors"
                      >
                        전체 보기
                      </button>
                    </div>
                  </div>

                  {/* 특산물 리스트 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      지역 특산물
                    </h3>
                    <RegionSpecialtyListView regionId={selectedRegion.id} />
                  </section>

                  {/* 라이브 방송 목록 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      지역 라이브 방송
                    </h3>
                    <RegionLiveStreams regionId={selectedRegion.id} />
                  </section>
                </>
              ) : (
                <>
                  {/* 전체 특산물 헤더 */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 mb-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-700/30 border border-amber-500/50 shadow-lg">
                        <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-300" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-1">
                          전국 특산물
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400">
                          모든 지역의 제철 특산물을 확인하세요
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 전체 특산물 리스트 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      전체 특산물
                    </h3>
                    <RegionSpecialtyListView />
                  </section>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
