-- 프로모션 시스템 테이블 생성

-- ============================================
-- 쿠폰 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed', 'free_shipping')),
  value numeric NOT NULL,
  min_purchase_amount numeric,
  max_discount_amount numeric,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  per_user_limit integer,
  bj_id uuid REFERENCES bjs(id) ON DELETE SET NULL,
  product_ids jsonb, -- 적용 가능한 상품 ID 배열
  category_ids jsonb, -- 적용 가능한 카테고리 ID 배열
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_bj ON coupons(bj_id);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_valid_dates ON coupons(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_coupons_product_ids ON coupons USING GIN (product_ids);

-- ============================================
-- 1+1 프로모션 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS buy_one_get_one (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  free_product_id uuid REFERENCES products(id) ON DELETE SET NULL, -- 없으면 같은 상품
  min_quantity integer NOT NULL DEFAULT 2,
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  bj_id uuid REFERENCES bjs(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bogo_product ON buy_one_get_one(product_id);
CREATE INDEX IF NOT EXISTS idx_bogo_bj ON buy_one_get_one(bj_id);
CREATE INDEX IF NOT EXISTS idx_bogo_is_active ON buy_one_get_one(is_active);
CREATE INDEX IF NOT EXISTS idx_bogo_valid_dates ON buy_one_get_one(valid_from, valid_until);

-- ============================================
-- 사은품 프로모션 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS free_gifts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  gift_product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  min_purchase_amount numeric,
  min_quantity integer,
  product_ids jsonb, -- 적용 가능한 상품 ID 배열
  valid_from timestamptz NOT NULL,
  valid_until timestamptz NOT NULL,
  stock integer NOT NULL DEFAULT 0, -- 사은품 재고
  usage_limit integer,
  usage_count integer DEFAULT 0,
  bj_id uuid REFERENCES bjs(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_free_gifts_gift_product ON free_gifts(gift_product_id);
CREATE INDEX IF NOT EXISTS idx_free_gifts_bj ON free_gifts(bj_id);
CREATE INDEX IF NOT EXISTS idx_free_gifts_is_active ON free_gifts(is_active);
CREATE INDEX IF NOT EXISTS idx_free_gifts_valid_dates ON free_gifts(valid_from, valid_until);
CREATE INDEX IF NOT EXISTS idx_free_gifts_product_ids ON free_gifts USING GIN (product_ids);

-- ============================================
-- 주문-쿠폰 연동 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS order_coupons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
  coupon_code text, -- 쿠폰 코드 (백업)
  discount_amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_coupons_order ON order_coupons(order_id);
CREATE INDEX IF NOT EXISTS idx_order_coupons_coupon ON order_coupons(coupon_id);

-- ============================================
-- 주문-사은품 연동 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS order_free_gifts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  free_gift_id uuid REFERENCES free_gifts(id) ON DELETE SET NULL,
  gift_product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_free_gifts_order ON order_free_gifts(order_id);
CREATE INDEX IF NOT EXISTS idx_order_free_gifts_gift ON order_free_gifts(free_gift_id);

-- ============================================
-- 업데이트 트리거
-- ============================================
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buy_one_get_one_updated_at BEFORE UPDATE ON buy_one_get_one
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_free_gifts_updated_at BEFORE UPDATE ON free_gifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
