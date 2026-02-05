/**
 * 전역 알림 상태 관리 (Zustand)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
  linkText?: string;
  read: boolean;
  createdAt: string;
  category?: 'live' | 'delivery' | 'product' | 'system';
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotifications = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedNotifications = [newNotification, ...state.notifications].slice(0, 100); // 최대 100개 유지
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.read).length,
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.read).length,
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: updatedNotifications,
            unreadCount: updatedNotifications.filter((n) => !n.read).length,
          };
        });
      },

      clearAll: () => {
        set({
          notifications: [],
          unreadCount: 0,
        });
      },
    }),
    {
      name: 'notifications-storage',
    }
  )
);
