/**
 * 지역 선택 컴포넌트 (다국어 지원)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Globe, MapPin, ChevronDown, Check } from 'lucide-react';
import { useI18n, type Locale, countries } from '@/store/i18n';
import { getRegionsByCountry, getRegionName } from '@/data/country-regions';
import type { CountryRegion, CountryCode } from '@/types/country';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

interface RegionSelectorProps {
  selectedRegionId?: string;
  onRegionSelect: (region: CountryRegion | null) => void;
  className?: string;
}

export function RegionSelector({ selectedRegionId, onRegionSelect, className }: RegionSelectorProps) {
  const { locale, selectedCountryCode, setSelectedCountryCode } = useI18n();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [portalPos, setPortalPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const countryCode: CountryCode = selectedCountryCode;
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

  useEffect(() => {
    const updatePosition = () => {
      if (!isOpen || !dropdownRef.current) return;
      const rect = dropdownRef.current.getBoundingClientRect();
      const width = 256;
      const left = Math.max(8, rect.left);
      const top = rect.bottom + 8;
      setPortalPos({ top, left, width });
    };
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
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
          'bg-secondary border',
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

      {isOpen && portalPos &&
        createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
          <div onClick={() => setIsOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div className="bg-card border rounded-xl shadow-2xl max-h-[70vh] overflow-y-auto"
               style={{
                 position: 'absolute',
                 top: Math.min(portalPos.top, (window.innerHeight * 0.9) - 8),
                 left: window.innerWidth < 640 ? 8 : portalPos.left,
                 width: window.innerWidth < 640 ? Math.max(240, window.innerWidth - 16) : portalPos.width
               }}>
          {/* 국가 선택 */}
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
              <Globe className="w-4 h-4" />
              <span>국가 선택</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(countries).map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setSelectedCountryCode(c.code as CountryCode);
                    onRegionSelect(null);
                  }}
                  className={cn(
                    'px-2 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1',
                    c.code === countryCode ? 'border-amber-500/50 bg-amber-500/10' : 'hover:bg-secondary'
                  )}
                >
                  <span>{c.flag}</span>
                  <span className="truncate max-w-[60px]">{c.name}</span>
                  {c.code === countryCode && <Check className="w-3 h-3 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* 전체 보기 옵션 */}
          <button
            onClick={() => handleRegionClick(null)}
            className={cn(
              'w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b',
              'flex items-center justify-between',
              !selectedRegion && 'bg-amber-500/10'
            )}
          >
            <span className="text-sm font-medium">{t('map.allRegions')}</span>
            {!selectedRegion && <Check className="w-4 h-4 text-amber-400" />}
          </button>

          {/* 지역 목록 */}
          <div className="divide-y">
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
        </div>,
        document.body
      )}
    </div>
  );
}
