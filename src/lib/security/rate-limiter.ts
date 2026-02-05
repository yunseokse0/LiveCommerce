/**
 * Rate Limiting 유틸리티
 * API 요청 제한을 위한 인메모리 저장소 기반 Rate Limiter
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// 인메모리 저장소 (프로덕션에서는 Redis 사용 권장)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate Limit 설정
 */
export interface RateLimitConfig {
  windowMs: number; // 시간 윈도우 (밀리초)
  maxRequests: number; // 최대 요청 수
}

/**
 * 기본 Rate Limit 설정
 */
export const RATE_LIMITS = {
  // 일반 API: 15분당 100회
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15분
    maxRequests: 100,
  },
  // 인증 API: 15분당 5회
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15분
    maxRequests: 5,
  },
  // API 키 관리: 1시간당 10회
  API_KEY: {
    windowMs: 60 * 60 * 1000, // 1시간
    maxRequests: 10,
  },
} as const;

/**
 * Rate Limit 체크
 * @param identifier 요청 식별자 (IP, 사용자 ID 등)
 * @param config Rate Limit 설정
 * @returns 제한 초과 여부 및 남은 요청 수
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${identifier}:${config.windowMs}`;
  
  const entry = rateLimitStore.get(key);
  
  // 엔트리가 없거나 만료된 경우 새로 생성
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    
    // 만료된 엔트리 정리 (메모리 누수 방지)
    cleanupExpiredEntries();
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }
  
  // 요청 수 증가
  entry.count++;
  
  // 제한 초과 확인
  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * 만료된 엔트리 정리
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Rate Limit 리셋 (테스트용)
 */
export function resetRateLimit(identifier: string, config: RateLimitConfig): void {
  const key = `${identifier}:${config.windowMs}`;
  rateLimitStore.delete(key);
}

/**
 * 모든 Rate Limit 리셋 (테스트용)
 */
export function resetAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Rate Limit 미들웨어 헬퍼
 * Next.js API Route에서 사용
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return (request: Request): { allowed: boolean; remaining: number; resetTime: number } => {
    // IP 주소 추출
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    return checkRateLimit(ip, config);
  };
}
