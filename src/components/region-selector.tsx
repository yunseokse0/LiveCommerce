/**
 * 지역 선택 컴포넌트 (다국어 지원)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, MapPin, ChevronDown, Check } from 'lucide-react';
import { useI18n, type Locale } from '@/store/i18n';
import { countryLocaleMap, countries } from '@/store/i18n';
import { getRegionsByCountry, getRegionName } from '@/data/country-regions';
import type { CountryRegion } from '@/types/country';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';
import type { CountryCode } from '@/types/country';

interface RegionSelectorProps {
  selectedRegionId?: string;
  onRegionSelect: (region: CountryRegion | null) => void;
  className?: string;
}

export function RegionSelector({ selectedRegionId, onRegionSelect, className }: RegionSelectorProps) {
  const { locale } = useI18n();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const countryCode: CountryCode = countryLocaleMap[locale];
  const country = countries[countryCode];
  const regions = getRegionsByCountry(countryCode);

  const selectedRegion = selectedRegionId
    ? regions.find((r) => r.id === selectedRegionId)
    : null;

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRegionClick = (region: CountryRegion | null) => {
    onRegionSelect(region);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-secondary border border-zinc-800/80',
          'hover:border-amber-500/50 transition-colors',
          'text-sm font-medium'
        )}
        aria-label={t('map.selectRegion')}
      >
        <MapPin className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">{country.flag}</span>
        <span className="text-amber-400">
          {selectedRegion ? getRegionName(selectedRegion, locale) : t('map.allRegions')}
        </span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card border border-zinc-800/80 rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
          {/* 국가 헤더 */}
          <div className="p-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Globe className="w-4 h-4" />
              <span>{country.name}</span>
            </div>
          </div>

          {/* 전체 보기 옵션 */}
          <button
            onClick={() => handleRegionClick(null)}
            className={cn(
              'w-full text-left px-4 py-3 hover:bg-secondary transition-colors',
              'flex items-center justify-between',
              !selectedRegion && 'bg-amber-500/10'
            )}
          >
            <span className="text-sm font-medium">{t('map.allRegions')}</span>
            {!selectedRegion && <Check className="w-4 h-4 text-amber-400" />}
          </button>

          {/* 지역 목록 */}
          <div className="divide-y divide-zinc-800/80">
            {regions.map((region) => (
              <button
                key={region.id}
                onClick={() => handleRegionClick(region)}
                className={cn(
                  'w-full text-left px-4 py-3 hover:bg-secondary transition-colors',
                  'flex items-center justify-between',
                  selectedRegionId === region.id && 'bg-amber-500/10'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getRegionName(region, locale)}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{region.name}</p>
                </div>
                {selectedRegionId === region.id && (
                  <Check className="w-4 h-4 text-amber-400 flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
