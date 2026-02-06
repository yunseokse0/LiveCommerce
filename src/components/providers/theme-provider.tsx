'use client';

import { useEffect } from 'react';
import { useTheme } from '@/store/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    // 초기 테마 적용
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}
