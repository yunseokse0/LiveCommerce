import { create } from 'zustand';
import type { RankingEntry, LiveEntry } from '@/types/bj';
import { mockLiveStreams } from '@/data/mock-live-streams';
import { mockRanking } from '@/data/mock-ranking';

interface LiveRankingState {
  liveList: LiveEntry[];
  ranking: RankingEntry[];
  isLoading: boolean;
  lastUpdated: Date | null;
  setLiveList: (list: LiveEntry[]) => void;
  setRanking: (ranking: RankingEntry[]) => void;
  setLoading: (loading: boolean) => void;
  refresh: () => Promise<void>;
}

export const useLiveRanking = create<LiveRankingState>((set) => ({
  liveList: mockLiveStreams, // 초기값으로 MOCK 데이터 설정
  ranking: mockRanking, // 초기값으로 MOCK 데이터 설정
  isLoading: false,
  lastUpdated: null,
  setLiveList: (list) => set({ liveList: list.length > 0 ? list : mockLiveStreams }),
  setRanking: (ranking) => set({ ranking: ranking.length > 0 ? ranking : mockRanking }),
  setLoading: (loading) => set({ isLoading: loading }),
  refresh: async () => {
    set({ isLoading: true });
    try {
      const [liveRes, rankingRes] = await Promise.all([
        fetch(`/api/live-list?t=${Date.now()}`),
        fetch(`/api/live-ranking?t=${Date.now()}`),
      ]);

      const liveData = await liveRes.json();
      const rankingData = await rankingRes.json();

      if (liveData.success && liveData.liveList && liveData.liveList.length > 0) {
        set({ liveList: liveData.liveList });
      } else {
        // API 실패 시 MOCK 데이터 유지
        set({ liveList: mockLiveStreams });
      }
      
      if (rankingData.success && rankingData.ranking && rankingData.ranking.length > 0) {
        set({ ranking: rankingData.ranking });
      } else {
        // API 실패 시 MOCK 데이터 유지
        set({ ranking: mockRanking });
      }
      
      set({ lastUpdated: new Date(), isLoading: false });
    } catch (error) {
      console.error('데이터 새로고침 오류, MOCK 데이터 사용:', error);
      // 에러 발생 시에도 MOCK 데이터 유지
      set({ liveList: mockLiveStreams, ranking: mockRanking, isLoading: false });
    }
  },
}));
