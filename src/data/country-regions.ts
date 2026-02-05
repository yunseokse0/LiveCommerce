/**
 * 국가별 지역 데이터
 */

import type { CountryRegion, CountryCode } from '@/types/country';
import type { Locale } from '@/store/i18n';

// 한국 지역
export const koreaRegions: CountryRegion[] = [
  { id: 'gangwon', countryCode: 'KR', name: 'Gangwon', nameLocalized: { ko: '강원도', en: 'Gangwon', ja: '江原道', 'zh-CN': '江原道', vi: 'Gangwon', th: 'กังวอน' }, type: 'province', latitude: 37.8228, longitude: 128.1555 },
  { id: 'gyeonggi', countryCode: 'KR', name: 'Gyeonggi', nameLocalized: { ko: '경기도', en: 'Gyeonggi', ja: '京畿道', 'zh-CN': '京畿道', vi: 'Gyeonggi', th: 'คยองกี' }, type: 'province', latitude: 37.4138, longitude: 127.5183 },
  { id: 'gyeongbuk', countryCode: 'KR', name: 'North Gyeongsang', nameLocalized: { ko: '경상북도', en: 'North Gyeongsang', ja: '慶尚北道', 'zh-CN': '庆尚北道', vi: 'Bắc Gyeongsang', th: 'คยองซังเหนือ' }, type: 'province', latitude: 36.4919, longitude: 128.8889 },
  { id: 'gyeongnam', countryCode: 'KR', name: 'South Gyeongsang', nameLocalized: { ko: '경상남도', en: 'South Gyeongsang', ja: '慶尚南道', 'zh-CN': '庆尚南道', vi: 'Nam Gyeongsang', th: 'คยองซังใต้' }, type: 'province', latitude: 35.4606, longitude: 128.2132 },
  { id: 'chungbuk', countryCode: 'KR', name: 'North Chungcheong', nameLocalized: { ko: '충청북도', en: 'North Chungcheong', ja: '忠清北道', 'zh-CN': '忠清北道', vi: 'Bắc Chungcheong', th: 'ชุงชองเหนือ' }, type: 'province', latitude: 36.8000, longitude: 127.7000 },
  { id: 'chungnam', countryCode: 'KR', name: 'South Chungcheong', nameLocalized: { ko: '충청남도', en: 'South Chungcheong', ja: '忠清南道', 'zh-CN': '忠清南道', vi: 'Nam Chungcheong', th: 'ชุงชองใต้' }, type: 'province', latitude: 36.5184, longitude: 126.8000 },
  { id: 'jeonbuk', countryCode: 'KR', name: 'North Jeolla', nameLocalized: { ko: '전라북도', en: 'North Jeolla', ja: '全羅北道', 'zh-CN': '全罗北道', vi: 'Bắc Jeolla', th: 'ชอลลาเหนือ' }, type: 'province', latitude: 35.7175, longitude: 127.1530 },
  { id: 'jeonnam', countryCode: 'KR', name: 'South Jeolla', nameLocalized: { ko: '전라남도', en: 'South Jeolla', ja: '全羅南道', 'zh-CN': '全罗南道', vi: 'Nam Jeolla', th: 'ชอลลาใต้' }, type: 'province', latitude: 34.8679, longitude: 126.9910 },
  { id: 'jeju', countryCode: 'KR', name: 'Jeju', nameLocalized: { ko: '제주특별자치도', en: 'Jeju', ja: '済州特別自治道', 'zh-CN': '济州特别自治道', vi: 'Jeju', th: 'เชจู' }, type: 'province', latitude: 33.4996, longitude: 126.5312 },
];

// 미국 지역
export const usaRegions: CountryRegion[] = [
  { id: 'california', countryCode: 'US', name: 'California', nameLocalized: { ko: '캘리포니아', en: 'California', ja: 'カリフォルニア', 'zh-CN': '加利福尼亚', vi: 'California', th: 'แคลิฟอร์เนีย' }, type: 'state', latitude: 36.7783, longitude: -119.4179 },
  { id: 'florida', countryCode: 'US', name: 'Florida', nameLocalized: { ko: '플로리다', en: 'Florida', ja: 'フロリダ', 'zh-CN': '佛罗里达', vi: 'Florida', th: 'ฟลอริดา' }, type: 'state', latitude: 27.7663, longitude: -81.6868 },
  { id: 'texas', countryCode: 'US', name: 'Texas', nameLocalized: { ko: '텍사스', en: 'Texas', ja: 'テキサス', 'zh-CN': '德克萨斯', vi: 'Texas', th: 'เท็กซัส' }, type: 'state', latitude: 31.9686, longitude: -99.9018 },
  { id: 'washington', countryCode: 'US', name: 'Washington', nameLocalized: { ko: '워싱턴', en: 'Washington', ja: 'ワシントン', 'zh-CN': '华盛顿', vi: 'Washington', th: 'วอชิงตัน' }, type: 'state', latitude: 47.7511, longitude: -120.7401 },
  { id: 'oregon', countryCode: 'US', name: 'Oregon', nameLocalized: { ko: '오레곤', en: 'Oregon', ja: 'オレゴン', 'zh-CN': '俄勒冈', vi: 'Oregon', th: 'โอเรกอน' }, type: 'state', latitude: 43.8041, longitude: -120.5542 },
];

// 일본 지역
export const japanRegions: CountryRegion[] = [
  { id: 'hokkaido', countryCode: 'JP', name: 'Hokkaido', nameLocalized: { ko: '홋카이도', en: 'Hokkaido', ja: '北海道', 'zh-CN': '北海道', vi: 'Hokkaido', th: 'ฮอกไกโด' }, type: 'prefecture', latitude: 43.0642, longitude: 141.3469 },
  { id: 'aomori', countryCode: 'JP', name: 'Aomori', nameLocalized: { ko: '아오모리', en: 'Aomori', ja: '青森', 'zh-CN': '青森', vi: 'Aomori', th: 'อาโอโมริ' }, type: 'prefecture', latitude: 40.8244, longitude: 140.7405 },
  { id: 'fukushima', countryCode: 'JP', name: 'Fukushima', nameLocalized: { ko: '후쿠시마', en: 'Fukushima', ja: '福島', 'zh-CN': '福岛', vi: 'Fukushima', th: 'ฟุกุชิมะ' }, type: 'prefecture', latitude: 37.7500, longitude: 140.4676 },
  { id: 'yamanashi', countryCode: 'JP', name: 'Yamanashi', nameLocalized: { ko: '야마나시', en: 'Yamanashi', ja: '山梨', 'zh-CN': '山梨', vi: 'Yamanashi', th: 'ยามานาชิ' }, type: 'prefecture', latitude: 35.6636, longitude: 138.5683 },
  { id: 'shizuoka', countryCode: 'JP', name: 'Shizuoka', nameLocalized: { ko: '시즈오카', en: 'Shizuoka', ja: '静岡', 'zh-CN': '静冈', vi: 'Shizuoka', th: 'ชิซูโอกะ' }, type: 'prefecture', latitude: 34.9769, longitude: 138.3831 },
];

// 중국 지역
export const chinaRegions: CountryRegion[] = [
  { id: 'sichuan', countryCode: 'CN', name: 'Sichuan', nameLocalized: { ko: '쓰촨', en: 'Sichuan', ja: '四川', 'zh-CN': '四川', vi: 'Tứ Xuyên', th: 'เสฉวน' }, type: 'province', latitude: 30.6624, longitude: 104.0633 },
  { id: 'yunnan', countryCode: 'CN', name: 'Yunnan', nameLocalized: { ko: '윈난', en: 'Yunnan', ja: '雲南', 'zh-CN': '云南', vi: 'Vân Nam', th: 'ยูนนาน' }, type: 'province', latitude: 25.0458, longitude: 102.7100 },
  { id: 'shandong', countryCode: 'CN', name: 'Shandong', nameLocalized: { ko: '산둥', en: 'Shandong', ja: '山東', 'zh-CN': '山东', vi: 'Sơn Đông', th: 'ซานตง' }, type: 'province', latitude: 36.6512, longitude: 117.1201 },
  { id: 'guangdong', countryCode: 'CN', name: 'Guangdong', nameLocalized: { ko: '광둥', en: 'Guangdong', ja: '広東', 'zh-CN': '广东', vi: 'Quảng Đông', th: 'กวางตุ้ง' }, type: 'province', latitude: 23.1291, longitude: 113.2644 },
  { id: 'zhejiang', countryCode: 'CN', name: 'Zhejiang', nameLocalized: { ko: '저장', en: 'Zhejiang', ja: '浙江', 'zh-CN': '浙江', vi: 'Chiết Giang', th: 'เจ้อเจียง' }, type: 'province', latitude: 30.2741, longitude: 120.1551 },
];

// 베트남 지역
export const vietnamRegions: CountryRegion[] = [
  { id: 'mekong-delta', countryCode: 'VN', name: 'Mekong Delta', nameLocalized: { ko: '메콩 델타', en: 'Mekong Delta', ja: 'メコンデルタ', 'zh-CN': '湄公河三角洲', vi: 'Đồng bằng sông Cửu Long', th: 'สามเหลี่ยมปากแม่น้ำโขง' }, type: 'region', latitude: 10.0452, longitude: 105.7469 },
  { id: 'red-river-delta', countryCode: 'VN', name: 'Red River Delta', nameLocalized: { ko: '홍강 델타', en: 'Red River Delta', ja: '紅河デルタ', 'zh-CN': '红河三角洲', vi: 'Đồng bằng sông Hồng', th: 'สามเหลี่ยมปากแม่น้ำแดง' }, type: 'region', latitude: 20.8449, longitude: 106.6881 },
  { id: 'central-highlands', countryCode: 'VN', name: 'Central Highlands', nameLocalized: { ko: '중부 고원', en: 'Central Highlands', ja: '中部高原', 'zh-CN': '中部高原', vi: 'Tây Nguyên', th: 'ที่ราบสูงตอนกลาง' }, type: 'region', latitude: 14.0583, longitude: 108.2772 },
  { id: 'north-central', countryCode: 'VN', name: 'North Central', nameLocalized: { ko: '북중부', en: 'North Central', ja: '北中部', 'zh-CN': '北中部', vi: 'Bắc Trung Bộ', th: 'ภาคกลางตอนเหนือ' }, type: 'region', latitude: 19.8067, longitude: 105.7717 },
];

// 태국 지역
export const thailandRegions: CountryRegion[] = [
  { id: 'northern-thailand', countryCode: 'TH', name: 'Northern Thailand', nameLocalized: { ko: '북부 태국', en: 'Northern Thailand', ja: '北部タイ', 'zh-CN': '泰国北部', vi: 'Bắc Thái Lan', th: 'ภาคเหนือ' }, type: 'region', latitude: 18.7883, longitude: 98.9853 },
  { id: 'northeastern-thailand', countryCode: 'TH', name: 'Northeastern Thailand', nameLocalized: { ko: '동북부 태국', en: 'Northeastern Thailand', ja: '東北部タイ', 'zh-CN': '泰国东北部', vi: 'Đông Bắc Thái Lan', th: 'ภาคตะวันออกเฉียงเหนือ' }, type: 'region', latitude: 16.0000, longitude: 103.0000 },
  { id: 'central-thailand', countryCode: 'TH', name: 'Central Thailand', nameLocalized: { ko: '중부 태국', en: 'Central Thailand', ja: '中部タイ', 'zh-CN': '泰国中部', vi: 'Trung tâm Thái Lan', th: 'ภาคกลาง' }, type: 'region', latitude: 14.0583, longitude: 100.5354 },
  { id: 'southern-thailand', countryCode: 'TH', name: 'Southern Thailand', nameLocalized: { ko: '남부 태국', en: 'Southern Thailand', ja: '南部タイ', 'zh-CN': '泰国南部', vi: 'Nam Thái Lan', th: 'ภาคใต้' }, type: 'region', latitude: 7.8804, longitude: 98.3923 },
];

/**
 * 국가별 지역 데이터 맵
 */
export const countryRegionsMap: Record<CountryCode, CountryRegion[]> = {
  KR: koreaRegions,
  US: usaRegions,
  JP: japanRegions,
  CN: chinaRegions,
  VN: vietnamRegions,
  TH: thailandRegions,
};

/**
 * 현재 로케일에 맞는 지역 목록 가져오기
 */
export function getRegionsByCountry(countryCode: CountryCode): CountryRegion[] {
  return countryRegionsMap[countryCode] || [];
}

/**
 * 지역 ID로 지역 찾기
 */
export function getRegionById(regionId: string, countryCode: CountryCode): CountryRegion | undefined {
  return countryRegionsMap[countryCode]?.find((r) => r.id === regionId);
}

/**
 * 현재 로케일에 맞는 지역명 가져오기
 */
export function getRegionName(region: CountryRegion, locale: Locale): string {
  return region.nameLocalized[locale] || region.name;
}
