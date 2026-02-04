'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* 회사 정보 */}
          <div>
            <h3 className="text-lg font-bold mb-4">LiveCommerce</h3>
            <p className="text-sm text-zinc-400 mb-4">
              실시간 라이브 커머스 플랫폼으로 최고의 쇼핑 경험을 제공합니다.
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
            <h4 className="font-semibold mb-4">고객지원</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/help" className="hover:text-amber-400 transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-amber-400 transition-colors">
                  배송 안내
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-amber-400 transition-colors">
                  반품/교환
                </Link>
              </li>
            </ul>
          </div>

          {/* 서비스 */}
          <div>
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/live" className="hover:text-amber-400 transition-colors">
                  라이브 방송
                </Link>
              </li>
              <li>
                <Link href="/ranking" className="hover:text-amber-400 transition-colors">
                  크리에이터 랭킹
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-amber-400 transition-colors">
                  지역 특산품 지도
                </Link>
              </li>
              <li>
                <Link href="/studio" className="hover:text-amber-400 transition-colors">
                  크리에이터 스튜디오
                </Link>
              </li>
            </ul>
          </div>

          {/* 법적 고지 */}
          <div>
            <h4 className="font-semibold mb-4">법적 고지</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-amber-400 transition-colors">
                  법적 고지
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
              LiveCommerce는 통신판매중개자이며, 통신판매의 당사자가 아닙니다.
            </p>
            <p>
              상품, 상품정보, 거래에 관한 의무와 책임은 판매자에게 있습니다.
            </p>
          </div>

          {/* 카피라이트 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div>
              <p className="mb-1">© {new Date().getFullYear()} LiveCommerce. All rights reserved.</p>
              <p className="text-xs">Made by: 조한선, 서윤석</p>
            </div>
            <div className="text-xs text-zinc-600">
              <p>사업자등록번호: 000-00-00000</p>
              <p>통신판매업신고번호: 제2024-서울-0000호</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
