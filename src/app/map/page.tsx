'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Header } from '@/components/header';
import { RegionSpecialtyList } from '@/components/region-specialty-list';
import { RegionSpecialtyListView } from '@/components/region-specialty-list-view';
import { RegionLiveStreams } from '@/components/region-live-streams';
import { RegionSelector } from '@/components/region-selector';
import type { Region } from '@/types/region';
import type { CountryRegion, CountryCode } from '@/types/country';
import { MapPin, Sparkles, List, Map } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useI18n, countries } from '@/store/i18n';
import { getRegionsByCountry, getRegionName } from '@/data/country-regions';

const CountryMapLeaflet = dynamic(
  () => import('@/components/country-map-leaflet').then((mod) => ({ default: mod.CountryMapLeaflet })),
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

function MapPageContent() {
  const { locale, selectedRegionId, setSelectedRegionId, selectedCountryCode, setSelectedCountryCode } = useI18n();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [prevCountryCode, setPrevCountryCode] = useState<CountryCode | null>(null);
  const searchParams = useSearchParams();

  const countryCode = selectedCountryCode;
  const regions = getRegionsByCountry(countryCode);
  const selectedRegion = selectedRegionId
    ? regions.find((r) => r.id === selectedRegionId) || null
    : null;

  const handleRegionSelect = (region: CountryRegion | null) => {
    setSelectedRegionId(region?.id || null);
  };

  const handleMapRegionSelect = (region: Region | null) => {
    // Region을 CountryRegion으로 변환
    if (!region) {
      setSelectedRegionId(null);
      return;
    }
    const countryRegion = regions.find(r => r.id === region.id);
    if (countryRegion) {
      setSelectedRegionId(countryRegion.id);
    }
  };

  // URL 쿼리 파라미터 처리 (country, region, view)
  useEffect(() => {
    const countryParam = searchParams.get('country') as CountryCode | null;
    const regionParam = searchParams.get('region');
    const viewParam = searchParams.get('view');
    if (countryParam && countryParam !== selectedCountryCode) {
      setSelectedCountryCode(countryParam);
    }
    if (regionParam) {
      setSelectedRegionId(regionParam);
    }
    if (viewParam === 'list' || viewParam === 'map') {
      setViewMode(viewParam);
    }
  }, [searchParams, setSelectedCountryCode, setSelectedRegionId, selectedCountryCode]);

  // 국가 변경 시 지역 유효성 검사
  useEffect(() => {
    if (!selectedRegionId) return;
    const matchingRegion = regions.find((r) => r.id === selectedRegionId);
    if (!matchingRegion) {
      setSelectedRegionId(null);
    }
    setPrevCountryCode(countryCode);
  }, [countryCode, regions, selectedRegionId, setSelectedRegionId]);

  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          {/* 헤더 */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">{t('map.title')}</h1>
              </div>
              <div className="flex items-center gap-2">
                <RegionSelector
                  selectedRegionId={selectedRegion?.id || undefined}
                  onRegionSelect={handleRegionSelect}
                  className="hidden sm:block"
                />
                {/* 리스트 뷰 토글 버튼 */}
                <button
                  onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 hover:from-amber-500/30 hover:to-amber-700/30 transition-all duration-200 active:scale-95"
                  aria-label={viewMode === 'map' ? t('map.listView') : t('map.mapView')}
                >
                  {viewMode === 'map' ? (
                    <>
                      <List className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                      <span className="text-xs sm:text-sm font-medium text-amber-400 hidden sm:inline">
                        {t('map.listView')}
                      </span>
                    </>
                  ) : (
                    <>
                      <Map className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                      <span className="text-xs sm:text-sm font-medium text-amber-400 hidden sm:inline">
                        {t('map.mapView')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <p className="text-sm sm:text-base text-zinc-400 px-1">
              {t('map.subtitle')}
            </p>
          </div>

          {/* 지도/리스트 뷰 */}
          {viewMode === 'map' ? (
            <>
              {/* 지도 섹션 */}
              <section className="mb-6 sm:mb-8">
                <CountryMapLeaflet
                  countryCode={countryCode}
                  selectedRegionId={selectedRegion?.id || null}
                  onRegionSelect={(r) => {
                    const region = regions.find(x => x.id === r.id);
                    if (region) setSelectedRegionId(region.id);
                  }}
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
                          {selectedRegion ? getRegionName(selectedRegion, locale) : t('map.allSpecialties')}
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400">
                          {t('map.regionSpecialties')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 특산물 목록 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      {t('map.regionSpecialties')}
                    </h3>
                    <RegionSpecialtyList regionId={selectedRegion.id} countryCode={countryCode} />
                  </section>

                  {/* 라이브 방송 목록 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      {t('map.regionLiveStreams')}
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
                    {t('map.selectRegion')}
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
                            {selectedRegion ? getRegionName(selectedRegion, locale) : t('map.allSpecialties')}
                          </h2>
                          <p className="text-xs sm:text-sm text-zinc-400">
                            {t('map.regionSpecialties')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedRegionId(null)}
                        className="px-3 py-1.5 text-xs sm:text-sm text-zinc-400 hover:text-amber-400 transition-colors"
                      >
                        {t('map.viewAll')}
                      </button>
                    </div>
                  </div>

                  {/* 특산물 리스트 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      {t('map.regionSpecialties')}
                    </h3>
                    <RegionSpecialtyListView regionId={selectedRegion.id} countryCode={countryCode} />
                  </section>

                  {/* 라이브 방송 목록 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      {t('map.regionLiveStreams')}
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
                          {t('map.allSpecialties')}
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400">
                          {t('map.allSpecialtiesDesc')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 전체 특산물 리스트 */}
                  <section>
                    <h3 className="text-lg sm:text-xl font-semibold mb-4 px-1">
                      {t('map.allSpecialties')}
                    </h3>
                    <RegionSpecialtyListView countryCode={countryCode} />
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

export default function MapPage() {
  return (
    <>
      <Header />
      <Suspense fallback={
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
            <div className="relative w-full max-w-4xl mx-auto">
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden border border-amber-500/30 bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                  <div className="text-sm text-[var(--muted)]">지도를 불러오는 중...</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      }>
        <MapPageContent />
      </Suspense>
    </>
  );
}
