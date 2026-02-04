/**
 * 랭킹용 MOCK 데이터
 */

import type { RankingEntry } from '@/types/bj';
import { mockLiveStreams } from './mock-live-streams';

// 랭킹 MOCK 데이터 생성 (라이브 스트림 데이터 기반)
export const mockRanking: RankingEntry[] = mockLiveStreams
  .map((stream, index) => {
    // 랭킹 점수 계산 (시청자 수 + 후원 금액 기반)
    const baseScore = stream.viewerCount;
    // 더 현실적인 후원 금액 계산 (시청자당 평균 후원)
    const donationRevenue = Math.floor(stream.viewerCount * 0.15 * 100) / 100; // 시청자 수의 15% 가정
    const superchatRevenue = Math.floor(stream.viewerCount * 0.08 * 100) / 100; // 시청자 수의 8% 가정
    const totalRevenue = donationRevenue + superchatRevenue;
    const currentScore = baseScore + totalRevenue * 10; // 후원 금액에 가중치 적용

    // 어제 대비 변동 (더 현실적인 범위로 생성)
    const diffFromYesterday = Math.floor(Math.random() * 30) - 15; // -15 ~ +15 사이

    return {
      rank: index + 1,
      bj: stream.bj,
      viewerCount: stream.viewerCount,
      currentScore: Math.floor(currentScore),
      diffFromYesterday,
      donationRevenue: Math.floor(donationRevenue * 100) / 100,
      superchatRevenue: Math.floor(superchatRevenue * 100) / 100,
      totalRevenue: Math.floor(totalRevenue * 100) / 100,
    };
  })
  .sort((a, b) => b.currentScore - a.currentScore) // 점수 순으로 정렬
  .map((entry, index) => ({
    ...entry,
    rank: index + 1, // 정렬 후 랭킹 재설정
  }));

// 상위 10개만 반환하는 헬퍼 함수
export function getTopRanking(limit: number = 10): RankingEntry[] {
  return mockRanking.slice(0, limit);
}

// 특정 크리에이터의 랭킹 조회
export function getRankingByBjId(bjId: string): RankingEntry | undefined {
  return mockRanking.find((entry) => entry.bj.id === bjId);
}
