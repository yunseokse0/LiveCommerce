'use client';

import { useSearchParams } from 'next/navigation';
import { useLiveRanking } from '@/store/live-ranking';
import { UniversalPlayer } from '@/components/universal-player';

export function PlayerModal() {
  const searchParams = useSearchParams();
  const streamId = searchParams.get('stream');
  const { liveList } = useLiveRanking();

  if (!streamId) return null;

  // streamId로 라이브 스트림 찾기 (bj.id 또는 id로 매칭)
  const live = liveList.find((l) => l.bj.id === streamId || l.id === streamId || l.bjId === streamId);
  if (!live) return null;

  return (
    <UniversalPlayer
      bj={live.bj}
      title={live.title}
      streamUrl={live.streamUrl}
      hlsUrl={live.hlsUrl}
    />
  );
}
