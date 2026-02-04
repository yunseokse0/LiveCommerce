'use client';

import { supabase } from './supabase-browser';
import type { User } from '@/types/auth';

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signInWithFacebook() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signInWithKakao() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name?: string,
  isSeller?: boolean
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || email.split('@')[0],
        is_seller: isSeller || false,
      },
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });

  // user_profiles 테이블에 셀러 정보 저장
  if (data.user && isSeller) {
    await supabase.from('user_profiles').upsert({
      id: data.user.id,
      display_name: name || email.split('@')[0],
      // is_seller는 user_metadata에 저장됨
    });
  }

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // user_profiles에서 추가 정보 조회
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || profile?.display_name || user.email?.split('@')[0],
    avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || profile?.avatar_url,
    provider: user.app_metadata?.provider as 'google' | 'facebook' | 'kakao' | 'email',
    isSeller: user.user_metadata?.is_seller || profile?.is_seller || false,
    role: (profile?.role || user.user_metadata?.role || 'user') as 'user' | 'admin' | 'seller',
    createdAt: user.created_at,
  };
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}
