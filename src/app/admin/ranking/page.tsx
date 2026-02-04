'use client';

import { Header } from '@/components/header';
import { RankingEditTable } from '@/components/admin/ranking-edit-table';
import { BJList } from '@/components/admin/bj-list';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AdminRankingPage() {
  return (
    <ProtectedRoute requireAuth={false} requireAdmin={false}>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 px-1">관리자 - 랭킹 관리</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">크리에이터 관리</h2>
              <BJList />
            </div>
            
            <div>
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">랭킹 관리</h2>
              <RankingEditTable />
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
