'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/user-menu';
import { useAuth } from '@/store/auth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { initialize } = useAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <Link href="/" className="text-lg md:text-xl font-bold">
            Live Commerce
          </Link>
          
          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/live" className="text-sm hover:text-primary transition-colors px-2 py-1">
              라이브
            </Link>
            <Link href="/ranking" className="text-sm hover:text-primary transition-colors px-2 py-1">
              랭킹
            </Link>
            <Link href="/map" className="text-sm hover:text-primary transition-colors px-2 py-1">
              지도
            </Link>
            <Link href="/admin/ranking" className="text-sm hover:text-primary transition-colors px-2 py-1">
              관리자
            </Link>
            <UserMenu />
          </nav>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label="메뉴 열기"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <nav className="md:hidden border-t border-zinc-800/80 py-4 space-y-2">
            <Link
              href="/live"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              라이브
            </Link>
            <Link
              href="/ranking"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              랭킹
            </Link>
            <Link
              href="/map"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              지도
            </Link>
            <Link
              href="/admin/ranking"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              관리자
            </Link>
            <div className="px-4 py-3 border-t border-zinc-800/80 mt-2">
              <UserMenu />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
