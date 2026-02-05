-- 사용자-크리에이터 매핑 테이블 생성

-- ============================================
-- user_profiles 테이블에 bj_id 필드 추가
-- ============================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS bj_id uuid REFERENCES bjs(id) ON DELETE SET NULL; -- 크리에이터 ID

CREATE INDEX IF NOT EXISTS idx_user_profiles_bj ON user_profiles(bj_id);

-- ============================================
-- 사용자-크리에이터 매핑 테이블 (선택사항 - 더 명확한 관계 관리)
-- ============================================
CREATE TABLE IF NOT EXISTS user_bj_mapping (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bj_id uuid REFERENCES bjs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bj_id)
);

CREATE INDEX IF NOT EXISTS idx_user_bj_mapping_user ON user_bj_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bj_mapping_bj ON user_bj_mapping(bj_id);

-- ============================================
-- 업데이트 트리거
-- ============================================
CREATE TRIGGER update_user_bj_mapping_updated_at BEFORE UPDATE ON user_bj_mapping
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
