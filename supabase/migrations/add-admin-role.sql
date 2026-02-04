-- 관리자 역할 필드 추가 마이그레이션

-- user_profiles 테이블에 role 필드 추가
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'seller'));

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 기존 셀러를 seller 역할로 업데이트 (선택사항)
UPDATE user_profiles 
SET role = 'seller' 
WHERE is_seller = true AND role = 'user';
