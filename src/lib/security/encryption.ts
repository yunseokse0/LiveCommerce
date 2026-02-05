/**
 * 암호화 유틸리티
 * 환경 변수 및 민감한 데이터 암호화/복호화
 */

import CryptoJS from 'crypto-js';

// 환경 변수에서 암호화 키 가져오기 (없으면 기본값 사용 - 프로덕션에서는 반드시 설정 필요)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

/**
 * 문자열 암호화 (AES)
 * @param text 암호화할 문자열
 * @returns 암호화된 문자열 (Base64)
 */
export function encrypt(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('암호화 오류:', error);
    throw new Error('암호화에 실패했습니다.');
  }
}

/**
 * 암호화된 문자열 복호화 (AES)
 * @param encryptedText 암호화된 문자열
 * @returns 복호화된 문자열
 */
export function decrypt(encryptedText: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('복호화에 실패했습니다. 잘못된 키이거나 손상된 데이터입니다.');
    }
    
    return decryptedText;
  } catch (error) {
    console.error('복호화 오류:', error);
    throw new Error('복호화에 실패했습니다.');
  }
}

/**
 * SHA-256 해시 생성
 * @param text 해시할 문자열
 * @returns 해시된 문자열 (Hex)
 */
export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString(CryptoJS.enc.Hex);
}

/**
 * 안전한 토큰 생성
 * @param length 토큰 길이 (기본값: 32)
 * @returns 랜덤 토큰 문자열
 */
export function generateToken(length: number = 32): string {
  const randomBytes = CryptoJS.lib.WordArray.random(length);
  return randomBytes.toString(CryptoJS.enc.Hex);
}

/**
 * 비밀번호 해시 생성 (bcrypt 대신 SHA-256 사용, 프로덕션에서는 bcrypt 권장)
 * @param password 비밀번호
 * @param salt 솔트 (선택사항)
 * @returns 해시된 비밀번호
 */
export function hashPassword(password: string, salt?: string): string {
  const saltValue = salt || generateToken(16);
  const hashed = CryptoJS.SHA256(password + saltValue).toString(CryptoJS.enc.Hex);
  return `${hashed}:${saltValue}`;
}

/**
 * 비밀번호 검증
 * @param password 원본 비밀번호
 * @param hashedPassword 해시된 비밀번호 (형식: hash:salt)
 * @returns 검증 성공 여부
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [hash, salt] = hashedPassword.split(':');
    if (!hash || !salt) {
      return false;
    }
    
    const computedHash = CryptoJS.SHA256(password + salt).toString(CryptoJS.enc.Hex);
    return computedHash === hash;
  } catch (error) {
    console.error('비밀번호 검증 오류:', error);
    return false;
  }
}

/**
 * 환경 변수 암호화 헬퍼
 * 프로덕션 환경에서 민감한 환경 변수를 암호화하여 저장
 */
export const envEncryption = {
  /**
   * 환경 변수 암호화
   */
  encryptEnv(key: string, value: string): string {
    return encrypt(value);
  },
  
  /**
   * 환경 변수 복호화
   */
  decryptEnv(encryptedValue: string): string {
    return decrypt(encryptedValue);
  },
};
