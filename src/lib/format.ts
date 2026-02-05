/**
 * 로케일별 날짜/시간 및 통화 포맷 유틸리티
 */

import type { Locale } from '@/store/i18n';

// 로케일별 통화 설정
export const currencyConfig: Record<Locale, { code: string; symbol: string; locale: string }> = {
  ko: { code: 'KRW', symbol: '원', locale: 'ko-KR' },
  en: { code: 'USD', symbol: '$', locale: 'en-US' },
  ja: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  'zh-CN': { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  vi: { code: 'VND', symbol: '₫', locale: 'vi-VN' },
  th: { code: 'THB', symbol: '฿', locale: 'th-TH' },
};

// 로케일별 날짜/시간 포맷 설정
export const dateTimeConfig: Record<Locale, Intl.DateTimeFormatOptions> = {
  ko: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  en: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  ja: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  'zh-CN': {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  vi: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
  th: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
};

// 날짜만 포맷 설정
export const dateConfig: Record<Locale, Intl.DateTimeFormatOptions> = {
  ko: { year: 'numeric', month: 'long', day: 'numeric' },
  en: { year: 'numeric', month: 'short', day: 'numeric' },
  ja: { year: 'numeric', month: 'long', day: 'numeric' },
  'zh-CN': { year: 'numeric', month: 'long', day: 'numeric' },
  vi: { year: 'numeric', month: 'short', day: 'numeric' },
  th: { year: 'numeric', month: 'short', day: 'numeric' },
};

// 시간만 포맷 설정
export const timeConfig: Record<Locale, Intl.DateTimeFormatOptions> = {
  ko: { hour: '2-digit', minute: '2-digit' },
  en: { hour: '2-digit', minute: '2-digit', hour12: true },
  ja: { hour: '2-digit', minute: '2-digit' },
  'zh-CN': { hour: '2-digit', minute: '2-digit' },
  vi: { hour: '2-digit', minute: '2-digit' },
  th: { hour: '2-digit', minute: '2-digit' },
};

/**
 * 통화 포맷
 * @param amount 금액 (원화 기준)
 * @param locale 로케일
 * @param options 추가 옵션
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  options?: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const config = currencyConfig[locale];
  const { showSymbol = true, minimumFractionDigits, maximumFractionDigits } = options || {};

  // 환율 변환 (간단한 예시, 실제로는 API에서 가져와야 함)
  const exchangeRates: Record<Locale, number> = {
    ko: 1, // 원화 기준
    en: 0.00075, // 1원 = 0.00075달러 (약 1333원 = 1달러)
    ja: 0.11, // 1원 = 0.11엔 (약 9원 = 1엔)
    'zh-CN': 0.0054, // 1원 = 0.0054위안 (약 185원 = 1위안)
    vi: 18.5, // 1원 = 18.5동 (약 0.054원 = 1동)
    th: 0.027, // 1원 = 0.027바트 (약 37원 = 1바트)
  };

  const convertedAmount = amount * exchangeRates[locale];

  // 통화 포맷
  const formatter = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: minimumFractionDigits ?? (config.code === 'KRW' || config.code === 'JPY' ? 0 : 2),
    maximumFractionDigits: maximumFractionDigits ?? (config.code === 'KRW' || config.code === 'JPY' ? 0 : 2),
  });

  const formatted = formatter.format(convertedAmount);

  // 심볼 표시 옵션에 따라 처리
  if (!showSymbol) {
    return formatted.replace(/[^\d.,]/g, '');
  }

  return formatted;
}

/**
 * 날짜/시간 포맷
 * @param date 날짜 객체 또는 문자열
 * @param locale 로케일
 * @param options 포맷 옵션
 */
export function formatDateTime(
  date: Date | string,
  locale: Locale,
  options?: {
    includeTime?: boolean;
    includeDate?: boolean;
    customOptions?: Intl.DateTimeFormatOptions;
  }
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const config = currencyConfig[locale];
  const { includeTime = true, includeDate = true, customOptions } = options || {};

  let formatOptions: Intl.DateTimeFormatOptions;

  if (customOptions) {
    formatOptions = customOptions;
  } else if (includeDate && includeTime) {
    formatOptions = dateTimeConfig[locale];
  } else if (includeDate) {
    formatOptions = dateConfig[locale];
  } else {
    formatOptions = timeConfig[locale];
  }

  return new Intl.DateTimeFormat(config.locale, formatOptions).format(dateObj);
}

/**
 * 날짜만 포맷
 * @param date 날짜 객체 또는 문자열
 * @param locale 로케일
 */
export function formatDate(date: Date | string, locale: Locale): string {
  return formatDateTime(date, locale, { includeTime: false, includeDate: true });
}

/**
 * 시간만 포맷
 * @param date 날짜 객체 또는 문자열
 * @param locale 로케일
 */
export function formatTime(date: Date | string, locale: Locale): string {
  return formatDateTime(date, locale, { includeTime: true, includeDate: false });
}

/**
 * 상대 시간 포맷 (예: "2시간 전", "3일 전")
 * @param date 날짜 객체 또는 문자열
 * @param locale 로케일
 */
export function formatRelativeTime(date: Date | string, locale: Locale): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // 번역 키를 사용하여 상대 시간 표시
  const translations: Record<Locale, { justNow: string; minutes: string; hours: string; days: string }> = {
    ko: { justNow: '방금 전', minutes: '분 전', hours: '시간 전', days: '일 전' },
    en: { justNow: 'just now', minutes: 'minutes ago', hours: 'hours ago', days: 'days ago' },
    ja: { justNow: 'たった今', minutes: '分前', hours: '時間前', days: '日前' },
    'zh-CN': { justNow: '刚刚', minutes: '分钟前', hours: '小时前', days: '天前' },
    vi: { justNow: 'vừa xong', minutes: 'phút trước', hours: 'giờ trước', days: 'ngày trước' },
    th: { justNow: 'เมื่อสักครู่', minutes: 'นาทีที่แล้ว', hours: 'ชั่วโมงที่แล้ว', days: 'วันที่แล้ว' },
  };

  const t = translations[locale];

  if (diffInSeconds < 60) {
    return t.justNow;
  }
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}${t.minutes}`;
  }
  if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}${t.hours}`;
  }
  return `${Math.floor(diffInSeconds / 86400)}${t.days}`;
}

/**
 * 숫자 포맷 (천 단위 구분)
 * @param num 숫자
 * @param locale 로케일
 */
export function formatNumber(num: number, locale: Locale): string {
  const config = currencyConfig[locale];
  return new Intl.NumberFormat(config.locale).format(num);
}
