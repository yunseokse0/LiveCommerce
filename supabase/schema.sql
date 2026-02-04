-- ============================================
-- Live Commerce 데이터베이스 스키마
-- ============================================

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 크리에이터 (BJ) 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS bjs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  platform text NOT NULL DEFAULT 'youtube' CHECK (platform IN ('youtube', 'native')),
  thumbnail_url text,
  channel_url text NOT NULL,
  youtube_channel_id text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bjs_youtube_channel_id ON bjs(youtube_channel_id);
CREATE INDEX IF NOT EXISTS idx_bjs_platform ON bjs(platform);
CREATE INDEX IF NOT EXISTS idx_bjs_is_active ON bjs(is_active);

-- ============================================
-- 2. 라이브 스트림 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS live_streams (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bj_id uuid REFERENCES bjs(id) ON DELETE CASCADE NOT NULL,
  is_live boolean DEFAULT false,
  stream_url text,
  viewer_count integer DEFAULT 0,
  started_at timestamptz,
  ended_at timestamptz,
  last_viewer_count integer DEFAULT 0,
  accumulated_minutes integer DEFAULT 0,
  title text,
  thumbnail_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bj_id)
);

CREATE INDEX IF NOT EXISTS idx_live_streams_bj ON live_streams(bj_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_is_live ON live_streams(is_live);
CREATE INDEX IF NOT EXISTS idx_live_streams_started_at ON live_streams(started_at DESC);

-- ============================================
-- 3. 크리에이터 통계 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS bj_stats (
  bj_id uuid PRIMARY KEY REFERENCES bjs(id) ON DELETE CASCADE,
  current_score numeric DEFAULT 0,
  current_rank integer DEFAULT 0,
  viewer_count integer DEFAULT 0,
  donation_revenue numeric DEFAULT 0,
  superchat_revenue numeric DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  total_live_minutes integer DEFAULT 0,
  total_live_count integer DEFAULT 0,
  yesterday_rank integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bj_stats_rank ON bj_stats(current_rank);
CREATE INDEX IF NOT EXISTS idx_bj_stats_score ON bj_stats(current_score DESC);

-- ============================================
-- 4. 광고 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text NOT NULL CHECK (type IN ('top_banner', 'bottom_banner', 'popup')),
  title text NOT NULL,
  image_url text NOT NULL,
  link_url text,
  is_active boolean DEFAULT true,
  start_date date,
  end_date date,
  display_order integer DEFAULT 0,
  cpm numeric,
  cpc numeric,
  ab_test_group text,
  ab_test_variant text CHECK (ab_test_variant IN ('A', 'B')),
  ab_test_weight integer,
  target_pages text[],
  target_user_groups text[],
  schedule_days integer[],
  schedule_start_time time,
  schedule_end_time time,
  timezone text DEFAULT 'Asia/Seoul',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_is_active ON ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_type ON ads(type);
CREATE INDEX IF NOT EXISTS idx_ads_display_order ON ads(display_order);

-- ============================================
-- 5. 광고 통계 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS ad_stats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id uuid REFERENCES ads(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('impression', 'click')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  page_url text,
  user_agent text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_stats_ad_id ON ad_stats(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_stats_event_type ON ad_stats(event_type);
CREATE INDEX IF NOT EXISTS idx_ad_stats_created_at ON ad_stats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_stats_user_id ON ad_stats(user_id);

-- ============================================
-- 6. 지역 정보 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('sido', 'sigungu')),
  parent_id uuid REFERENCES regions(id) ON DELETE CASCADE,
  latitude numeric,
  longitude numeric,
  center_x numeric,
  center_y numeric,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regions_type ON regions(type);
CREATE INDEX IF NOT EXISTS idx_regions_parent ON regions(parent_id);
CREATE INDEX IF NOT EXISTS idx_regions_code ON regions(code);

-- ============================================
-- 7. 특산물 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS local_products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  image_url text,
  region_id uuid REFERENCES regions(id) ON DELETE CASCADE NOT NULL,
  category text CHECK (category IN ('과일', '채소', '수산물', '축산물', '가공식품', '기타')),
  season_start integer CHECK (season_start >= 1 AND season_start <= 12),
  season_end integer CHECK (season_end >= 1 AND season_end <= 12),
  price_range text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_local_products_region ON local_products(region_id);
CREATE INDEX IF NOT EXISTS idx_local_products_category ON local_products(category);
CREATE INDEX IF NOT EXISTS idx_local_products_is_active ON local_products(is_active);

-- ============================================
-- 8. 크리에이터-지역 연동 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS creator_regions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  bj_id uuid REFERENCES bjs(id) ON DELETE CASCADE NOT NULL,
  region_id uuid REFERENCES regions(id) ON DELETE CASCADE NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(bj_id, region_id)
);

CREATE INDEX IF NOT EXISTS idx_creator_regions_bj ON creator_regions(bj_id);
CREATE INDEX IF NOT EXISTS idx_creator_regions_region ON creator_regions(region_id);

-- ============================================
-- 9. 상품 테이블 (라이브커머스 확장용)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  stock integer DEFAULT 0,
  image_url text,
  bj_id uuid REFERENCES bjs(id) ON DELETE SET NULL,
  region_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  local_product_id uuid REFERENCES local_products(id) ON DELETE SET NULL,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_bj ON products(bj_id);
CREATE INDEX IF NOT EXISTS idx_products_region ON products(region_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- ============================================
-- 10. 라이브 방송-상품 연동 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS live_product_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  live_stream_id uuid REFERENCES live_streams(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(live_stream_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_live_product_links_stream ON live_product_links(live_stream_id);
CREATE INDEX IF NOT EXISTS idx_live_product_links_product ON live_product_links(product_id);

-- ============================================
-- 11. 주문 테이블 (라이브커머스 확장용)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_method text,
  shipping_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 12. 주문 상품 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================
-- 13. 사용자 프로필 확장 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  phone_number text,
  address text,
  preferred_region_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_region ON user_profiles(preferred_region_id);

-- ============================================
-- 14. 업데이트 트리거 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_bjs_updated_at BEFORE UPDATE ON bjs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_streams_updated_at BEFORE UPDATE ON live_streams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bj_stats_updated_at BEFORE UPDATE ON bj_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON ads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_local_products_updated_at BEFORE UPDATE ON local_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 15. 랭킹 업데이트 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_ranking()
RETURNS void AS $$
BEGIN
  WITH ranked_stats AS (
    SELECT 
      bj_id,
      current_score,
      ROW_NUMBER() OVER (ORDER BY current_score DESC) as new_rank
    FROM bj_stats
  )
  UPDATE bj_stats
  SET 
    current_rank = ranked_stats.new_rank,
    updated_at = now()
  FROM ranked_stats
  WHERE bj_stats.bj_id = ranked_stats.bj_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 16. 랭킹 업데이트 트리거
-- ============================================
CREATE OR REPLACE FUNCTION trigger_update_ranking()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_ranking();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ranking_trigger
AFTER INSERT OR UPDATE OF current_score ON bj_stats
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_update_ranking();
