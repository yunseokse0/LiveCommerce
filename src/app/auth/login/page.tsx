'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/store/auth';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const { user, loading, initialize } = useAuth();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-zinc-400">로딩 중...</p>
          </div>
        </main>
      </>
    );
  }

  if (user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 mb-4">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {isSignUp ? '회원가입' : '로그인'}
            </h1>
            <p className="text-sm sm:text-base text-zinc-400">
              {isSignUp ? '새로운 계정을 만들어보세요' : 'Live Commerce에 오신 것을 환영합니다'}
            </p>
          </div>

          {/* 로그인 폼 */}
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm">
            <LoginForm
              isSignUp={isSignUp}
              onToggleMode={() => setIsSignUp(!isSignUp)}
            />
          </div>
        </div>
      </main>
    </>
  );
}
