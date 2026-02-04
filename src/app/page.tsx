'use client';

import { useLiveRankingPolling } from '@/hooks/use-live-ranking';
import { LiveGrid } from '@/components/live-grid';
import { MiniRankingBoard } from '@/components/mini-ranking-board';
import { HeroCarousel } from '@/components/hero-carousel';
import { Header } from '@/components/header';
import { PlayerModal } from '@/components/player-modal';

export default function HomePage() {
  // 30초마다 자동 갱신
  useLiveRankingPolling(30000);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-6 sm:space-y-8">
          {/* 히어로 캐러셀 */}
          <HeroCarousel />

          {/* 라이브 방송 그리드 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-1">라이브 방송</h2>
            <LiveGrid />
          </section>

          {/* TOP 5 랭킹 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-1">실시간 랭킹</h2>
            <MiniRankingBoard />
          </section>
        </div>
      </main>
      <PlayerModal />
    </>
  );
}
