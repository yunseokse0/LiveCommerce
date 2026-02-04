export interface Region {
  id: string;
  code: string; // 행정구역 코드
  name: string; // 지역명
  type: 'sido' | 'sigungu'; // 시/도 또는 시/군/구
  parentId?: string; // 상위 지역 ID
  latitude: number; // 위도
  longitude: number; // 경도
  centerX?: number; // 지도 이미지 상의 X 좌표 (0-100%)
  centerY?: number; // 지도 이미지 상의 Y 좌표 (0-100%)
}

export interface LocalProduct {
  id: string;
  name: string; // 특산물명
  description?: string;
  imageUrl?: string;
  regionId: string; // 생산 지역
  category: '과일' | '채소' | '수산물' | '축산물' | '가공식품' | '기타';
  seasonStart?: number; // 계절 시작 월 (1-12)
  seasonEnd?: number; // 계절 종료 월 (1-12)
  isActive: boolean;
}

export interface CreatorRegion {
  id: string;
  bjId: string;
  regionId: string;
  isPrimary: boolean; // 주요 활동 지역 여부
}
