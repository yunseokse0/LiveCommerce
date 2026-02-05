/**
 * 민감 데이터 마스킹 유틸리티
 * 개인정보 보호를 위한 데이터 마스킹 함수들
 */

/**
 * 전화번호 마스킹 (예: 010-1234-5678 -> 010-****-5678)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // 하이픈 제거
  const cleaned = phone.replace(/-/g, '');
  
  if (cleaned.length === 11) {
    // 01012345678 형식
    return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    // 0101234567 형식
    return `${cleaned.slice(0, 3)}-****-${cleaned.slice(6)}`;
  }
  
  return phone; // 형식이 맞지 않으면 그대로 반환
}

/**
 * 이메일 마스킹 (예: user@example.com -> u***@example.com)
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  
  const [localPart, domain] = email.split('@');
  if (!domain) return email;
  
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

/**
 * 주소 마스킹 (상세 주소만 마스킹, 기본 주소는 유지)
 */
export function maskAddress(address: string, keepLength: number = 10): string {
  if (!address) return '';
  
  if (address.length <= keepLength) {
    return address;
  }
  
  // 기본 주소는 유지하고 나머지만 마스킹
  const visiblePart = address.slice(0, keepLength);
  const maskedPart = '*'.repeat(Math.min(address.length - keepLength, 20));
  
  return `${visiblePart}${maskedPart}`;
}

/**
 * 카드 번호 마스킹 (예: 1234-5678-9012-3456 -> ****-****-****-3456)
 */
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber) return '';
  
  // 숫자만 추출
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length === 16) {
    return `****-****-****-${digits.slice(12)}`;
  } else if (digits.length === 15) {
    return `****-******-${digits.slice(9)}`;
  }
  
  // 형식이 맞지 않으면 일부만 마스킹
  if (digits.length > 4) {
    return '*'.repeat(digits.length - 4) + digits.slice(-4);
  }
  
  return cardNumber;
}

/**
 * 계좌 번호 마스킹 (예: 123-456-789012 -> 123-456-******)
 */
export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) return '';
  
  const parts = accountNumber.split('-');
  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1];
    const maskedLastPart = '*'.repeat(Math.min(lastPart.length, 6));
    return [...parts.slice(0, -1), maskedLastPart].join('-');
  }
  
  // 형식이 맞지 않으면 뒤 6자리만 마스킹
  if (accountNumber.length > 6) {
    return accountNumber.slice(0, -6) + '******';
  }
  
  return accountNumber;
}

/**
 * 이름 마스킹 (예: 홍길동 -> 홍*동)
 */
export function maskName(name: string): string {
  if (!name) return '';
  
  if (name.length === 1) {
    return '*';
  } else if (name.length === 2) {
    return `${name[0]}*`;
  } else {
    return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
  }
}

/**
 * 사용자 ID 마스킹 (예: user-123456 -> user-******)
 */
export function maskUserId(userId: string): string {
  if (!userId) return '';
  
  const parts = userId.split('-');
  if (parts.length > 1) {
    const lastPart = parts[parts.length - 1];
    return [...parts.slice(0, -1), '*'.repeat(Math.min(lastPart.length, 6))].join('-');
  }
  
  // 형식이 맞지 않으면 뒤 6자리만 마스킹
  if (userId.length > 6) {
    return userId.slice(0, -6) + '******';
  }
  
  return userId;
}
