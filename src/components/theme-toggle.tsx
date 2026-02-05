'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/store/theme';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // 초기 테마 적용
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="p-2"
      aria-label="테마 전환"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
}
