import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/components/providers/notification-provider';
import { CartSyncProvider } from '@/components/providers/cart-sync-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Live Commerce - 실시간 라이브 스트리밍 플랫폼',
  description: '자체 라이브커머스 솔루션을 구축한 실시간 라이브 스트리밍 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {children}
        <NotificationProvider />
        <CartSyncProvider />
      </body>
    </html>
  );
}
