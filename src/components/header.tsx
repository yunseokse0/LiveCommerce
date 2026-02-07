'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Menu, X, ShoppingCart, MoreHorizontal, Globe, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/auth/user-menu';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { GlobalSearch } from '@/components/search/global-search';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSelector } from '@/components/language-selector';
import { RegionSelector } from '@/components/region-selector';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { useTranslation } from '@/hooks/use-translation';
import { useI18n, locales, countries } from '@/store/i18n';
import { getRegionsByCountry } from '@/data/country-regions';
import type { CountryRegion } from '@/types/country';
import { cn } from '@/lib/utils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [morePos, setMorePos] = useState<{ top: number; left: number; width: number } | null>(null);
  const [isLocaleOpen, setIsLocaleOpen] = useState(false);
  const localeRef = useRef<HTMLButtonElement>(null);
  const [localePos, setLocalePos] = useState<{ top: number; left: number; width: number } | null>(null);
  const { initialize } = useAuth();
  const { getTotalItems } = useCart();
  const { t } = useTranslation();
  const { locale, setLocale, selectedCountryCode, setSelectedCountryCode, selectedRegionId, setSelectedRegionId } = useI18n();
  const cartItemCount = getTotalItems();
  const currentLocale = locales[locale];
  const currentCountry = countries[selectedCountryCode];
  const regions = getRegionsByCountry(selectedCountryCode);
  const selectedRegion = selectedRegionId ? regions.find((r) => r.id === selectedRegionId) : null;

  const handleRegionSelect = (region: CountryRegion | null) => {
    setSelectedRegionId(region?.id || null);
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('headerNavCollapsed') : null;
      if (stored !== null) {
        setIsNavCollapsed(stored === 'true');
      } else {
        setIsNavCollapsed(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('headerNavCollapsed', String(isNavCollapsed));
      }
    } catch {}
  }, [isNavCollapsed]);

  useEffect(() => {
    const updateMorePos = () => {
      if (!isMoreOpen || !moreRef.current) return;
      const rect = moreRef.current.getBoundingClientRect();
      const width = 240;
      const left = Math.max(8, rect.right - width);
      const top = rect.bottom + 8;
      setMorePos({ top, left, width });
    };
    const updateLocalePos = () => {
      if (!isLocaleOpen || !localeRef.current) return;
      const rect = localeRef.current.getBoundingClientRect();
      const width = 320;
      const left = Math.max(8, rect.right - width);
      const top = rect.bottom + 8;
      setLocalePos({ top, left, width });
    };
    if (isMoreOpen || isLocaleOpen) {
      updateMorePos();
      updateLocalePos();
      window.addEventListener('scroll', updateMorePos, true);
      window.addEventListener('resize', updateMorePos);
      window.addEventListener('scroll', updateLocalePos, true);
      window.addEventListener('resize', updateLocalePos);
    }
    return () => {
      window.removeEventListener('scroll', updateMorePos, true);
      window.removeEventListener('resize', updateMorePos);
      window.removeEventListener('scroll', updateLocalePos, true);
      window.removeEventListener('resize', updateLocalePos);
    };
  }, [isMoreOpen, isLocaleOpen]);

  return (
    <header className="sticky top-0 z-[10000] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-12 md:h-14 items-center justify-between">
          <Link href="/" className="text-lg md:text-xl font-bold">
            Live Commerce
          </Link>
          
          {/* 검색 바 (데스크톱) */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <GlobalSearch />
          </div>
          
          {/* 모바일 상단바: 통합 언어/지역 선택 */}
          <div className="md:hidden flex items-center gap-2">
            <button
              ref={localeRef}
              onClick={() => {
                setIsLocaleOpen(!isLocaleOpen);
                setIsMoreOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors border"
              aria-label="언어/지역 선택"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">언어/지역</span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', isLocaleOpen && 'rotate-180')} />
            </button>
          </div>
          
          {/* 데스크톱 네비게이션 */}
           <nav className="hidden md:flex items-center gap-2 flex-wrap">
            <Link href="/live" className="text-sm hover:text-primary transition-colors px-2 py-1 whitespace-nowrap">
              {t('common.live')}
            </Link>
             <Link href="/ranking" className="text-sm hover:text-primary transition-colors px-2 py-0.5 whitespace-nowrap">
              {t('common.ranking')}
            </Link>
            {!isNavCollapsed && (
              <>
                <Link href="/map" className="text-sm hover:text-primary transition-colors px-2 py-0.5 whitespace-nowrap">
                  {t('common.map')}
                </Link>
                <Link href="/studio" className="text-sm hover:text-primary transition-colors px-2 py-0.5 whitespace-nowrap">
                  {t('common.studio')}
                </Link>
                <Link href="/orders" className="text-sm hover:text-primary transition-colors px-2 py-0.5 whitespace-nowrap">
                  {t('common.orders')}
                </Link>
                <Link href="/coins" className="text-sm hover:text-primary transition-colors px-2 py-0.5 whitespace-nowrap">
                  {t('common.coins')}
                </Link>
              </>
            )}
             <Link href="/cart" className="relative p-1.5 hover:text-primary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>
            <button
              ref={localeRef}
              onClick={() => {
                setIsLocaleOpen(!isLocaleOpen);
                setIsMoreOpen(false);
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors border"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm">언어/지역</span>
              <span className="text-xs text-amber-400 hidden xl:inline">
                {selectedRegion ? selectedRegion.name : currentCountry.name}
              </span>
              <ChevronDown className={cn('w-4 h-4 transition-transform', isLocaleOpen && 'rotate-180')} />
            </button>
            {/* 유틸은 더보기 드롭다운으로 이동 */}
            <button
              ref={moreRef}
              onClick={() => {
                setIsMoreOpen(!isMoreOpen);
                setIsLocaleOpen(false);
              }}
             className="p-1.5 rounded-lg hover:bg-secondary transition-colors border"
              aria-label="더보기"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <Button
              variant="outline"
              className="px-2 py-0.5 text-xs"
              onClick={() => setIsNavCollapsed((v) => !v)}
            >
              {isNavCollapsed ? '전체 보기' : '간단히'}
            </Button>
            <UserMenu />
          </nav>

          {/* 모바일 햄버거 메뉴 버튼 */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label={t('common.menu')}
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
          <nav className="md:hidden border-t py-4 space-y-2">
            {/* 모바일 검색 */}
            <div className="px-4 mb-2">
              <GlobalSearch />
            </div>
            <Link
              href="/live"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              {t('common.live')}
            </Link>
            <Link
              href="/ranking"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              {t('common.ranking')}
            </Link>
            <Link
              href="/map"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              {t('common.map')}
            </Link>
            <Link
              href="/studio"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              {t('common.studio')}
            </Link>
            <Link
              href="/orders"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              {t('common.orders')}
            </Link>
            <Link
              href="/coins"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              {t('common.coins')}
            </Link>
            <Link
              href="/cart"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 hover:bg-secondary rounded-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {t('common.cart')}
              {cartItemCount > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <div className="px-4 py-3 border-t mt-2">
              <UserMenu />
            </div>
          </nav>
        )}
      </div>
      {isMoreOpen && morePos &&
        createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <div onClick={() => setIsMoreOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
            <div
              className="bg-card border rounded-xl shadow-2xl overflow-hidden"
              style={{
                position: 'absolute',
                top: Math.min(morePos.top, (window.innerHeight * 0.9) - 8),
                left: window.innerWidth < 640 ? 8 : morePos.left,
                width: window.innerWidth < 640 ? Math.max(220, window.innerWidth - 16) : morePos.width,
                maxHeight: '70vh',
              }}
            >
              <div className="p-3 border-b">
                <p className="text-xs text-[var(--muted)] mb-2">빠른 설정</p>
                <div className="flex items-center gap-2">
                  <NotificationCenter />
                  <ThemeToggle />
                </div>
              </div>
              <Link href="/map" className="block px-4 py-3 hover:bg-secondary transition-colors" onClick={() => setIsMoreOpen(false)}>
                {t('common.map')}
              </Link>
              <Link href="/studio" className="block px-4 py-3 hover:bg-secondary transition-colors" onClick={() => setIsMoreOpen(false)}>
                {t('common.studio')}
              </Link>
              <Link href="/orders" className="block px-4 py-3 hover:bg-secondary transition-colors" onClick={() => setIsMoreOpen(false)}>
                {t('common.orders')}
              </Link>
              <Link href="/coins" className="block px-4 py-3 hover:bg-secondary transition-colors" onClick={() => setIsMoreOpen(false)}>
                {t('common.coins')}
              </Link>
            </div>
          </div>,
          document.body
        )
      }
      {isLocaleOpen && localePos &&
        createPortal(
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <div onClick={() => setIsLocaleOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
            <div
              className="bg-card border rounded-xl shadow-2xl overflow-hidden"
              style={{
                position: 'absolute',
                top: Math.min(localePos.top, (window.innerHeight * 0.9) - 8),
                left: window.innerWidth < 640 ? 8 : localePos.left,
                width: window.innerWidth < 640 ? Math.max(280, window.innerWidth - 16) : localePos.width,
                maxHeight: '70vh',
              }}
            >
              <div className="p-3 border-b flex items-center gap-2 text-xs text-[var(--muted)]">
                <Globe className="w-4 h-4" />
                <span>언어 선택</span>
              </div>
              {Object.entries(locales).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => {
                    setLocale(key as any);
                    setIsLocaleOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-secondary transition-colors"
                >
                  <span className="text-lg">{info.flag}</span>
                  <span className="flex-1 text-sm">{info.nativeName}</span>
                </button>
              ))}
              <div className="p-3 border-t flex items-center gap-2 text-xs text-[var(--muted)]">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>국가/지역 선택</span>
              </div>
              <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                {Object.values(countries).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setSelectedCountryCode(c.code as any);
                      setSelectedRegionId(null);
                    }}
                    className={cn(
                      'px-2 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1',
                      c.code === currentCountry.code ? 'border-amber-500/50 bg-amber-500/10' : 'hover:bg-secondary'
                    )}
                  >
                    <span>{c.flag}</span>
                    <span className="truncate max-w-[60px]">{c.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setSelectedRegionId(null);
                  setIsLocaleOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
              >
                전체 지역
              </button>
              <div className="divide-y">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    onClick={() => {
                      setSelectedRegionId(region.id);
                      setIsLocaleOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{region.name}</span>
                      {selectedRegionId === region.id && <span className="text-xs text-amber-400">선택됨</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </header>
  );
}
