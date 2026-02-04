import { create } from 'zustand';
import type { RankingEntry, LiveEntry } from '@/types/bj';

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
  liveList: [],
  ranking: [],
  isLoading: false,
  lastUpdated: null,
  setLiveList: (list) => set({ liveList: list }),
  setRanking: (ranking) => set({ ranking }),
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

      if (liveData.success) {
        set({ liveList: liveData.liveList });
      }
      if (rankingData.success) {
        set({ ranking: rankingData.ranking });
      }
      set({ lastUpdated: new Date(), isLoading: false });
    } catch (error) {
      console.error('데이터 새로고침 오류:', error);
      set({ isLoading: false });
    }
  },
}));
