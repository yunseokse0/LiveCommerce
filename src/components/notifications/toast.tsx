'use client';

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useNotifications, type Notification } from '@/store/notifications';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/use-translation';

export function ToastNotification() {
  const { notifications, markAsRead, removeNotification } = useNotifications();
  const router = useRouter();
  const { t } = useTranslation();

  // 최신 알림만 표시 (읽지 않은 것 중 최대 3개)
  const visibleNotifications = notifications
    .filter((n) => !n.read)
    .slice(0, 3);

  const handleClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'error':
        return 'bg-red-500/10 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[10000] space-y-2 max-w-sm w-full">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-xl border backdrop-blur-sm shadow-lg animate-in slide-in-from-right duration-300 ${getBgColor(
            notification.type
          )}`}
        >
          <div className="flex items-start gap-3">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1 break-words">{notification.title}</h4>
              {notification.message && (
                <p className="text-xs text-zinc-300 mb-2 break-words line-clamp-2">{notification.message}</p>
              )}
              {notification.link && (
                <button
                  onClick={() => handleClick(notification)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap"
                >
                  {notification.linkText || t('common.viewDetails')} →
                </button>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="p-1 hover:bg-black/20 rounded transition-colors flex-shrink-0"
              aria-label={t('common.close')}
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
