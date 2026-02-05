/**
 * 포맷 관련 커스텀 훅
 */

import { useI18n } from '@/store/i18n';
import {
  formatCurrency as formatCurrencyUtil,
  formatDateTime as formatDateTimeUtil,
  formatDate as formatDateUtil,
  formatTime as formatTimeUtil,
  formatRelativeTime as formatRelativeTimeUtil,
  formatNumber as formatNumberUtil,
} from '@/lib/format';

/**
 * 통화 포맷 훅
 */
export function useCurrencyFormat() {
  const { locale } = useI18n();

  return (amount: number, options?: { showSymbol?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }) => {
    return formatCurrencyUtil(amount, locale, options);
  };
}

/**
 * 날짜/시간 포맷 훅
 */
export function useDateTimeFormat() {
  const { locale } = useI18n();

  return {
    formatDateTime: (date: Date | string, options?: { includeTime?: boolean; includeDate?: boolean; customOptions?: Intl.DateTimeFormatOptions }) => {
      return formatDateTimeUtil(date, locale, options);
    },
    formatDate: (date: Date | string) => {
      return formatDateUtil(date, locale);
    },
    formatTime: (date: Date | string) => {
      return formatTimeUtil(date, locale);
    },
    formatRelativeTime: (date: Date | string) => {
      return formatRelativeTimeUtil(date, locale);
    },
  };
}

/**
 * 숫자 포맷 훅
 */
export function useNumberFormat() {
  const { locale } = useI18n();

  return (num: number) => {
    return formatNumberUtil(num, locale);
  };
}

/**
 * 통합 포맷 훅 (모든 포맷 함수 포함)
 */
export function useFormat() {
  const { locale } = useI18n();

  return {
    currency: (amount: number, options?: { showSymbol?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }) => {
      return formatCurrencyUtil(amount, locale, options);
    },
    dateTime: (date: Date | string, options?: { includeTime?: boolean; includeDate?: boolean; customOptions?: Intl.DateTimeFormatOptions }) => {
      return formatDateTimeUtil(date, locale, options);
    },
    date: (date: Date | string) => {
      return formatDateUtil(date, locale);
    },
    time: (date: Date | string) => {
      return formatTimeUtil(date, locale);
    },
    relativeTime: (date: Date | string) => {
      return formatRelativeTimeUtil(date, locale);
    },
    number: (num: number) => {
      return formatNumberUtil(num, locale);
    },
  };
}
