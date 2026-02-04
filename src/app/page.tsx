'use client';

import { useState, Suspense } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { LiveStreamCard } from '@/components/live-stream-card';
import { Button } from '@/components/ui/button';
import { MiniRankingBoard } from '@/components/mini-ranking-board';
import { PlayerModal } from '@/components/player-modal';
import { 
  Radio, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  Play,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { mockLiveStreams, mockReplayStreams } from '@/data/mock-live-streams';
import type { LiveEntry } from '@/types/bj';

function PlayerModalWrapper() {
  return (
    <Suspense fallback={null}>
      <PlayerModal />
    </Suspense>
  );
}

const categories = [
  { id: 'all', name: 'ALL 전체', icon: '📺' },
  { id: 'beauty', name: '뷰티', icon: '💄' },
  { id: 'food', name: '푸드', icon: '🍽️' },
  { id: 'fashion', name: '패션', icon: '👔' },
  { id: 'life', name: '라이프', icon: '🪑' },
  { id: 'travel', name: '여행/체험', icon: '🧳' },
  { id: 'kids', name: '키즈', icon: '🚂' },
  { id: 'tech', name: '테크', icon: '💻' },
  { id: 'hobby', name: '취미레저', icon: '⛺' },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'viewer' | 'recent'>('viewer');

  // 인기 라이브 (시청자 수 기준 정렬)
  const popularLiveStreams = [...mockLiveStreams]
    .sort((a, b) => b.viewerCount - a.viewerCount)
    .slice(0, 8);

  // 최근 라이브 (시간 기준 정렬)
  const recentLiveStreams = [...mockLiveStreams]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .slice(0, 8);

  // 정렬된 라이브 목록
  const sortedLiveStreams = sortBy === 'viewer' ? popularLiveStreams : recentLiveStreams;

  // 시청자 수 포맷
  const formatViewerCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}만`;
    }
    return count.toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background">
        {/* 히어로 섹션 - 라이브 진행 중 */}
        <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                지금 라이브 중
              </h1>
              <p className="text-sm sm:text-base text-zinc-400">
                실시간으로 진행되는 라이브 방송을 만나보세요
              </p>
            </div>
            <Link href="/live">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                전체보기
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* 라이브 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {mockLiveStreams.slice(0, 4).map((stream) => (
              <LiveStreamCard key={stream.id} stream={stream} />
            ))}
          </div>

          {/* 더보기 버튼 (모바일) */}
          <div className="mt-6 text-center sm:hidden">
            <Link href="/live">
              <Button variant="outline" className="w-full">
                전체보기
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </section>

        {/* 인기 라이브 섹션 */}
        <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                요즘 대세! 인기 라이브
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'viewer' | 'recent')}
                className="px-3 py-1.5 rounded-lg bg-secondary border border-zinc-800/80 text-sm focus:outline-none focus:border-amber-500/50"
              >
                <option value="viewer">시청순</option>
                <option value="recent">최신순</option>
              </select>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 sm:gap-3 pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'bg-secondary text-zinc-400 border border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 인기 라이브 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedLiveStreams.map((stream, index) => (
              <LiveStreamCard
                key={stream.id}
                stream={stream}
                showRank={true}
                rank={index + 1}
              />
            ))}
          </div>
        </section>

        {/* 다시보기 섹션 */}
        <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">
                라이브는 놓쳤어도, 혜택은 놓치지 마세요!
              </h2>
            </div>
            <Link href="/replay">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                더보기
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <p className="text-sm sm:text-base text-zinc-400 mb-6">
            지난 라이브 방송을 다시 보고 특가 혜택을 받아보세요
          </p>

          {/* 다시보기 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {mockReplayStreams.map((stream) => (
              <LiveStreamCard key={stream.id} stream={stream} />
            ))}
          </div>

          {/* 더보기 버튼 (모바일) */}
          <div className="mt-6 text-center sm:hidden">
            <Link href="/replay">
              <Button variant="outline" className="w-full">
                더보기
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </section>

        {/* 미니 랭킹 섹션 */}
        <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 border-t border-zinc-800/80">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">크리에이터 랭킹</h2>
            <Link href="/ranking">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                전체 랭킹
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <MiniRankingBoard />
        </section>
      </main>
      <Footer />
      <PlayerModalWrapper />
    </div>
  );
}
