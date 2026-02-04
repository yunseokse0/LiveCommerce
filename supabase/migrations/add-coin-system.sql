-- 코인 시스템 테이블 생성

-- ============================================
-- 사용자 코인 잔액 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS user_coins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance numeric DEFAULT 0 NOT NULL, -- 현재 잔액
  total_earned numeric DEFAULT 0 NOT NULL, -- 총 적립
  total_spent numeric DEFAULT 0 NOT NULL, -- 총 사용
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_coins_user ON user_coins(user_id);

-- ============================================
-- 코인 거래 내역 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS coin_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('earn', 'spend', 'refund', 'admin_adjust')),
  amount numeric NOT NULL, -- 양수: 적립, 음수: 사용
  balance numeric NOT NULL, -- 거래 후 잔액
  description text NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  status text DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_order ON coin_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created ON coin_transactions(created_at DESC);

-- ============================================
-- 코인 시세 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS coin_prices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  price numeric NOT NULL, -- 1코인 = ?원
  effective_from timestamptz NOT NULL, -- 적용 시작일
  effective_until timestamptz, -- 적용 종료일 (현재 시세는 null)
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coin_prices_active ON coin_prices(is_active);
CREATE INDEX IF NOT EXISTS idx_coin_prices_effective ON coin_prices(effective_from, effective_until);

-- ============================================
-- 코인 적립 규칙 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS coin_earn_rules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value numeric NOT NULL, -- 퍼센트 또는 고정 금액
  min_purchase_amount numeric, -- 최소 구매 금액
  max_earn_amount numeric, -- 최대 적립 금액
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coin_earn_rules_active ON coin_earn_rules(is_active);

-- ============================================
-- orders 테이블에 코인 관련 필드 추가
-- ============================================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coin_payment_amount numeric DEFAULT 0, -- 코인으로 결제한 금액
  ADD COLUMN IF NOT EXISTS coin_earned numeric DEFAULT 0; -- 적립된 코인 수

-- ============================================
-- 업데이트 트리거
-- ============================================
CREATE TRIGGER update_user_coins_updated_at BEFORE UPDATE ON user_coins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coin_earn_rules_updated_at BEFORE UPDATE ON coin_earn_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 초기 코인 시세 설정 (예시)
-- ============================================
INSERT INTO coin_prices (price, effective_from, is_active)
VALUES (100, now(), true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 초기 코인 적립 규칙 설정 (예시: 구매 금액의 1%)
-- ============================================
INSERT INTO coin_earn_rules (name, description, type, value, is_active)
VALUES ('기본 적립', '구매 금액의 1% 적립', 'percentage', 1, true)
ON CONFLICT DO NOTHING;
