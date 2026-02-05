/**
 * 인증 및 권한 관리 미들웨어
 * JWT 토큰 검증 및 역할 기반 접근 제어
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../supabase-server';
import { getCurrentUser } from '../auth';

/**
 * JWT 토큰 검증 옵션
 */
export interface TokenVerificationOptions {
  issuer?: string;
  audience?: string;
  algorithms?: string[];
}

/**
 * 기본 JWT 검증 옵션
 */
const DEFAULT_TOKEN_OPTIONS: TokenVerificationOptions = {
  issuer: 'live-commerce-api',
  audience: 'live-commerce-client',
  algorithms: ['HS256'],
};

/**
 * 토큰에서 사용자 ID 추출
 */
export function extractUserIdFromToken(token: string): string | null {
  try {
    // JWT 토큰은 base64로 인코딩된 3부분으로 구성됨 (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // payload 디코딩
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload.sub || payload.user_id || null;
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
    return null;
  }
}

/**
 * 인증 토큰 검증
 * @param request Next.js 요청 객체
 * @returns 사용자 정보 또는 null
 */
export async function authenticateToken(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  try {
    // 쿠키에서 토큰 가져오기
    const token = request.cookies.get('auth-token')?.value ||
                 request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return null;
    }
    
    // Supabase를 사용하는 경우 Supabase의 인증 사용
    // 여기서는 getCurrentUser를 사용하여 사용자 정보 가져오기
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }
    
    // user_profiles에서 역할 정보 가져오기
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return {
      userId: user.id,
      role: profile?.role || user.role || 'user',
    };
  } catch (error) {
    console.error('인증 토큰 검증 오류:', error);
    return null;
  }
}

/**
 * 역할 기반 접근 제어
 * @param request Next.js 요청 객체
 * @param allowedRoles 허용된 역할 목록
 * @returns 인증된 사용자 정보 또는 null
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: string[]
): Promise<{ userId: string; role: string } | null> {
  const auth = await authenticateToken(request);
  
  if (!auth) {
    return null;
  }
  
  if (!allowedRoles.includes(auth.role)) {
    return null;
  }
  
  return auth;
}

/**
 * 관리자 권한 확인
 * @param request Next.js 요청 객체
 * @returns 인증된 관리자 정보 또는 null
 */
export async function requireAdmin(request: NextRequest): Promise<{ userId: string; role: string } | null> {
  return requireRole(request, ['admin']);
}

/**
 * 크리에이터 권한 확인
 * @param request Next.js 요청 객체
 * @param streamId 스트림 ID (선택사항)
 * @returns 인증된 크리에이터 정보 또는 null
 */
export async function requireCreator(
  request: NextRequest,
  streamId?: string
): Promise<{ userId: string; role: string; bjId: string } | null> {
  const auth = await authenticateToken(request);
  
  if (!auth) {
    return null;
  }
  
  // user_profiles에서 bj_id 확인
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('bj_id')
    .eq('id', auth.userId)
    .single();
  
  if (!profile?.bj_id) {
    return null;
  }
  
  // streamId가 제공된 경우 해당 스트림의 크리에이터인지 확인
  if (streamId) {
    const { data: stream } = await supabaseAdmin
      .from('live_streams')
      .select('bj_id')
      .eq('id', streamId)
      .single();
    
    if (!stream || stream.bj_id !== profile.bj_id) {
      return null;
    }
  }
  
  return {
    ...auth,
    bjId: profile.bj_id,
  };
}

/**
 * 인증 미들웨어 래퍼
 * API Route에서 사용하는 헬퍼 함수
 */
export function withAuth(
  handler: (request: NextRequest, auth: { userId: string; role: string }) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await authenticateToken(request);
    
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }
    
    return handler(request, auth);
  };
}

/**
 * 역할 기반 미들웨어 래퍼
 */
export function withRole(
  allowedRoles: string[],
  handler: (request: NextRequest, auth: { userId: string; role: string }) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const auth = await requireRole(request, allowedRoles);
    
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    return handler(request, auth);
  };
}

/**
 * 관리자 미들웨어 래퍼
 */
export function withAdmin(
  handler: (request: NextRequest, auth: { userId: string; role: string }) => Promise<NextResponse>
) {
  return withRole(['admin'], handler);
}

/**
 * 크리에이터 미들웨어 래퍼
 */
export function withCreator(
  handler: (request: NextRequest, auth: { userId: string; role: string; bjId: string }) => Promise<NextResponse>,
  streamIdExtractor?: (request: NextRequest) => string | undefined
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const streamId = streamIdExtractor ? streamIdExtractor(request) : undefined;
    const auth = await requireCreator(request, streamId);
    
    if (!auth) {
      return NextResponse.json(
        { success: false, error: '크리에이터 권한이 필요합니다.' },
        { status: 403 }
      );
    }
    
    return handler(request, auth);
  };
}
