import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { setSecurityHeaders } from '@/lib/security/middleware';

/**
 * 권한 기반 라우팅 미들웨어
 * 로그인하지 않은 사용자를 보호된 경로에서 차단
 * 보안 헤더 설정 포함
 */

// 보호된 경로 목록
const protectedRoutes = ['/studio', '/orders', '/coins'];
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next();

  // 보안 헤더 설정
  response = setSecurityHeaders(response);

  // 데모 모드 제거: 항상 권한 체크 적용

  // 관리자 경로는 별도 처리
  if (pathname.startsWith('/admin')) {
    // 프로덕션 환경에서만 권한 체크 활성화
    if (process.env.NODE_ENV === 'production') {
      const token = request.cookies.get('auth-token')?.value ||
                   request.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!token) {
        const redirectUrl = new URL('/auth/login?redirect=/admin', request.url);
        return NextResponse.redirect(redirectUrl);
      }
      
      // TODO: 관리자 권한 체크 (실제 구현 필요)
      // const isAdmin = await checkAdminPermission(request);
      // if (!isAdmin) {
      //   return NextResponse.redirect(new URL('/auth/login?redirect=/admin', request.url));
      // }
    }
    
    return response;
  }

  // 보호된 경로 체크
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    // 프로덕션 환경에서만 인증 체크 활성화
    if (process.env.NODE_ENV === 'production') {
      const token = request.cookies.get('auth-token')?.value;
      const sessionId = request.cookies.get('session-id')?.value;

      if (!token && !sessionId) {
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
