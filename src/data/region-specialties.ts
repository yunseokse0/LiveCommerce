/**
 * 지역별 제철 특산물 데이터
 * 계절별 특산물 정보 포함
 */

export type Season = '봄' | '여름' | '가을' | '겨울' | '연중';

export interface Specialty {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
  subRegion?: string; // 세부 지역 (예: 이천, 가평)
  category: '과일' | '채소' | '수산물' | '축산물' | '가공식품' | '곡물' | '버섯' | '기타';
  seasons: Season[];
  description?: string;
  imageUrl?: string;
  isLandmark: boolean; // 랜드마크 특산물 여부
  isActive: boolean;
}

export const regionSpecialties: Specialty[] = [
  // 강원도
  {
    id: 'gangwon-corn',
    name: '옥수수',
    regionId: 'gangwon',
    regionName: '강원도',
    category: '곡물',
    seasons: ['여름'],
    description: '고산지대의 시원함을 담은 옥수수',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gangwon-potato',
    name: '감자',
    regionId: 'gangwon',
    regionName: '강원도',
    category: '채소',
    seasons: ['여름'],
    description: '고산지대의 시원함을 담은 감자',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gangwon-matsutake',
    name: '송이버섯',
    regionId: 'gangwon',
    regionName: '강원도',
    subRegion: '양양',
    category: '버섯',
    seasons: ['가을'],
    description: '산의 보약이라 불리는 송이버섯',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gangwon-hwangtae',
    name: '황태',
    regionId: 'gangwon',
    regionName: '강원도',
    category: '수산물',
    seasons: ['겨울'],
    description: '강원도의 겨울 별미 황태',
    isLandmark: true,
    isActive: true,
  },

  // 경기도
  {
    id: 'gyeonggi-icheon-rice',
    name: '이천 쌀',
    regionId: 'gyeonggi',
    regionName: '경기도',
    subRegion: '이천',
    category: '곡물',
    seasons: ['가을'],
    description: '임금님 수라상에 오르던 쌀',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gyeonggi-gapyeong-pine-nut',
    name: '가평 잣',
    regionId: 'gyeonggi',
    regionName: '경기도',
    subRegion: '가평',
    category: '기타',
    seasons: ['가을'],
    description: '가평의 고소한 잣',
    isLandmark: true,
    isActive: true,
  },

  // 경상북도
  {
    id: 'gyeongbuk-andong-apple',
    name: '안동 사과',
    regionId: 'gyeongbuk',
    regionName: '경상북도',
    subRegion: '안동',
    category: '과일',
    seasons: ['가을'],
    description: '아삭한 식감이 일품인 사과',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gyeongbuk-seongju-melon',
    name: '성주 참외',
    regionId: 'gyeongbuk',
    regionName: '경상북도',
    subRegion: '성주',
    category: '과일',
    seasons: ['봄'],
    description: '달콤한 성주 참외',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gyeongbuk-pohang-gwamegi',
    name: '포항 과메기',
    regionId: 'gyeongbuk',
    regionName: '경상북도',
    subRegion: '포항',
    category: '수산물',
    seasons: ['겨울'],
    description: '찬바람에 얼고 녹기를 반복한 과메기',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gyeongbuk-yeongdeok-crab',
    name: '영덕 대게',
    regionId: 'gyeongbuk',
    regionName: '경상북도',
    subRegion: '영덕',
    category: '수산물',
    seasons: ['겨울'],
    description: '영덕의 싱싱한 대게',
    isLandmark: true,
    isActive: true,
  },

  // 충청도
  {
    id: 'chungbuk-chungju-apple',
    name: '충주 사과',
    regionId: 'chungbuk',
    regionName: '충청북도',
    subRegion: '충주',
    category: '과일',
    seasons: ['가을'],
    description: '달콤한 충주 사과',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'chungnam-geumsan-ginseng',
    name: '금산 인삼',
    regionId: 'chungnam',
    regionName: '충청남도',
    subRegion: '금산',
    category: '기타',
    seasons: ['가을'],
    description: '금산의 명품 인삼',
    isLandmark: true,
    isActive: true,
  },

  // 경상남도
  {
    id: 'gyeongnam-tongyeong-oyster',
    name: '통영 굴',
    regionId: 'gyeongnam',
    regionName: '경상남도',
    subRegion: '통영',
    category: '수산물',
    seasons: ['겨울'],
    description: '바다의 우유라 불리는 굴',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gyeongnam-namhae-anchovy',
    name: '남해 멸치',
    regionId: 'gyeongnam',
    regionName: '경상남도',
    subRegion: '남해',
    category: '수산물',
    seasons: ['봄'],
    description: '남해의 싱싱한 멸치',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gyeongnam-miryang-strawberry',
    name: '밀양 딸기',
    regionId: 'gyeongnam',
    regionName: '경상남도',
    subRegion: '밀양',
    category: '과일',
    seasons: ['봄'],
    description: '달콤한 밀양 딸기',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'gyeongnam-geoje-yuzu',
    name: '거제 유자',
    regionId: 'gyeongnam',
    regionName: '경상남도',
    subRegion: '거제',
    category: '과일',
    seasons: ['겨울'],
    description: '거제의 상큼한 유자',
    isLandmark: true,
    isActive: true,
  },

  // 전라북도
  {
    id: 'jeonbuk-gochang-watermelon',
    name: '고창 수박',
    regionId: 'jeonbuk',
    regionName: '전라북도',
    subRegion: '고창',
    category: '과일',
    seasons: ['여름'],
    description: '무더위를 날려주는 시원한 수박',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'jeonbuk-jeonju-minari',
    name: '전주 미나리',
    regionId: 'jeonbuk',
    regionName: '전라북도',
    subRegion: '전주',
    category: '채소',
    seasons: ['봄'],
    description: '전주의 싱싱한 미나리',
    isLandmark: true,
    isActive: true,
  },

  // 전라남도
  {
    id: 'jeonnam-yeongam-fig',
    name: '영암 무화과',
    regionId: 'jeonnam',
    regionName: '전라남도',
    subRegion: '영암',
    category: '과일',
    seasons: ['가을'],
    description: '영암의 달콤한 무화과',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'jeonnam-beolgyo-cockle',
    name: '벌교 꼬막',
    regionId: 'jeonnam',
    regionName: '전라남도',
    subRegion: '벌교',
    category: '수산물',
    seasons: ['겨울'],
    description: '쫄깃한 식감이 예술인 꼬막',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'jeonnam-wando-abalone',
    name: '완도 전복',
    regionId: 'jeonnam',
    regionName: '전라남도',
    subRegion: '완도',
    category: '수산물',
    seasons: ['여름', '가을'],
    description: '바다의 에너지를 품은 전복',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'jeonnam-naju-pear',
    name: '나주 배',
    regionId: 'jeonnam',
    regionName: '전라남도',
    subRegion: '나주',
    category: '과일',
    seasons: ['가을'],
    description: '나주의 달콤한 배',
    isLandmark: true,
    isActive: true,
  },

  // 제주도
  {
    id: 'jeju-citrus',
    name: '감귤/한라봉',
    regionId: 'jeju',
    regionName: '제주특별자치도',
    category: '과일',
    seasons: ['겨울'],
    description: '겨울철 비타민 창고 노지 감귤',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'jeju-amberjack',
    name: '방어',
    regionId: 'jeju',
    regionName: '제주특별자치도',
    category: '수산물',
    seasons: ['겨울'],
    description: '찬물에 살이 오른 방어',
    isLandmark: true,
    isActive: true,
  },
  {
    id: 'jeju-red-snapper',
    name: '옥돔',
    regionId: 'jeju',
    regionName: '제주특별자치도',
    category: '수산물',
    seasons: ['연중'],
    description: '제주의 신선한 옥돔',
    isLandmark: true,
    isActive: true,
  },
];

/**
 * 지역별 특산물 조회
 */
export function getSpecialtiesByRegion(regionId: string): Specialty[] {
  return regionSpecialties.filter((s) => s.regionId === regionId && s.isActive);
}

/**
 * 계절별 특산물 조회
 */
export function getSpecialtiesBySeason(season: Season): Specialty[] {
  return regionSpecialties.filter(
    (s) => s.isActive && (s.seasons.includes(season) || s.seasons.includes('연중'))
  );
}

/**
 * 카테고리별 특산물 조회
 */
export function getSpecialtiesByCategory(category: Specialty['category']): Specialty[] {
  return regionSpecialties.filter((s) => s.isActive && s.category === category);
}

/**
 * 랜드마크 특산물 조회
 */
export function getLandmarkSpecialties(): Specialty[] {
  return regionSpecialties.filter((s) => s.isActive && s.isLandmark);
}
