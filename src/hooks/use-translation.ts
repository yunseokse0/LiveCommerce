/**
 * 번역 훅
 */

import { useState, useEffect } from 'react';
import { useI18n, type Locale } from '@/store/i18n';
import { getTranslations, getNestedValue } from '@/lib/i18n';

let translationsCache: Record<Locale, any> = {} as any;
let loadingPromise: Promise<void> | null = null;

/**
 * 초기 번역 데이터 로드
 */
async function loadTranslations(locale: Locale): Promise<void> {
  if (translationsCache[locale]) {
    return;
  }

  if (loadingPromise) {
    await loadingPromise;
    return;
  }

  loadingPromise = (async () => {
    translationsCache[locale] = await getTranslations(locale);
    loadingPromise = null;
  })();

  await loadingPromise;
}

/**
 * 번역 훅
 */
export function useTranslation() {
  const { locale } = useI18n();
  const [translations, setTranslations] = useState<any>(translationsCache[locale] || {});
  const [isLoading, setIsLoading] = useState(!translationsCache[locale]);

  useEffect(() => {
    if (translationsCache[locale]) {
      setTranslations(translationsCache[locale]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    loadTranslations(locale).then(() => {
      setTranslations(translationsCache[locale]);
      setIsLoading(false);
    });
  }, [locale]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations, key);
    
    if (typeof value !== 'string') {
      return key; // 번역이 없으면 키 반환
    }

    // 파라미터 치환 (예: "Hello {name}" -> "Hello John")
    if (params) {
      return Object.entries(params).reduce(
        (str, [paramKey, paramValue]) => str.replace(`{${paramKey}}`, String(paramValue)),
        value
      );
    }

    return value;
  };

  return { t, locale, isLoading };
}
