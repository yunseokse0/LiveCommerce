'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { useNotifications, type Notification } from '@/store/notifications';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { useFormat } from '@/hooks/use-format';

export function NotificationCenter() {
  const { t } = useTranslation();
  const format = useFormat();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [portalPos, setPortalPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const updatePosition = () => {
      if (!isOpen || !dropdownRef.current) return;
      const rect = dropdownRef.current.getBoundingClientRect();
      const maxWidth = 384;
      const width = Math.min(maxWidth, Math.max(320, window.innerWidth - 16));
      const left = Math.max(8, rect.right - width);
      const top = rect.top + 48;
      setPortalPos({ top, left, width });
    };
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'live':
        return t('notifications.live');
      case 'delivery':
        return t('notifications.delivery');
      case 'product':
        return t('notifications.product');
      case 'system':
        return t('notifications.system');
      default:
        return t('notifications.title');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-secondary rounded-lg transition-colors"
        aria-label="알림"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && portalPos &&
        createPortal(
        <div className="bg-card border border-zinc-800/80 rounded-xl shadow-2xl z-[9999] max-h-[80vh] flex flex-col"
             style={{ position: 'fixed', top: portalPos.top, left: portalPos.left, width: portalPos.width }}>
          {/* 헤더 */}
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold">{t('notifications.title')}</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-amber-400 hover:text-amber-300"
                >
                  {t('notifications.markAllRead')}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 알림 목록 */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-400">
                <Bell className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                <p>{t('notifications.noNotifications')}</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-500/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400">
                            {getCategoryLabel(notification.category)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
                        {notification.message && (
                          <p className="text-xs text-zinc-400 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500">
                          {format.dateTime(notification.createdAt, {
                            includeDate: true,
                            includeTime: true,
                            customOptions: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors flex-shrink-0"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4 text-zinc-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 푸터 */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-zinc-800/80">
              <Button
                onClick={clearAll}
                variant="outline"
                size="sm"
                className="w-full text-red-400 hover:text-red-300"
              >
                {t('notifications.clearAll')}
              </Button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
