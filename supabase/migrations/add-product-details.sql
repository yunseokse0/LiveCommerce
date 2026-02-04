-- 제품 상세 정보 필드 추가 마이그레이션

-- products 테이블에 상세 정보 필드 추가
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS detail_images jsonb,
  ADD COLUMN IF NOT EXISTS detail_description text,
  ADD COLUMN IF NOT EXISTS tags jsonb;

-- user_profiles 테이블에 셀러 여부 필드 추가
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS is_seller boolean DEFAULT false;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_seller ON user_profiles(is_seller);
