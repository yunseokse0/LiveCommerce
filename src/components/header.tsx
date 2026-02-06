'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingCart } from 'lucide-react';
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
import { useI18n } from '@/store/i18n';
import { getRegionsByCountry } from '@/data/country-regions';
import type { CountryRegion } from '@/types/country';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { initialize } = useAuth();
  const { getTotalItems } = useCart();
  const { t } = useTranslation();
  const { locale, selectedRegionId, setSelectedRegionId } = useI18n();
  const cartItemCount = getTotalItems();

  const handleRegionSelect = (region: CountryRegion | null) => {
    setSelectedRegionId(region?.id || null);
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <header className="sticky top-0 z-[10000] w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 md:h-16 items-center justify-between">
          <Link href="/" className="text-lg md:text-xl font-bold">
            Live Commerce
          </Link>
          
          {/* 검색 바 (데스크톱) */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <GlobalSearch />
          </div>
          
          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-4 flex-wrap">
            <Link href="/live" className="text-sm hover:text-primary transition-colors px-2 py-1 whitespace-nowrap">
              {t('common.live')}
            </Link>
            <Link href="/ranking" className="text-sm hover:text-primary transition-colors px-2 py-1 whitespace-nowrap">
              {t('common.ranking')}
            </Link>
            <Link href="/map" className="text-sm hover:text-primary transition-colors px-2 py-1 whitespace-nowrap">
              {t('common.map')}
            </Link>
            <Link href="/studio" className="text-sm hover:text-primary transition-colors px-2 py-1 whitespace-nowrap">
              {t('common.studio')}
            </Link>
            <Link href="/orders" className="text-sm hover:text-primary transition-colors px-2 py-1 whitespace-nowrap">
              {t('common.orders')}
            </Link>
            <Link href="/coins" className="text-sm hover:text-primary transition-colors px-2 py-1 whitespace-nowrap">
              {t('common.coins')}
            </Link>
            <Link href="/cart" className="relative p-2 hover:text-primary transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>
            <LanguageSelector />
            <RegionSelector 
              selectedRegionId={selectedRegionId || undefined}
              onRegionSelect={handleRegionSelect}
            />
            <NotificationCenter />
            <ThemeToggle />
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
            <div className="px-4 py-3 border-t">
              <LanguageSelector />
            </div>
            <div className="px-4 py-3 border-t">
              <RegionSelector 
                selectedRegionId={selectedRegionId || undefined}
                onRegionSelect={handleRegionSelect}
              />
            </div>
            <div className="px-4 py-3 border-t mt-2">
              <UserMenu />
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
