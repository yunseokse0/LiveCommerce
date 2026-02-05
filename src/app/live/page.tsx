'use client';

import { Suspense } from 'react';
import { useLiveRankingPolling } from '@/hooks/use-live-ranking';
import { LiveGrid } from '@/components/live-grid';
import { Header } from '@/components/header';
import { PlayerModal } from '@/components/player-modal';
import { useTranslation } from '@/hooks/use-translation';

function PlayerModalWrapper() {
  return (
    <Suspense fallback={null}>
      <PlayerModal />
    </Suspense>
  );
}

export default function LivePage() {
  const { t } = useTranslation();
  useLiveRankingPolling(30000);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 px-1">{t('live.title')}</h1>
          <LiveGrid />
        </div>
      </main>
      <PlayerModalWrapper />
    </>
  );
}
