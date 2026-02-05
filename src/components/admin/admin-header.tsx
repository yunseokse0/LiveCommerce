'use client';

import { useAuth } from '@/store/auth';
import { UserMenu } from '@/components/auth/user-menu';
import { useTranslation } from '@/hooks/use-translation';

export function AdminHeader() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-background/95 backdrop-blur">
      <div className="px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg md:text-xl font-bold">{t('admin.title')}</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-zinc-400">
              {user.name || user.email || t('common.admin')}
            </div>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
