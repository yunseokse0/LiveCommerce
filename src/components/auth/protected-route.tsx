'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized || loading) return;

    if (requireAuth && !user) {
      router.push('/auth/login');
      return;
    }

    // 관리자 권한 체크 (임시로 비활성화 - 개발 중)
    // TODO: 프로덕션 배포 전에 활성화 필요
    // if (requireAdmin && user) {
    //   const isAdmin = user.role === 'admin';
    //   if (!isAdmin) {
    //     // 관리자가 아닌 경우 홈으로 리다이렉트
    //     router.push('/');
    //     return;
    //   }
    // }
  }, [user, loading, initialized, requireAuth, requireAdmin, router]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-16 h-16 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  // 관리자 권한 체크 (임시로 비활성화 - 개발 중)
  // TODO: 프로덕션 배포 전에 활성화 필요
  // if (requireAdmin && user && user.role !== 'admin') {
  //   return null;
  // }

  return <>{children}</>;
}
