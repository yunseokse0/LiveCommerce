'use client';

import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/store/auth';
import { User, Mail, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/hooks/use-translation';
import { useFormat } from '@/hooks/use-format';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const format = useFormat();

  if (!user) return null;

  return (
    <ProtectedRoute requireAuth={false}>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('profile.title')}</h1>

          <div className="max-w-2xl">
            {/* 프로필 카드 */}
            <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm mb-6">
              <div className="flex items-center gap-4 sm:gap-6 mb-6">
                {user.avatarUrl ? (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-amber-500/30">
                    <Image
                      src={user.avatarUrl}
                      alt={user.name || 'User'}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/30 border-2 border-amber-500/30 flex items-center justify-center">
                    <User className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-1">{user.name || t('profile.user')}</h2>
                  <p className="text-sm sm:text-base text-zinc-400">{user.email}</p>
                </div>
              </div>

              {/* 사용자 정보 */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Mail className="w-5 h-5 text-zinc-400" />
                  <div>
                    <div className="text-xs text-zinc-500 mb-0.5">{t('profile.email')}</div>
                    <div className="text-sm sm:text-base">{user.email || t('profile.none')}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <User className="w-5 h-5 text-zinc-400" />
                  <div>
                    <div className="text-xs text-zinc-500 mb-0.5">{t('profile.loginMethod')}</div>
                    <div className="text-sm sm:text-base">
                      {user.provider === 'google' && t('profile.provider.google')}
                      {user.provider === 'facebook' && t('profile.provider.facebook')}
                      {user.provider === 'kakao' && t('profile.provider.kakao')}
                      {user.provider === 'email' && t('profile.provider.email')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <div>
                    <div className="text-xs text-zinc-500 mb-0.5">{t('profile.joinDate')}</div>
                    <div className="text-sm sm:text-base">
                      {format.date(user.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
