'use client';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* 관리자 전용 사이드바 */}
      <AdminSidebar />
      
      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 관리자 전용 헤더 */}
        <AdminHeader />
        
        {/* 페이지 컨텐츠 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
