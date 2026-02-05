-- 채팅 시스템 테이블 생성

-- ============================================
-- 채팅 메시지 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id text NOT NULL, -- 라이브 스트림 ID (bj.id)
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nickname text NOT NULL,
  message text NOT NULL,
  is_deleted boolean DEFAULT false, -- 삭제된 메시지 여부
  deleted_at timestamptz,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- 삭제한 사용자 (크리에이터)
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_stream ON chat_messages(stream_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_deleted ON chat_messages(is_deleted);

-- ============================================
-- 채팅 차단 사용자 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS chat_banned_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id text NOT NULL, -- 라이브 스트림 ID (bj.id)
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  banned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- 차단한 사용자 (크리에이터)
  reason text, -- 차단 사유
  banned_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- 차단 만료 시간 (null이면 영구 차단)
  is_active boolean DEFAULT true,
  UNIQUE(stream_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_banned_stream ON chat_banned_users(stream_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_banned_user ON chat_banned_users(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_banned_expires ON chat_banned_users(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================
-- 채팅 메시지 삭제 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_chat_message_deleted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    NEW.deleted_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chat_message_deleted
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_message_deleted();
