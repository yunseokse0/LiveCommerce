/**
 * 보안 미들웨어 사용 예시 API Route
 * 실제 API Route에서 이 패턴을 참고하여 사용하세요.
 */

import { NextRequest, NextResponse } from 'next/server';
import { securityMiddleware, createSecureResponse, RATE_LIMITS } from '@/lib/security/middleware';
import { withAuth, withCreator, withAdmin } from '@/lib/security/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * 예시 1: 기본 보안 미들웨어 사용
 * GET /api/example-secure-route
 */
export async function GET(request: NextRequest) {
  // 보안 미들웨어 실행
  const securityCheck = await securityMiddleware(request, {
    rateLimit: RATE_LIMITS.GENERAL,
    checkSQLInjection: true,
    checkXSS: true,
    checkRequestSize: true,
  });
  
  // 보안 검사 실패 시 응답 반환
  if (securityCheck) {
    return securityCheck;
  }
  
  // 정상 처리
  return createSecureResponse({
    success: true,
    message: '보안 검사를 통과했습니다.',
  });
}

/**
 * 예시 2: 인증이 필요한 API
 * POST /api/example-secure-route
 */
export const POST = withAuth(async (request: NextRequest, auth) => {
  // 보안 미들웨어 실행
  const securityCheck = await securityMiddleware(request, {
    rateLimit: RATE_LIMITS.GENERAL,
    requireAuth: true,
  });
  
  if (securityCheck) {
    return securityCheck;
  }
  
  const body = await request.json();
  
  return createSecureResponse({
    success: true,
    message: '인증된 사용자만 접근 가능한 API입니다.',
    userId: auth.userId,
    role: auth.role,
    data: body,
  });
});

/**
 * 예시 3: 관리자만 접근 가능한 API
 * PUT /api/example-secure-route
 */
export const PUT = withAdmin(async (request: NextRequest, auth) => {
  const securityCheck = await securityMiddleware(request, {
    rateLimit: RATE_LIMITS.API_KEY,
  });
  
  if (securityCheck) {
    return securityCheck;
  }
  
  return createSecureResponse({
    success: true,
    message: '관리자만 접근 가능한 API입니다.',
    userId: auth.userId,
  });
});

/**
 * 예시 4: 크리에이터만 접근 가능한 API
 * DELETE /api/example-secure-route
 */
export const DELETE = withCreator(
  async (request: NextRequest, auth) => {
    const securityCheck = await securityMiddleware(request, {
      rateLimit: RATE_LIMITS.GENERAL,
    });
    
    if (securityCheck) {
      return securityCheck;
    }
    
    return createSecureResponse({
      success: true,
      message: '크리에이터만 접근 가능한 API입니다.',
      userId: auth.userId,
      bjId: auth.bjId,
    });
  },
  (request) => {
    // URL에서 streamId 추출 예시
    const url = new URL(request.url);
    return url.searchParams.get('streamId') || undefined;
  }
);
