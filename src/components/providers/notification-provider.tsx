'use client';

import { ToastNotification } from '@/components/notifications/toast';
import { OfflineIndicator } from '@/components/errors/offline-indicator';

export function NotificationProvider() {
  return (
    <>
      <ToastNotification />
      <OfflineIndicator />
    </>
  );
}
