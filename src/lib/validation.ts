/**
 * 입력값 검증 유틸리티
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * 수량 검증 (양수만 허용)
 */
export function validateQuantity(quantity: number | string): ValidationResult {
  const num = typeof quantity === 'string' ? parseInt(quantity, 10) : quantity;

  if (isNaN(num) || num <= 0) {
    return {
      isValid: false,
      error: '수량은 1개 이상이어야 합니다.',
    };
  }

  if (!Number.isInteger(num)) {
    return {
      isValid: false,
      error: '수량은 정수여야 합니다.',
    };
  }

  return { isValid: true };
}

/**
 * 리뷰 텍스트 검증
 */
export function validateReviewText(text: string, maxLength: number = 1000): ValidationResult {
  if (!text || text.trim().length === 0) {
    return {
      isValid: false,
      error: '리뷰 내용을 입력해주세요.',
    };
  }

  if (text.length > maxLength) {
    return {
      isValid: false,
      error: `리뷰는 ${maxLength}자 이하여야 합니다.`,
    };
  }

  return { isValid: true };
}

/**
 * 이메일 검증
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim().length === 0) {
    return {
      isValid: false,
      error: '이메일을 입력해주세요.',
    };
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: '올바른 이메일 형식이 아닙니다.',
    };
  }

  return { isValid: true };
}

/**
 * 전화번호 검증 (한국 형식)
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;

  if (!phone || phone.trim().length === 0) {
    return {
      isValid: false,
      error: '전화번호를 입력해주세요.',
    };
  }

  const cleaned = phone.replace(/-/g, '');
  if (!phoneRegex.test(cleaned)) {
    return {
      isValid: false,
      error: '올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)',
    };
  }

  return { isValid: true };
}

/**
 * 배송지 주소 검증
 */
export function validateShippingAddress(address: string): ValidationResult {
  if (!address || address.trim().length === 0) {
    return {
      isValid: false,
      error: '배송지를 입력해주세요.',
    };
  }

  if (address.trim().length < 10) {
    return {
      isValid: false,
      error: '배송지는 상세하게 입력해주세요. (최소 10자)',
    };
  }

  return { isValid: true };
}

/**
 * 결제 금액 검증
 */
export function validatePaymentAmount(amount: number): ValidationResult {
  if (amount <= 0) {
    return {
      isValid: false,
      error: '결제 금액은 0원보다 커야 합니다.',
    };
  }

  if (amount > 10000000) {
    return {
      isValid: false,
      error: '결제 금액이 너무 큽니다. (최대 10,000,000원)',
    };
  }

  return { isValid: true };
}

/**
 * 쿠폰 코드 검증
 */
export function validateCouponCode(code: string): ValidationResult {
  if (!code || code.trim().length === 0) {
    return {
      isValid: false,
      error: '쿠폰 코드를 입력해주세요.',
    };
  }

  if (code.length < 4 || code.length > 20) {
    return {
      isValid: false,
      error: '쿠폰 코드는 4자 이상 20자 이하여야 합니다.',
    };
  }

  return { isValid: true };
}
