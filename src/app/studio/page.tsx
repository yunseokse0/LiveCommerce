'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  Settings, 
  Play, 
  Square, 
  ExternalLink,
  Info,
  Package
} from 'lucide-react';
import { ProductManager } from '@/components/studio/product-manager';
import { DeliveryManager } from '@/components/studio/delivery-manager';
import { StreamingGuide } from '@/components/studio/streaming-guide';
import { PromotionManager } from '@/components/studio/promotion-manager';
import { useTranslation } from '@/hooks/use-translation';

interface StreamConfig {
  streamKey: string;
  streamId: string;
  rtmpUrl: string;
  hlsUrl: string;
}

interface StreamStatus {
  isActive: boolean;
  viewerCount?: number;
  startedAt?: Date;
}

export default function StudioPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [streamConfig, setStreamConfig] = useState<StreamConfig | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({ isActive: false });
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');

  // 스트림 상태 폴링
  useEffect(() => {
    if (!streamConfig?.streamId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/streaming/status?streamId=${streamConfig.streamId}`);
        if (response.ok) {
          const data = await response.json();
          setStreamStatus({ isActive: data.isActive || false });
        }
      } catch (error) {
        console.error('스트림 상태 조회 오류:', error);
      }
    }, 5000); // 5초마다 확인

    return () => clearInterval(interval);
  }, [streamConfig?.streamId]);

  // RTMP 스트림 키 생성
  const generateStreamKey = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/streaming/rtmp-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: user.id }),
      });

      if (!response.ok) throw new Error('스트림 키 생성 실패');

      const data = await response.json();
      setStreamConfig(data);
    } catch (error) {
      console.error('스트림 키 생성 오류:', error);
      alert(t('studio.generateKey') + ' ' + t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // 복사 기능
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-6xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('studio.title')}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* 메인 컨텐츠 */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* 방송 상태 카드 */}
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold">{t('studio.streamStatus')}</h2>
                  <div className="flex items-center gap-2">
                    {streamStatus.isActive ? (
                      <>
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm text-red-400">{t('studio.live')}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 rounded-full bg-zinc-500" />
                        <span className="text-sm text-zinc-400">{t('studio.offline')}</span>
                      </>
                    )}
                  </div>
                </div>

                {!streamConfig ? (
                  <div className="space-y-4">
                    <p className="text-sm sm:text-base text-zinc-400">
                      {user 
                        ? t('studio.generateKeyPrompt')
                        : t('studio.generateKeyPromptGuest')}
                    </p>
                    <Button
                      onClick={generateStreamKey}
                      disabled={isLoading || !user}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? t('studio.generating') : t('studio.generateKey')}
                    </Button>
                    {!user && (
                      <p className="text-xs text-zinc-500">
                        {t('studio.loginRequired')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => {
                          // TODO: 방송 시작 로직
                          alert(t('studio.startInOBS'));
                        }}
                        disabled={streamStatus.isActive}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {t('studio.startStream')}
                      </Button>
                      <Button
                        onClick={() => {
                          // TODO: 방송 종료 로직
                          alert(t('studio.endInOBS'));
                        }}
                        disabled={!streamStatus.isActive}
                        variant="outline"
                        className="flex-1"
                      >
                        <Square className="w-4 h-4 mr-2" />
                        {t('studio.endStream')}
                      </Button>
                    </div>

                    {streamStatus.isActive && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="text-sm text-amber-400">
                          {t('studio.currentlyStreaming')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 방송 설정 */}
              {streamConfig && (
                <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg sm:text-xl font-semibold">{t('studio.streamSettings')}</h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t('studio.streamTitle')}</label>
                      <input
                        type="text"
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder={t('studio.streamTitlePlaceholder')}
                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">{t('studio.streamDescription')}</label>
                      <textarea
                        value={streamDescription}
                        onChange={(e) => setStreamDescription(e.target.value)}
                        placeholder={t('studio.streamDescriptionPlaceholder')}
                        rows={4}
                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none"
                      />
                    </div>

                    <Button
                      onClick={() => {
                        // TODO: 방송 설정 저장
                        alert(t('studio.settingsSaved'));
                      }}
                      className="w-full sm:w-auto"
                    >
                      {t('studio.saveSettings')}
                    </Button>
                  </div>
                </div>
              )}

              {/* 상품 관리 */}
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <ProductManager />
              </div>

              {/* 배송 관리 */}
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <DeliveryManager />
              </div>

              {/* 프로모션 관리 */}
              <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                <PromotionManager />
              </div>

              {/* 방송 프로그램 설정 가이드 */}
              {streamConfig && (
                <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                  <StreamingGuide
                    rtmpUrl={streamConfig.rtmpUrl}
                    streamKey={streamConfig.streamKey}
                  />
                </div>
              )}
            </div>

            {/* 사이드바 - 스트림 정보 */}
            {streamConfig && (
              <div className="space-y-6 sm:space-y-8">
                <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('studio.streamInfo')}</h2>

                  <div className="space-y-4">
                    {/* RTMP 서버 */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2 text-zinc-400">
                        {t('studio.rtmpServer')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={streamConfig.rtmpUrl}
                          readOnly
                          className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg bg-secondary border border-zinc-800/80"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(streamConfig.rtmpUrl, 'rtmp')}
                          className="flex-shrink-0"
                        >
                          {copied === 'rtmp' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* 스트림 키 */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2 text-zinc-400">
                        {t('studio.streamKey')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={streamConfig.streamKey}
                          readOnly
                          className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg bg-secondary border border-zinc-800/80 font-mono"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(streamConfig.streamKey, 'key')}
                          className="flex-shrink-0"
                        >
                          {copied === 'key' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* HLS URL */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2 text-zinc-400">
                        {t('studio.hlsUrl')}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={streamConfig.hlsUrl}
                          readOnly
                          className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg bg-secondary border border-zinc-800/80"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(streamConfig.hlsUrl, 'hls')}
                          className="flex-shrink-0"
                        >
                          {copied === 'hls' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* 스트림 ID */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium mb-2 text-zinc-400">
                        {t('studio.streamId')}
                      </label>
                      <div className="px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80">
                        <p className="text-xs sm:text-sm font-mono">{streamConfig.streamId}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 빠른 링크 */}
                <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4">{t('studio.quickLinks')}</h2>
                  <div className="space-y-2">
                    <a
                      href={`/live?stream=${streamConfig.streamId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('studio.viewStream')}
                    </a>
                    <a
                      href="https://obsproject.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('studio.downloadOBS')}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
