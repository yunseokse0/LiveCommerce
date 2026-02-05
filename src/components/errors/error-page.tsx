'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, AlertCircle, Package, Radio, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

interface ErrorPageProps {
  type: '404' | '500' | 'stream-ended' | 'product-sold-out' | 'offline';
  title?: string;
  message?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function ErrorPage({ type, title, message, action }: ErrorPageProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const getErrorContent = () => {
    switch (type) {
      case '404':
        return {
          icon: <AlertCircle className="w-16 h-16 text-zinc-400" />,
          title: title || t('errors.404.title'),
          message: message || t('errors.404.message'),
          defaultAction: { label: t('errors.404.backToHome'), href: '/' },
        };
      case '500':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-400" />,
          title: title || t('errors.500.title'),
          message: message || t('errors.500.message'),
          defaultAction: { label: t('errors.500.refresh'), href: '#' },
        };
      case 'stream-ended':
        return {
          icon: <Radio className="w-16 h-16 text-zinc-400" />,
          title: title || t('errors.streamEnded.title'),
          message: message || t('errors.streamEnded.message'),
          defaultAction: { label: t('errors.streamEnded.viewLive'), href: '/live' },
        };
      case 'product-sold-out':
        return {
          icon: <Package className="w-16 h-16 text-yellow-400" />,
          title: title || t('errors.productSoldOut.title'),
          message: message || t('errors.productSoldOut.message'),
          defaultAction: { label: t('errors.productSoldOut.viewProducts'), href: '/' },
        };
      case 'offline':
        return {
          icon: <AlertCircle className="w-16 h-16 text-red-400" />,
          title: title || t('errors.offline.title'),
          message: message || t('errors.offline.message'),
          defaultAction: { label: t('errors.offline.refresh'), href: '#' },
        };
      default:
        return {
          icon: <AlertCircle className="w-16 h-16 text-zinc-400" />,
          title: t('common.error'),
          message: t('common.error'),
          defaultAction: { label: t('errors.404.backToHome'), href: '/' },
        };
    }
  };

  const content = getErrorContent();
  const finalAction = action || content.defaultAction;

  const handleAction = () => {
    if (finalAction.href === '#') {
      window.location.reload();
    } else {
      router.push(finalAction.href);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full space-y-6">
        <div className="flex justify-center">{content.icon}</div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">{content.title}</h1>
          <p className="text-zinc-400">{content.message}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleAction} className="w-full sm:w-auto">
            {finalAction.label}
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back')}
          </Button>
        </div>
      </div>
    </div>
  );
}
