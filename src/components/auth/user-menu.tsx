'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, LogOut, Settings, ChevronDown, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    setIsOpen(false);
  };

  if (!user) {
    const handleDemoLogin = (role: 'user' | 'admin' | 'seller') => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('demoMode', 'true');
        window.localStorage.setItem('demoRole', role);
        document.cookie = 'demo-mode=true; path=/';
      }
      setUser({
        id: 'demo-user',
        email: 'demo@example.com',
        name: role === 'admin' ? '데모 관리자' : role === 'seller' ? '데모 셀러' : '데모 사용자',
        avatarUrl: undefined,
        provider: 'email',
        isSeller: role === 'seller',
        role,
        createdAt: new Date().toISOString(),
      });
    };
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push('/auth/login')}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-sm font-medium transition-colors touch-manipulation"
        >
          로그인
        </button>
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => handleDemoLogin('user')}
            className="px-2 py-1 rounded bg-secondary border border-zinc-800/80 text-xs hover:border-amber-500/50"
            title="데모 사용자"
          >
            데모 사용자
          </button>
          <button
            onClick={() => handleDemoLogin('seller')}
            className="px-2 py-1 rounded bg-secondary border border-zinc-800/80 text-xs hover:border-amber-500/50"
            title="데모 셀러"
          >
            데모 셀러
          </button>
          <button
            onClick={() => handleDemoLogin('admin')}
            className="px-2 py-1 rounded bg-secondary border border-zinc-800/80 text-xs hover:border-amber-500/50"
            title="데모 관리자"
          >
            데모 관리자
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-secondary transition-colors touch-manipulation"
      >
        {user.avatarUrl ? (
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-amber-500/30">
            <Image
              src={user.avatarUrl}
              alt={user.name || 'User'}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/30 border border-amber-500/30 flex items-center justify-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
          {user.name || user.email}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-xl border border-zinc-800/80 bg-card/95 backdrop-blur-md shadow-xl z-[9999] overflow-hidden">
          <div className="p-3 border-b border-zinc-800/80">
            <div className="text-sm font-semibold truncate">{user.name || '사용자'}</div>
            <div className="text-xs text-zinc-400 truncate">{user.email}</div>
          </div>
          
          <div className="py-1">
            <div className="px-4 pb-2 text-xs text-zinc-400">
              현재 역할: {user.role === 'admin' ? '관리자' : user.role === 'seller' ? '셀러' : '사용자'}
            </div>
            <div className="px-4 pb-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setUser({ ...user, role: 'user', isSeller: false, name: '데모 사용자' });
                  if (typeof window !== 'undefined') window.localStorage.setItem('demoRole', 'user');
                }}
                className="px-2 py-1 rounded bg-secondary border border-zinc-800/80 text-xs hover:border-amber-500/50"
              >
                사용자
              </button>
              <button
                onClick={() => {
                  setUser({ ...user, role: 'seller', isSeller: true, name: '데모 셀러' });
                  if (typeof window !== 'undefined') window.localStorage.setItem('demoRole', 'seller');
                }}
                className="px-2 py-1 rounded bg-secondary border border-zinc-800/80 text-xs hover:border-amber-500/50"
              >
                셀러
              </button>
              <button
                onClick={() => {
                  setUser({ ...user, role: 'admin', isSeller: false, name: '데모 관리자' });
                  if (typeof window !== 'undefined') window.localStorage.setItem('demoRole', 'admin');
                }}
                className="px-2 py-1 rounded bg-secondary border border-zinc-800/80 text-xs hover:border-amber-500/50"
              >
                관리자
              </button>
            </div>
            <button
              onClick={() => {
                router.push('/studio');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
            >
              <Radio className="w-4 h-4" />
              크리에이터 스튜디오
            </button>
            
            <button
              onClick={() => {
                router.push('/profile');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              프로필 설정
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-2 text-red-400"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
