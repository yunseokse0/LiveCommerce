/**
 * 입력값 검증 및 정제 유틸리티
 * SQL Injection, XSS 공격 방지
 */

/**
 * SQL Injection 패턴 검사
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
  /(--|#|\/\*|\*\/|;|'|"|`)/g,
  /(\bOR\b.*=.*)|(\bAND\b.*=.*)/gi,
  /(\bUNION\b.*\bSELECT\b)/gi,
  /(\bEXEC\b|\bEXECUTE\b)/gi,
  /(\bSCRIPT\b)/gi,
];

/**
 * XSS 패턴 검사
 */
const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gi,
  /<iframe[^>]*>.*?<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onerror= 등
  /<img[^>]*onerror/gi,
  /<svg[^>]*onload/gi,
  /<body[^>]*onload/gi,
  /<input[^>]*onfocus/gi,
  /<form[^>]*onSubmit/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /<link[^>]*href.*javascript:/gi,
  /<meta[^>]*http-equiv.*refresh/gi,
];

/**
 * SQL Injection 검사
 * @param input 검사할 입력값
 * @returns 위험한 패턴 발견 여부
 */
export function detectSQLInjection(input: string | null | undefined): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  const normalized = input.toLowerCase().trim();
  
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }
  
  return false;
}

/**
 * XSS 공격 검사
 * @param input 검사할 입력값
 * @returns 위험한 패턴 발견 여부
 */
export function detectXSS(input: string | null | undefined): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }
  
  return false;
}

/**
 * 입력값 정제 (HTML 태그 제거)
 * @param input 정제할 입력값
 * @returns 정제된 문자열
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  // HTML 태그 제거
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // 특수 문자 이스케이프
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
}

/**
 * 요청 본문 검증
 * @param body 요청 본문 객체
 * @returns 검증 결과
 */
export function validateRequestBody(body: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['요청 본문이 유효하지 않습니다.'] };
  }
  
  // 재귀적으로 모든 문자열 값 검사
  function checkValue(value: any, path: string = ''): void {
    if (typeof value === 'string') {
      if (detectSQLInjection(value)) {
        errors.push(`${path}: SQL Injection 패턴이 감지되었습니다.`);
      }
      if (detectXSS(value)) {
        errors.push(`${path}: XSS 공격 패턴이 감지되었습니다.`);
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        checkValue(item, `${path}[${index}]`);
      });
    } else if (value && typeof value === 'object') {
      Object.keys(value).forEach((key) => {
        checkValue(value[key], path ? `${path}.${key}` : key);
      });
    }
  }
  
  checkValue(body);
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * URL 파라미터 검증
 * @param params URL 파라미터 객체
 * @returns 검증 결과
 */
export function validateUrlParams(params: Record<string, string | string[] | undefined>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      if (detectSQLInjection(value)) {
        errors.push(`파라미터 '${key}': SQL Injection 패턴이 감지되었습니다.`);
      }
      if (detectXSS(value)) {
        errors.push(`파라미터 '${key}': XSS 공격 패턴이 감지되었습니다.`);
      }
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          if (detectSQLInjection(item)) {
            errors.push(`파라미터 '${key}[${index}]': SQL Injection 패턴이 감지되었습니다.`);
          }
          if (detectXSS(item)) {
            errors.push(`파라미터 '${key}[${index}]': XSS 공격 패턴이 감지되었습니다.`);
          }
        }
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
