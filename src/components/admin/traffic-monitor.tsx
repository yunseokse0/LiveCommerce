'use client';

import { useState, useEffect } from 'react';
import { Users, Radio, Eye, Activity, AlertCircle } from 'lucide-react';
import { useLiveRanking } from '@/store/live-ranking';
import { useTranslation } from '@/hooks/use-translation';

export function TrafficMonitor() {
  const { liveList } = useLiveRanking();
  const [currentUsers, setCurrentUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Mock 데이터: 현재 접속자 수 (실제로는 서버에서 가져와야 함)
    const mockCurrentUsers = Math.floor(Math.random() * 5000) + 1000;
    setCurrentUsers(mockCurrentUsers);
    setIsLoading(false);

    // 실시간 업데이트 (30초마다)
    const interval = setInterval(() => {
      const newUsers = Math.floor(Math.random() * 5000) + 1000;
      setCurrentUsers(newUsers);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // 현재 라이브 방송 수
  const activeStreams = liveList.filter((stream) => stream.isLive).length;
  
  // 총 시청자 수
  const totalViewers = liveList
    .filter((stream) => stream.isLive)
    .reduce((sum, stream) => sum + stream.viewerCount, 0);

  // 평균 시청자 수
  const avgViewers = activeStreams > 0 ? Math.floor(totalViewers / activeStreams) : 0;

  // 트래픽 상태 (부하 예측)
  const getTrafficStatus = () => {
    const load = (currentUsers / 10000) * 100; // 최대 10,000명 기준
    if (load < 50) return { level: 'low', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (load < 80) return { level: 'normal', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (load < 95) return { level: 'high', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { level: 'critical', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const trafficStatus = getTrafficStatus();

  if (isLoading) {
    return (
      <div className="text-center py-8 text-zinc-400">{t('common.loading')}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 실시간 트래픽 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800/80 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">현재 접속자</span>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {currentUsers.toLocaleString()} {t('live.viewers')}
          </p>
          <div className="mt-2 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-zinc-400">실시간</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">동시 방송 수</span>
            <Radio className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {activeStreams}개
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            현재 라이브 중
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800/80 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">총 시청자 수</span>
            <Eye className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {totalViewers.toLocaleString()} {t('live.viewers')}
          </p>
          <p className="text-xs text-zinc-400 mt-1">
            평균 {avgViewers.toLocaleString()} {t('live.viewers')}/방송
          </p>
        </div>

        <div className={`p-4 rounded-xl border border-zinc-800/80 ${trafficStatus.bg}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">트래픽 상태</span>
            <Activity className={`w-5 h-5 ${trafficStatus.color}`} />
          </div>
          <p className={`text-2xl font-bold ${trafficStatus.color}`}>
            {trafficStatus.level === 'low' && '정상'}
            {trafficStatus.level === 'normal' && '보통'}
            {trafficStatus.level === 'high' && '높음'}
            {trafficStatus.level === 'critical' && '위험'}
          </p>
          <div className="mt-2 flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${trafficStatus.color.replace('text-', 'bg-')} ${trafficStatus.level === 'critical' ? 'animate-pulse' : ''}`} />
            <span className="text-xs text-zinc-400">
              부하: {((currentUsers / 10000) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 트래픽 경고 */}
      {trafficStatus.level === 'critical' && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-400 mb-1">트래픽 경고</h4>
            <p className="text-sm text-zinc-300">
              현재 서버 부하가 높습니다. 인프라 확장을 고려해주세요.
            </p>
          </div>
        </div>
      )}

      {/* 방송별 시청자 현황 */}
      <div className="p-6 rounded-xl border border-zinc-800/80 bg-card/50">
        <h3 className="text-lg font-semibold mb-4">방송별 시청자 현황</h3>
        <div className="space-y-2">
          {liveList.filter((s) => s.isLive).length > 0 ? (
            liveList
              .filter((s) => s.isLive)
              .sort((a, b) => b.viewerCount - a.viewerCount)
              .slice(0, 10)
              .map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-zinc-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{stream.title}</p>
                      <p className="text-xs text-zinc-400">{stream.bj.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-400">
                      {stream.viewerCount.toLocaleString()}명
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-center text-zinc-400 py-8">{t('live.noStreams')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
