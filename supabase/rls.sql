-- ============================================
-- Row Level Security (RLS) 정책 설정
-- ============================================

-- ============================================
-- 1. 크리에이터 (BJ) 테이블
-- ============================================
ALTER TABLE bjs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read bjs"
  ON bjs FOR SELECT
  USING (true);

-- 인증된 사용자만 쓰기 가능 (서버 사이드에서만)
CREATE POLICY "Service role can manage bjs"
  ON bjs FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 2. 라이브 스트림 테이블
-- ============================================
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read live_streams"
  ON live_streams FOR SELECT
  USING (true);

-- 서버 사이드에서만 쓰기 가능
CREATE POLICY "Service role can manage live_streams"
  ON live_streams FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 3. 크리에이터 통계 테이블
-- ============================================
ALTER TABLE bj_stats ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read bj_stats"
  ON bj_stats FOR SELECT
  USING (true);

-- 서버 사이드에서만 쓰기 가능
CREATE POLICY "Service role can manage bj_stats"
  ON bj_stats FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 4. 광고 테이블
-- ============================================
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- 활성 광고만 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read active ads"
  ON ads FOR SELECT
  USING (is_active = true);

-- 서버 사이드에서만 관리 가능
CREATE POLICY "Service role can manage ads"
  ON ads FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 5. 광고 통계 테이블
-- ============================================
ALTER TABLE ad_stats ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (통계 조회용)
CREATE POLICY "Anyone can read ad_stats"
  ON ad_stats FOR SELECT
  USING (true);

-- 모든 사용자가 통계 이벤트 삽입 가능 (클라이언트에서 추적)
CREATE POLICY "Anyone can insert ad_stats"
  ON ad_stats FOR INSERT
  WITH CHECK (true);

-- 서버 사이드에서만 수정/삭제 가능
CREATE POLICY "Service role can manage ad_stats"
  ON ad_stats FOR UPDATE
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Service role can delete ad_stats"
  ON ad_stats FOR DELETE
  USING (false);

-- ============================================
-- 6. 지역 정보 테이블
-- ============================================
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read regions"
  ON regions FOR SELECT
  USING (is_active = true);

-- 서버 사이드에서만 관리 가능
CREATE POLICY "Service role can manage regions"
  ON regions FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 7. 특산물 테이블
-- ============================================
ALTER TABLE local_products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read local_products"
  ON local_products FOR SELECT
  USING (is_active = true);

-- 서버 사이드에서만 관리 가능
CREATE POLICY "Service role can manage local_products"
  ON local_products FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 8. 크리에이터-지역 연동 테이블
-- ============================================
ALTER TABLE creator_regions ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read creator_regions"
  ON creator_regions FOR SELECT
  USING (true);

-- 서버 사이드에서만 관리 가능
CREATE POLICY "Service role can manage creator_regions"
  ON creator_regions FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 9. 상품 테이블
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성 상품 읽기 가능
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (is_active = true);

-- 서버 사이드에서만 관리 가능
CREATE POLICY "Service role can manage products"
  ON products FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 10. 라이브 방송-상품 연동 테이블
-- ============================================
ALTER TABLE live_product_links ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Anyone can read live_product_links"
  ON live_product_links FOR SELECT
  USING (true);

-- 서버 사이드에서만 관리 가능
CREATE POLICY "Service role can manage live_product_links"
  ON live_product_links FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 11. 주문 테이블
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 주문만 읽기 가능
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 주문만 생성 가능
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 서버 사이드에서만 수정/삭제 가능
CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 12. 주문 상품 테이블
-- ============================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 주문 상품만 읽기 가능
CREATE POLICY "Users can read own order_items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- 사용자는 자신의 주문 상품만 생성 가능
CREATE POLICY "Users can create own order_items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- 서버 사이드에서만 수정/삭제 가능
CREATE POLICY "Service role can manage order_items"
  ON order_items FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- 13. 사용자 프로필 테이블
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 읽기 가능
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- 사용자는 자신의 프로필만 생성/수정 가능
CREATE POLICY "Users can manage own profile"
  ON user_profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 서버 사이드에서도 관리 가능
CREATE POLICY "Service role can manage user_profiles"
  ON user_profiles FOR ALL
  USING (true)
  WITH CHECK (true);
