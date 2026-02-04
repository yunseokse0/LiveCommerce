'use client';

import { useLiveRankingPolling } from '@/hooks/use-live-ranking';
import { LiveGrid } from '@/components/live-grid';
import { Header } from '@/components/header';
import { PlayerModal } from '@/components/player-modal';

export default function LivePage() {
  useLiveRankingPolling(30000);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 px-1">라이브 방송</h1>
          <LiveGrid />
        </div>
      </main>
      <PlayerModal />
    </>
  );
}
