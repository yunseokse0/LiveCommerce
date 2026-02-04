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
    const donationRevenue = Math.floor(stream.viewerCount * 0.1 * 100) / 100; // 시청자 수의 10% 가정
    const superchatRevenue = Math.floor(stream.viewerCount * 0.05 * 100) / 100; // 시청자 수의 5% 가정
    const totalRevenue = donationRevenue + superchatRevenue;
    const currentScore = baseScore + totalRevenue * 10; // 후원 금액에 가중치 적용

    // 어제 대비 변동 (랜덤하게 생성)
    const diffFromYesterday = Math.floor(Math.random() * 20) - 10; // -10 ~ +10 사이

    return {
      rank: index + 1,
      bj: stream.bj,
      viewerCount: stream.viewerCount,
      currentScore: Math.floor(currentScore),
      diffFromYesterday,
      donationRevenue,
      superchatRevenue,
      totalRevenue,
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
