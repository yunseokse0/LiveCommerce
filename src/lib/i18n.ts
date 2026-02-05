/**
 * 다국어 번역 시스템
 */

import type { Locale } from '@/store/i18n';

// 번역 파일 동적 임포트
const translations: Record<Locale, () => Promise<any>> = {
  ko: () => import('@/locales/ko.json'),
  en: () => import('@/locales/en.json'),
  ja: () => import('@/locales/ja.json'),
  'zh-CN': () => import('@/locales/zh-CN.json'),
  vi: () => import('@/locales/vi.json'),
  th: () => import('@/locales/th.json'),
};

// 번역 데이터 캐시
const translationCache: Record<Locale, any> = {} as any;

/**
 * 번역 데이터 가져오기
 */
export async function getTranslations(locale: Locale): Promise<any> {
  if (translationCache[locale]) {
    return translationCache[locale];
  }

  try {
    const module = await translations[locale]();
    translationCache[locale] = module.default;
    return module.default;
  } catch (error) {
    console.error(`번역 파일 로드 오류 (${locale}):`, error);
    // 기본값으로 한국어 사용
    if (locale !== 'ko') {
      const koModule = await translations['ko']();
      return koModule.default;
    }
    return {};
  }
}

/**
 * 번역 키 경로로 값 가져오기 (예: 'common.home' -> '홈')
 */
export function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}
