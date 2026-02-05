-- 검색 기록 시스템 테이블 생성

-- ============================================
-- 검색 기록 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text, -- 비회원 세션 ID
  query text NOT NULL,
  result_type text CHECK (result_type IN ('product', 'creator', 'region', 'all')),
  result_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_session ON search_history(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_created ON search_history(created_at DESC);

-- ============================================
-- 인기 검색어 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS popular_searches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  query text NOT NULL UNIQUE,
  search_count integer DEFAULT 1,
  last_searched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_popular_searches_count ON popular_searches(search_count DESC);
CREATE INDEX IF NOT EXISTS idx_popular_searches_last ON popular_searches(last_searched_at DESC);

-- ============================================
-- 검색 기록 저장 시 인기 검색어 업데이트 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_popular_searches()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO popular_searches (query, search_count, last_searched_at)
  VALUES (NEW.query, 1, now())
  ON CONFLICT (query) 
  DO UPDATE SET 
    search_count = popular_searches.search_count + 1,
    last_searched_at = now(),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_popular_searches ON search_history;
CREATE TRIGGER trigger_update_popular_searches
  AFTER INSERT ON search_history
  FOR EACH ROW
  EXECUTE FUNCTION update_popular_searches();

-- ============================================
-- 업데이트 트리거
-- ============================================
CREATE TRIGGER update_popular_searches_updated_at BEFORE UPDATE ON popular_searches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
