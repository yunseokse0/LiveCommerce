-- 환불 및 취소 시스템 테이블 생성

-- ============================================
-- 주문 취소/환불 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS order_refunds (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('cancel', 'refund', 'exchange')), -- 취소, 환불, 교환
  reason text NOT NULL, -- 취소/환불 사유
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
  refund_amount numeric NOT NULL, -- 환불 금액
  refund_method text, -- 환불 방법 (card, bank_transfer, coin 등)
  refund_account text, -- 환불 계좌 정보
  admin_note text, -- 관리자 메모
  requested_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_refunds_order ON order_refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_order_refunds_user ON order_refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_order_refunds_status ON order_refunds(status);

-- ============================================
-- 환불 상품 목록 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS refund_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  refund_id uuid REFERENCES order_refunds(id) ON DELETE CASCADE NOT NULL,
  order_item_id uuid REFERENCES order_items(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL, -- 환불 수량
  refund_price numeric NOT NULL, -- 환불 금액
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refund_items_refund ON refund_items(refund_id);
CREATE INDEX IF NOT EXISTS idx_refund_items_order_item ON refund_items(order_item_id);

-- ============================================
-- 주문 상태 업데이트 함수 (취소/환불 시)
-- ============================================
CREATE OR REPLACE FUNCTION update_order_status_on_refund()
RETURNS TRIGGER AS $$
BEGIN
  -- 환불 승인 시 주문 상태 업데이트
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE orders
    SET status = 'cancelled'
    WHERE id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_order_status_on_refund ON order_refunds;
CREATE TRIGGER trigger_update_order_status_on_refund
  AFTER UPDATE ON order_refunds
  FOR EACH ROW
  EXECUTE FUNCTION update_order_status_on_refund();
