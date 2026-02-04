import { useEffect, useRef } from 'react';
import { useLiveRanking } from '@/store/live-ranking';

export function useLiveRankingPolling(intervalMs: number = 30000) {
  const { refresh, lastUpdated } = useLiveRanking();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 초기 로드
    refresh();

    // 주기적 갱신
    intervalRef.current = setInterval(() => {
      refresh();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refresh, intervalMs]);

  return { lastUpdated };
}
