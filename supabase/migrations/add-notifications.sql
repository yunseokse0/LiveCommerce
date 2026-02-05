-- 알림 시스템 테이블 생성

-- ============================================
-- 알림 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('live', 'delivery', 'product', 'system', 'order', 'refund', 'review')),
  title text NOT NULL,
  message text,
  link text, -- 알림 클릭 시 이동할 링크
  link_text text, -- 링크 텍스트 (예: "자세히 보기")
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================
-- 알림 읽음 처리 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_notification_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_read
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_read();
