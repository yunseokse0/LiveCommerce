'use client';

import { useState } from 'react';
import { signInWithEmail, signInWithGoogle, signInWithFacebook, signInWithKakao } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Chrome, Facebook, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onToggleMode?: () => void;
  isSignUp?: boolean;
}

export function LoginForm({ onToggleMode, isSignUp = false }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { signUpWithEmail } = await import('@/lib/auth');
        const { error } = await signUpWithEmail(email, password, name);
        if (error) throw error;
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      }
      
      // 성공 시 페이지 새로고침 또는 리다이렉트
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'kakao') => {
    setLoading(true);
    setError(null);

    try {
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'kakao':
          result = await signInWithKakao();
          break;
      }

      if (result.error) throw result.error;
    } catch (err: any) {
      setError(err.message || '소셜 로그인에 실패했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              이름
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="w-full px-4 py-2.5 pl-11 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 text-sm sm:text-base"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            이메일
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              className="w-full px-4 py-2.5 pl-11 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1.5">
            비밀번호
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-2.5 pl-11 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 text-sm sm:text-base"
              required
              minLength={6}
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
        </Button>
      </form>

      {/* 소셜 로그인 구분선 */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800/80" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-zinc-400">또는</span>
        </div>
      </div>

      {/* 소셜 로그인 버튼 */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={() => handleSocialLogin('google')}
          disabled={loading}
        >
          <Chrome className="w-5 h-5" />
          <span>Google로 {isSignUp ? '가입' : '로그인'}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2"
          onClick={() => handleSocialLogin('facebook')}
          disabled={loading}
        >
          <Facebook className="w-5 h-5" />
          <span>Facebook으로 {isSignUp ? '가입' : '로그인'}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full justify-center gap-2 bg-[#FEE500] hover:bg-[#FEE500]/90 text-black border-[#FEE500]"
          onClick={() => handleSocialLogin('kakao')}
          disabled={loading}
        >
          <MessageCircle className="w-5 h-5" />
          <span>카카오로 {isSignUp ? '가입' : '로그인'}</span>
        </Button>
      </div>

      {/* 로그인/회원가입 전환 */}
      {onToggleMode && (
        <div className="mt-6 text-center text-sm text-zinc-400">
          {isSignUp ? (
            <>
              이미 계정이 있으신가요?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-amber-400 hover:text-amber-300 font-medium"
              >
                로그인
              </button>
            </>
          ) : (
            <>
              계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={onToggleMode}
                className="text-amber-400 hover:text-amber-300 font-medium"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
