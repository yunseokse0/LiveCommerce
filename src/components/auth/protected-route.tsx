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
  const isDemoMode = typeof window !== 'undefined' && window.localStorage.getItem('demoMode') === 'true';

  useEffect(() => {
    if (!initialized || loading) return;

    if (!isDemoMode && requireAuth && !user) {
      router.push('/auth/login');
      return;
    }

    if (!isDemoMode && requireAdmin && user) {
      const isAdmin = user.role === 'admin';
      if (!isAdmin) {
        router.push('/');
        return;
      }
    }
  }, [user, loading, initialized, requireAuth, requireAdmin, router, isDemoMode]);

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

  if (!isDemoMode && requireAuth && !user) {
    return null;
  }

  if (!isDemoMode && requireAdmin && user && user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
