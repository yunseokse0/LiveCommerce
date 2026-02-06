'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Truck,
  Tag,
  Trophy,
  Users,
  Receipt,
  BarChart3,
  Activity,
  Settings,
  X,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

export function AdminSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: t('admin.dashboard'), icon: LayoutDashboard, href: '/admin' },
    { id: 'analytics', label: t('admin.analytics'), icon: BarChart3, href: '/admin?tab=analytics' },
    { id: 'monitoring', label: t('admin.monitoring'), icon: Activity, href: '/admin?tab=monitoring' },
    { id: 'products', label: t('admin.products'), icon: Package, href: '/admin?tab=products' },
    { id: 'delivery', label: t('admin.delivery'), icon: Truck, href: '/admin?tab=delivery' },
    { id: 'promotions', label: t('admin.promotions'), icon: Tag, href: '/admin?tab=promotions' },
    { id: 'ranking', label: t('admin.ranking'), icon: Trophy, href: '/admin/ranking' },
    { id: 'creators', label: t('admin.creators'), icon: Users, href: '/admin?tab=creators' },
    { id: 'refunds', label: t('admin.refunds'), icon: Receipt, href: '/admin/refunds' },
  ];

  return (
    <>
      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-zinc-800/80"
        aria-label={t('admin.menuOpen')}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* 사이드바 */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-zinc-800/80 transform transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-full flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-amber-400" />
              </div>
              <span className="font-bold text-lg">{t('common.admin')}</span>
            </Link>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 hover:bg-secondary rounded transition-colors"
              aria-label={t('admin.menuClose')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 메뉴 목록 */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-300 hover:bg-secondary'
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium truncate flex-1 min-w-0">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 푸터 */}
          <div className="p-4 border-t border-zinc-800/80">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-300 hover:bg-secondary transition-colors"
            >
              <span className="text-sm">{t('admin.goToUserPage')}</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[9999]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
