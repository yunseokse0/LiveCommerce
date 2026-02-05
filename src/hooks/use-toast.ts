'use client';

import { useNotifications } from '@/store/notifications';

export function useToast() {
  const { addNotification } = useNotifications();

  const toast = {
    success: (title: string, message?: string) => {
      addNotification({
        type: 'success',
        title,
        message,
      });
    },
    error: (title: string, message?: string) => {
      addNotification({
        type: 'error',
        title,
        message,
      });
    },
    warning: (title: string, message?: string) => {
      addNotification({
        type: 'warning',
        title,
        message,
      });
    },
    info: (title: string, message?: string) => {
      addNotification({
        type: 'info',
        title,
        message,
      });
    },
  };

  return toast;
}
