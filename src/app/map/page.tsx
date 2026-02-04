'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { KoreaMap } from '@/components/korea-map';
import { RegionSpecialtyList } from '@/components/region-specialty-list';
import { RegionLiveStreams } from '@/components/region-live-streams';
import type { Region } from '@/types/region';
import { MapPin, Sparkles } from 'lucide-react';

export default function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

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
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">전국 특산물 지도</h1>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 px-1">
              지역을 선택하여 특산물과 라이브 방송을 확인하세요
            </p>
          </div>

          {/* 지도 섹션 */}
          <section className="mb-6 sm:mb-8">
            <KoreaMap
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
        </div>
      </main>
    </>
  );
}
