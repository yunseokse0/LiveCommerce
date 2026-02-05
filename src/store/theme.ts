/**
 * 테마 상태 관리 (다크 모드)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // 기본값은 다크 모드

      setTheme: (theme) => {
        set({ theme });
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
        }
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(newTheme);
          }
          return { theme: newTheme };
        });
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(state.theme);
        }
      },
    }
  )
);
