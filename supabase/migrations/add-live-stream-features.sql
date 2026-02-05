-- 라이브 스트림 기능 확장 마이그레이션

-- ============================================
-- live_streams 테이블에 필드 추가
-- ============================================
ALTER TABLE live_streams
  ADD COLUMN IF NOT EXISTS featured_product_id uuid REFERENCES products(id) ON DELETE SET NULL, -- 현재 소개 중인 상품 ID
  ADD COLUMN IF NOT EXISTS hls_url text, -- HLS 스트림 URL
  ADD COLUMN IF NOT EXISTS description text, -- 방송 설명
  ADD COLUMN IF NOT EXISTS rtmp_url text, -- RTMP 스트림 URL
  ADD COLUMN IF NOT EXISTS stream_key text; -- 스트림 키 (암호화 저장 권장)

CREATE INDEX IF NOT EXISTS idx_live_streams_featured_product ON live_streams(featured_product_id);
