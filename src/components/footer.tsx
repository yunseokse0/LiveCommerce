'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.companyName')}</h3>
            <p className="text-sm text-zinc-400 mb-4">
              {t('footer.description')}
            </p>
            <div className="space-y-2 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@livecommerce.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1588-0000</span>
              </div>
            </div>
          </div>

          {/* 고객지원 */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.customerSupport')}</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/help" className="hover:text-amber-400 transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-amber-400 transition-colors">
                  {t('footer.shipping')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-amber-400 transition-colors">
                  {t('footer.returns')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.services')}</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/live" className="hover:text-amber-400 transition-colors">
                  {t('footer.liveStreams')}
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="hover:text-amber-400 transition-colors">
                  {t('footer.creatorRanking')}
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-amber-400 transition-colors">
                  {t('footer.regionalMap')}
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-amber-400 transition-colors">
                  {t('footer.creatorStudio')}
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 고지 */}
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-amber-400 transition-colors">
                  {t('footer.legalNotice')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 구분선 */}
        <div className="border-t border-zinc-800/80 pt-8">
          {/* 법적 고지 텍스트 */}
          <div className="mb-4 text-xs text-zinc-500 leading-relaxed">
            <p className="mb-2">
              {t('footer.legalText1')}
            </p>
            <p>
              {t('footer.legalText2')}
            </p>
          </div>

          {/* 카피라이트 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div>
              <p className="mb-1">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
              <p className="text-xs">{t('footer.madeBy')}</p>
            </div>
            <div className="text-xs text-zinc-600">
              <p>{t('footer.businessNumber')}</p>
              <p>{t('footer.salesNumber')}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
