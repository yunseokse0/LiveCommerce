'use client';

import { useSearchParams } from 'next/navigation';
import { useLiveRanking } from '@/store/live-ranking';
import { UniversalPlayer } from '@/components/universal-player';

export function PlayerModal() {
  const searchParams = useSearchParams();
  const streamId = searchParams.get('stream');
  const { liveList } = useLiveRanking();

  if (!streamId) return null;

  const live = liveList.find((l) => l.bj.id === streamId);
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
