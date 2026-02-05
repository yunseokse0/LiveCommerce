/**
 * 보안 미들웨어 유틸리티
 * Next.js API Route에서 사용할 보안 헬퍼 함수들
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, RATE_LIMITS, createRateLimitMiddleware } from './rate-limiter';
import { validateRequestBody, validateUrlParams, detectSQLInjection, detectXSS } from './input-sanitizer';

// RATE_LIMITS re-export
export { RATE_LIMITS } from './rate-limiter';

/**
 * 요청 크기 제한 (10MB)
 */
const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * 보안 헤더 설정
 */
export function setSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );
  
  // XSS Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Frame Options (Clickjacking 방지)
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Content Type Options
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );
  
  // Hide Powered-By 헤더는 Next.js가 자동으로 처리
  
  return response;
}

/**
 * 요청 크기 검증
 */
export function validateRequestSize(request: NextRequest): { valid: boolean; error?: string } {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    if (size > MAX_REQUEST_SIZE) {
      return {
        valid: false,
        error: `요청 크기가 너무 큽니다. 최대 ${MAX_REQUEST_SIZE / 1024 / 1024}MB까지 허용됩니다.`,
      };
    }
  }
  
  return { valid: true };
}

/**
 * 통합 보안 미들웨어
 * 모든 보안 검사를 수행하는 통합 함수
 */
export interface SecurityMiddlewareOptions {
  rateLimit?: typeof RATE_LIMITS.GENERAL | typeof RATE_LIMITS.AUTH | typeof RATE_LIMITS.API_KEY;
  checkSQLInjection?: boolean;
  checkXSS?: boolean;
  checkRequestSize?: boolean;
  requireAuth?: boolean;
}

export async function securityMiddleware(
  request: NextRequest,
  options: SecurityMiddlewareOptions = {}
): Promise<NextResponse | null> {
  const {
    rateLimit = RATE_LIMITS.GENERAL,
    checkSQLInjection = true,
    checkXSS = true,
    checkRequestSize = true,
    requireAuth = false,
  } = options;
  
  // 1. 요청 크기 검증
  if (checkRequestSize) {
    const sizeCheck = validateRequestSize(request);
    if (!sizeCheck.valid) {
      return NextResponse.json(
        { success: false, error: sizeCheck.error },
        { status: 413 }
      );
    }
  }
  
  // 2. Rate Limiting
  if (rateLimit) {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const rateLimitCheck = checkRateLimit(ip, rateLimit);
    
    if (!rateLimitCheck.allowed) {
      const response = NextResponse.json(
        {
          success: false,
          error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.',
          retryAfter: Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
      
      response.headers.set('Retry-After', Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000).toString());
      response.headers.set('X-RateLimit-Limit', rateLimit.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', rateLimitCheck.resetTime.toString());
      
      return response;
    }
  }
  
  // 3. URL 파라미터 검증
  const urlParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  if (Object.keys(urlParams).length > 0) {
    const paramsValidation = validateUrlParams(urlParams);
    if (!paramsValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: '잘못된 요청 파라미터가 감지되었습니다.',
          details: paramsValidation.errors,
        },
        { status: 400 }
      );
    }
  }
  
  // 4. 요청 본문 검증 (POST, PUT, PATCH만)
  const method = request.method;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    try {
      const body = await request.json();
      
      if (checkSQLInjection || checkXSS) {
        const bodyValidation = validateRequestBody(body);
        if (!bodyValidation.valid) {
          return NextResponse.json(
            {
              success: false,
              error: '잘못된 요청 데이터가 감지되었습니다.',
              details: bodyValidation.errors,
            },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      // JSON 파싱 실패는 무시 (이미 다른 곳에서 처리)
    }
  }
  
  // 5. 인증 확인 (필요한 경우)
  if (requireAuth) {
    const authToken = request.cookies.get('auth-token')?.value ||
                     request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
  }
  
  // 모든 검사를 통과한 경우 null 반환 (다음 미들웨어로 진행)
  return null;
}

/**
 * 보안 헤더를 포함한 응답 생성
 */
export function createSecureResponse(data: any, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return setSecurityHeaders(response);
}
