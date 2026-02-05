/**
 * 국가 및 지역 타입 정의
 */

import type { Locale } from '@/store/i18n';

export type CountryCode = 'KR' | 'US' | 'JP' | 'CN' | 'VN' | 'TH';

export interface Country {
  code: CountryCode;
  name: string;
  locale: Locale;
  flag: string;
}

export interface CountryRegion {
  id: string;
  countryCode: CountryCode;
  name: string;
  nameLocalized: Record<Locale, string>;
  type: 'state' | 'province' | 'prefecture' | 'region' | 'city';
  parentId?: string;
  latitude: number;
  longitude: number;
  centerX?: number;
  centerY?: number;
}

export interface CountrySpecialty {
  id: string;
  name: string;
  nameLocalized: Record<Locale, string>;
  regionId: string;
  countryCode: CountryCode;
  category: 'fruit' | 'vegetable' | 'seafood' | 'livestock' | 'processed' | 'grain' | 'mushroom' | 'other';
  categoryLocalized: Record<Locale, string>;
  seasons: string[];
  seasonsLocalized: Record<Locale, string[]>;
  description?: string;
  descriptionLocalized?: Record<Locale, string>;
  imageUrl?: string;
  isLandmark: boolean;
  isActive: boolean;
}

// 국가 코드와 로케일 매핑
export const countryLocaleMap: Record<Locale, CountryCode> = {
  ko: 'KR',
  en: 'US',
  ja: 'JP',
  'zh-CN': 'CN',
  vi: 'VN',
  th: 'TH',
};

// 국가 정보
export const countries: Record<CountryCode, Country> = {
  KR: { code: 'KR', name: 'South Korea', locale: 'ko', flag: '🇰🇷' },
  US: { code: 'US', name: 'United States', locale: 'en', flag: '🇺🇸' },
  JP: { code: 'JP', name: 'Japan', locale: 'ja', flag: '🇯🇵' },
  CN: { code: 'CN', name: 'China', locale: 'zh-CN', flag: '🇨🇳' },
  VN: { code: 'VN', name: 'Vietnam', locale: 'vi', flag: '🇻🇳' },
  TH: { code: 'TH', name: 'Thailand', locale: 'th', flag: '🇹🇭' },
};
