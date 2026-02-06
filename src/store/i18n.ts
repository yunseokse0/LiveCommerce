/**
 * 다국어 상태 관리 (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CountryCode } from '@/types/country';

export type Locale = 'ko' | 'en' | 'ja' | 'zh-CN' | 'vi' | 'th';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  selectedCountryCode: CountryCode;
  setSelectedCountryCode: (code: CountryCode) => void;
  selectedRegionId: string | null;
  setSelectedRegionId: (regionId: string | null) => void;
}

const DEFAULT_LOCALE: Locale = 'ko';
const DEFAULT_COUNTRY: CountryCode = 'KR';

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => set({ locale }),
      selectedCountryCode: DEFAULT_COUNTRY,
      setSelectedCountryCode: (code) => set({ selectedCountryCode: code, selectedRegionId: null }),
      selectedRegionId: null,
      setSelectedRegionId: (regionId) => set({ selectedRegionId: regionId }),
    }),
    {
      name: 'i18n-storage',
    }
  )
);

// 언어 정보
export const locales: Record<Locale, { name: string; nativeName: string; flag: string }> = {
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  'zh-CN': { name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  vi: { name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  th: { name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
};

// 국가 코드와 로케일 매핑
export const countryLocaleMap: Record<Locale, 'KR' | 'US' | 'JP' | 'CN' | 'VN' | 'TH'> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  'zh-CN': 'CN',
  vi: 'VN',
  th: 'TH',
};

// 국가 정보
export const countries: Record<'KR' | 'US' | 'JP' | 'CN' | 'VN' | 'TH', { code: string; name: string; locale: Locale; flag: string }> = {
  KR: { code: 'KR', name: 'South Korea', locale: 'ko', flag: '🇰🇷' },
  US: { code: 'US', name: 'United States', locale: 'en', flag: '🇺🇸' },
  JP: { code: 'JP', name: 'Japan', locale: 'ja', flag: '🇯🇵' },
  CN: { code: 'CN', name: 'China', locale: 'zh-CN', flag: '🇨🇳' },
  VN: { code: 'VN', name: 'Vietnam', locale: 'vi', flag: '🇻🇳' },
  TH: { code: 'TH', name: 'Thailand', locale: 'th', flag: '🇹🇭' },
};
