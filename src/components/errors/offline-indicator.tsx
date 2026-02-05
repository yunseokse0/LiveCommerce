'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function OfflineIndicator() {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 초기 상태 확인
    setIsOnline(navigator.onLine);

    // 온라인/오프라인 이벤트 리스너
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border transition-all duration-300 ${
        isOnline
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-red-500/10 border-red-500/30 text-red-400'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="text-sm font-medium">{t('errors.offline.connected')}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">{t('errors.offline.title')}</span>
          </>
        )}
      </div>
    </div>
  );
}
