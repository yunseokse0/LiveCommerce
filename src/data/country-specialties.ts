/**
 * 국가별 특산물 데이터
 */

import type { CountrySpecialty, CountryCode } from '@/types/country';
import type { Locale } from '@/store/i18n';

// 한국 특산물 (기존 데이터를 변환)
export const koreaSpecialties: CountrySpecialty[] = [
  {
    id: 'gangwon-corn',
    name: 'Corn',
    nameLocalized: { ko: '옥수수', en: 'Corn', ja: 'トウモロコシ', 'zh-CN': '玉米', vi: 'Ngô', th: 'ข้าวโพด' },
    regionId: 'gangwon',
    countryCode: 'KR',
    category: 'grain',
    categoryLocalized: { ko: '곡물', en: 'Grain', ja: '穀物', 'zh-CN': '谷物', vi: 'Ngũ cốc', th: 'ธัญพืช' },
    seasons: ['summer'],
    seasonsLocalized: { ko: ['여름'], en: ['Summer'], ja: ['夏'], 'zh-CN': ['夏季'], vi: ['Mùa hè'], th: ['ฤดูร้อน'] },
    description: 'Fresh corn from highland',
    descriptionLocalized: { ko: '고산지대의 시원함을 담은 옥수수', en: 'Fresh corn from highland', ja: '高地の爽やかなトウモロコシ', 'zh-CN': '高地的清爽玉米', vi: 'Ngô tươi từ vùng cao', th: 'ข้าวโพดสดจากที่สูง' },
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'jeju-citrus',
    name: 'Citrus',
    nameLocalized: { ko: '감귤/한라봉', en: 'Citrus', ja: '柑橘類', 'zh-CN': '柑橘', vi: 'Cam quýt', th: 'ส้ม' },
    regionId: 'jeju',
    countryCode: 'KR',
    category: 'fruit',
    categoryLocalized: { ko: '과일', en: 'Fruit', ja: '果物', 'zh-CN': '水果', vi: 'Trái cây', th: 'ผลไม้' },
    seasons: ['winter'],
    seasonsLocalized: { ko: ['겨울'], en: ['Winter'], ja: ['冬'], 'zh-CN': ['冬季'], vi: ['Mùa đông'], th: ['ฤดูหนาว'] },
    description: 'Winter vitamin warehouse',
    descriptionLocalized: { ko: '겨울철 비타민 창고 노지 감귤', en: 'Winter vitamin warehouse', ja: '冬のビタミン倉庫', 'zh-CN': '冬季维生素仓库', vi: 'Kho vitamin mùa đông', th: 'คลังวิตามินฤดูหนาว' },
    isLandmark: true,
    isActive: true,
  },
];

// 미국 특산물
export const usaSpecialties: CountrySpecialty[] = [
  {
    id: 'california-orange',
    name: 'California Orange',
    nameLocalized: { ko: '캘리포니아 오렌지', en: 'California Orange', ja: 'カリフォルニアオレンジ', 'zh-CN': '加利福尼亚橙', vi: 'Cam California', th: 'ส้มแคลิฟอร์เนีย' },
    regionId: 'california',
    countryCode: 'US',
    category: 'fruit',
    categoryLocalized: { ko: '과일', en: 'Fruit', ja: '果物', 'zh-CN': '水果', vi: 'Trái cây', th: 'ผลไม้' },
    seasons: ['winter', 'spring'],
    seasonsLocalized: { ko: ['겨울', '봄'], en: ['Winter', 'Spring'], ja: ['冬', '春'], 'zh-CN': ['冬季', '春季'], vi: ['Mùa đông', 'Mùa xuân'], th: ['ฤดูหนาว', 'ฤดูใบไม้ผลิ'] },
    description: 'Sweet and juicy California oranges',
    descriptionLocalized: { ko: '달콤하고 맛있는 캘리포니아 오렌지', en: 'Sweet and juicy California oranges', ja: '甘くてジューシーなカリフォルニアオレンジ', 'zh-CN': '甜美多汁的加利福尼亚橙', vi: 'Cam California ngọt ngào và mọng nước', th: 'ส้มแคลิฟอร์เนียหวานและฉ่ำ' },
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'florida-grapefruit',
    name: 'Florida Grapefruit',
    nameLocalized: { ko: '플로리다 자몽', en: 'Florida Grapefruit', ja: 'フロリダグレープフルーツ', 'zh-CN': '佛罗里达葡萄柚', vi: 'Bưởi Florida', th: 'เกรปฟรุตฟลอริดา' },
    regionId: 'florida',
    countryCode: 'US',
    category: 'fruit',
    categoryLocalized: { ko: '과일', en: 'Fruit', ja: '果物', 'zh-CN': '水果', vi: 'Trái cây', th: 'ผลไม้' },
    seasons: ['winter', 'spring'],
    seasonsLocalized: { ko: ['겨울', '봄'], en: ['Winter', 'Spring'], ja: ['冬', '春'], 'zh-CN': ['冬季', '春季'], vi: ['Mùa đông', 'Mùa xuân'], th: ['ฤดูหนาว', 'ฤดูใบไม้ผลิ'] },
    description: 'Fresh Florida grapefruit',
    descriptionLocalized: { ko: '신선한 플로리다 자몽', en: 'Fresh Florida grapefruit', ja: '新鮮なフロリダグレープフルーツ', 'zh-CN': '新鲜的佛罗里达葡萄柚', vi: 'Bưởi Florida tươi', th: 'เกรปฟรุตฟลอริดาสด' },
    isLandmark: true,
    isActive: true,
  },
];

// 일본 특산물
export const japanSpecialties: CountrySpecialty[] = [
  {
    id: 'hokkaido-corn',
    name: 'Hokkaido Corn',
    nameLocalized: { ko: '홋카이도 옥수수', en: 'Hokkaido Corn', ja: '北海道トウモロコシ', 'zh-CN': '北海道玉米', vi: 'Ngô Hokkaido', th: 'ข้าวโพดฮอกไกโด' },
    regionId: 'hokkaido',
    countryCode: 'JP',
    category: 'grain',
    categoryLocalized: { ko: '곡물', en: 'Grain', ja: '穀物', 'zh-CN': '谷物', vi: 'Ngũ cốc', th: 'ธัญพืช' },
    seasons: ['summer'],
    seasonsLocalized: { ko: ['여름'], en: ['Summer'], ja: ['夏'], 'zh-CN': ['夏季'], vi: ['Mùa hè'], th: ['ฤดูร้อน'] },
    description: 'Sweet Hokkaido corn',
    descriptionLocalized: { ko: '달콤한 홋카이도 옥수수', en: 'Sweet Hokkaido corn', ja: '甘い北海道トウモロコシ', 'zh-CN': '甜美的北海道玉米', vi: 'Ngô Hokkaido ngọt', th: 'ข้าวโพดฮอกไกโดหวาน' },
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'yamanashi-peach',
    name: 'Yamanashi Peach',
    nameLocalized: { ko: '야마나시 복숭아', en: 'Yamanashi Peach', ja: '山梨桃', 'zh-CN': '山梨桃', vi: 'Đào Yamanashi', th: 'ลูกพีชยามานาชิ' },
    regionId: 'yamanashi',
    countryCode: 'JP',
    category: 'fruit',
    categoryLocalized: { ko: '과일', en: 'Fruit', ja: '果物', 'zh-CN': '水果', vi: 'Trái cây', th: 'ผลไม้' },
    seasons: ['summer'],
    seasonsLocalized: { ko: ['여름'], en: ['Summer'], ja: ['夏'], 'zh-CN': ['夏季'], vi: ['Mùa hè'], th: ['ฤดูร้อน'] },
    description: 'Juicy Yamanashi peaches',
    descriptionLocalized: { ko: '맛있는 야마나시 복숭아', en: 'Juicy Yamanashi peaches', ja: 'ジューシーな山梨桃', 'zh-CN': '多汁的山梨桃', vi: 'Đào Yamanashi mọng nước', th: 'ลูกพีชยามานาชิฉ่ำ' },
    isLandmark: true,
    isActive: true,
  },
];

// 중국 특산물
export const chinaSpecialties: CountrySpecialty[] = [
  {
    id: 'sichuan-pepper',
    name: 'Sichuan Pepper',
    nameLocalized: { ko: '쓰촨 후추', en: 'Sichuan Pepper', ja: '四川胡椒', 'zh-CN': '四川花椒', vi: 'Tiêu Tứ Xuyên', th: 'พริกไทยเสฉวน' },
    regionId: 'sichuan',
    countryCode: 'CN',
    category: 'other',
    categoryLocalized: { ko: '기타', en: 'Other', ja: 'その他', 'zh-CN': '其他', vi: 'Khác', th: 'อื่นๆ' },
    seasons: ['autumn'],
    seasonsLocalized: { ko: ['가을'], en: ['Autumn'], ja: ['秋'], 'zh-CN': ['秋季'], vi: ['Mùa thu'], th: ['ฤดูใบไม้ร่วง'] },
    description: 'Spicy Sichuan pepper',
    descriptionLocalized: { ko: '매콤한 쓰촨 후추', en: 'Spicy Sichuan pepper', ja: '辛い四川胡椒', 'zh-CN': '麻辣四川花椒', vi: 'Tiêu Tứ Xuyên cay', th: 'พริกไทยเสฉวนเผ็ด' },
    isLandmark: true,
    isActive: true,
  },
];

// 베트남 특산물
export const vietnamSpecialties: CountrySpecialty[] = [
  {
    id: 'mekong-rice',
    name: 'Mekong Rice',
    nameLocalized: { ko: '메콩 쌀', en: 'Mekong Rice', ja: 'メコン米', 'zh-CN': '湄公河大米', vi: 'Gạo Mekong', th: 'ข้าวแม่น้ำโขง' },
    regionId: 'mekong-delta',
    countryCode: 'VN',
    category: 'grain',
    categoryLocalized: { ko: '곡물', en: 'Grain', ja: '穀物', 'zh-CN': '谷物', vi: 'Ngũ cốc', th: 'ธัญพืช' },
    seasons: ['autumn', 'winter'],
    seasonsLocalized: { ko: ['가을', '겨울'], en: ['Autumn', 'Winter'], ja: ['秋', '冬'], 'zh-CN': ['秋季', '冬季'], vi: ['Mùa thu', 'Mùa đông'], th: ['ฤดูใบไม้ร่วง', 'ฤดูหนาว'] },
    description: 'Premium Mekong Delta rice',
    descriptionLocalized: { ko: '프리미엄 메콩 델타 쌀', en: 'Premium Mekong Delta rice', ja: 'プレミアムメコンデルタ米', 'zh-CN': '优质湄公河三角洲大米', vi: 'Gạo Đồng bằng sông Cửu Long cao cấp', th: 'ข้าวคุณภาพสูงจากสามเหลี่ยมปากแม่น้ำโขง' },
    isLandmark: true,
    isActive: true,
  },
];

// 태국 특산물
export const thailandSpecialties: CountrySpecialty[] = [
  {
    id: 'thailand-durian',
    name: 'Thailand Durian',
    nameLocalized: { ko: '태국 두리안', en: 'Thailand Durian', ja: 'タイドリアン', 'zh-CN': '泰国榴莲', vi: 'Sầu riêng Thái Lan', th: 'ทุเรียนไทย' },
    regionId: 'southern-thailand',
    countryCode: 'TH',
    category: 'fruit',
    categoryLocalized: { ko: '과일', en: 'Fruit', ja: '果物', 'zh-CN': '水果', vi: 'Trái cây', th: 'ผลไม้' },
    seasons: ['summer'],
    seasonsLocalized: { ko: ['여름'], en: ['Summer'], ja: ['夏'], 'zh-CN': ['夏季'], vi: ['Mùa hè'], th: ['ฤดูร้อน'] },
    description: 'Fragrant Thai durian',
    descriptionLocalized: { ko: '향긋한 태국 두리안', en: 'Fragrant Thai durian', ja: '香り高いタイドリアン', 'zh-CN': '芳香的泰国榴莲', vi: 'Sầu riêng Thái Lan thơm', th: 'ทุเรียนไทยหอม' },
    isLandmark: true,
    isActive: true,
  },
];

/**
 * 국가별 특산물 데이터 맵
 */
export const countrySpecialtiesMap: Record<CountryCode, CountrySpecialty[]> = {
  KR: koreaSpecialties,
  US: usaSpecialties,
  JP: japanSpecialties,
  CN: chinaSpecialties,
  VN: vietnamSpecialties,
  TH: thailandSpecialties,
};

/**
 * 국가별 특산물 가져오기
 */
export function getSpecialtiesByCountry(countryCode: CountryCode): CountrySpecialty[] {
  return countrySpecialtiesMap[countryCode] || [];
}

/**
 * 지역별 특산물 가져오기
 */
export function getSpecialtiesByRegion(regionId: string, countryCode: CountryCode): CountrySpecialty[] {
  return (countrySpecialtiesMap[countryCode] || []).filter((s) => s.regionId === regionId && s.isActive);
}

/**
 * 현재 로케일에 맞는 특산물명 가져오기
 */
export function getSpecialtyName(specialty: CountrySpecialty, locale: Locale): string {
  return specialty.nameLocalized[locale] || specialty.name;
}

/**
 * 현재 로케일에 맞는 특산물 설명 가져오기
 */
export function getSpecialtyDescription(specialty: CountrySpecialty, locale: Locale): string | undefined {
  return specialty.descriptionLocalized?.[locale] || specialty.description;
}
