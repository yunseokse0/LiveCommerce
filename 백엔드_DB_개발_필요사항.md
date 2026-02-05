# 백엔드 API 및 DB 개발 필요 사항

## 📋 현재 상태 요약

### ✅ 이미 구현된 DB 테이블
- `bjs` - 크리에이터 정보
- `live_streams` - 라이브 스트림 정보
- `bj_stats` - 크리에이터 통계 및 랭킹
- `products` - 상품 정보
- `orders` - 주문 정보
- `order_items` - 주문 상품
- `product_reviews` - 리뷰 (migration 파일 존재)
- `coupons` - 쿠폰 (migration 파일 존재)
- `buy_one_get_one` - 1+1 프로모션 (migration 파일 존재)
- `free_gifts` - 사은품 프로모션 (migration 파일 존재)
- `order_refunds` - 환불 (migration 파일 존재)
- `user_coins` - 코인 잔액 (migration 파일 존재)
- `coin_transactions` - 코인 거래 내역 (migration 파일 존재)
- `user_profiles` - 사용자 프로필 확장

### ❌ 추가 개발이 필요한 DB 테이블 및 API

---

## 1. 채팅 시스템 DB 및 API

### 1.1 DB 테이블 추가 필요

#### `chat_messages` 테이블
```sql
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id text NOT NULL, -- 라이브 스트림 ID (bj.id)
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  nickname text NOT NULL,
  message text NOT NULL,
  is_deleted boolean DEFAULT false, -- 삭제된 메시지 여부
  deleted_at timestamptz,
  deleted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- 삭제한 사용자 (크리에이터)
  created_at timestamptz DEFAULT now(),
  INDEX idx_chat_messages_stream ON chat_messages(stream_id, created_at DESC);
  INDEX idx_chat_messages_user ON chat_messages(user_id);
  INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
);
```

#### `chat_banned_users` 테이블
```sql
CREATE TABLE IF NOT EXISTS chat_banned_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id text NOT NULL, -- 라이브 스트림 ID (bj.id)
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  banned_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- 차단한 사용자 (크리에이터)
  reason text, -- 차단 사유
  banned_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- 차단 만료 시간 (null이면 영구 차단)
  is_active boolean DEFAULT true,
  UNIQUE(stream_id, user_id),
  INDEX idx_chat_banned_stream ON chat_banned_users(stream_id, is_active);
  INDEX idx_chat_banned_user ON chat_banned_users(user_id, is_active);
);
```

### 1.2 API 엔드포인트 추가 필요

#### `POST /api/chat/messages`
- 채팅 메시지 저장
- Socket.io 서버에서 메시지 수신 시 DB에 저장

#### `DELETE /api/chat/messages/[messageId]`
- 메시지 삭제 (크리에이터만 가능)
- 권한 확인: 현재 사용자가 해당 스트림의 크리에이터인지 확인

#### `POST /api/chat/ban`
- 사용자 차단 (크리에이터만 가능)
- 권한 확인: 현재 사용자가 해당 스트림의 크리에이터인지 확인

#### `DELETE /api/chat/ban/[userId]`
- 사용자 차단 해제 (크리에이터만 가능)

#### `GET /api/chat/messages/[streamId]`
- 스트림별 채팅 메시지 히스토리 조회
- 삭제된 메시지는 제외하거나 `[삭제된 메시지]`로 표시

#### `GET /api/chat/banned/[streamId]`
- 스트림별 차단된 사용자 목록 조회 (크리에이터만)

---

## 2. 사용자-크리에이터 매핑

### 2.1 DB 테이블 수정/추가 필요

#### `user_profiles` 테이블에 필드 추가
```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS bj_id uuid REFERENCES bjs(id) ON DELETE SET NULL; -- 크리에이터 ID

CREATE INDEX IF NOT EXISTS idx_user_profiles_bj ON user_profiles(bj_id);
```

또는 별도 테이블 생성:

#### `user_bj_mapping` 테이블 (선택사항)
```sql
CREATE TABLE IF NOT EXISTS user_bj_mapping (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  bj_id uuid REFERENCES bjs(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bj_id)
);

CREATE INDEX IF NOT EXISTS idx_user_bj_mapping_user ON user_bj_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bj_mapping_bj ON user_bj_mapping(bj_id);
```

### 2.2 API 엔드포인트 추가 필요

#### `GET /api/users/[userId]/creator`
- 사용자의 크리에이터 정보 조회
- 크리에이터인지 확인 및 BJ ID 반환

#### `POST /api/users/[userId]/creator`
- 사용자를 크리에이터로 등록
- `user_profiles.bj_id` 또는 `user_bj_mapping` 테이블에 매핑

---

## 3. 알림 시스템 DB 및 API

### 3.1 DB 테이블 추가 필요

#### `notifications` 테이블
```sql
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
  created_at timestamptz DEFAULT now(),
  INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
  INDEX idx_notifications_type ON notifications(type);
  INDEX idx_notifications_created ON notifications(created_at DESC);
);
```

### 3.2 API 엔드포인트 추가 필요

#### `GET /api/notifications`
- 사용자별 알림 목록 조회
- 쿼리 파라미터: `?isRead=true/false`, `?type=live`, `?limit=20`, `?offset=0`

#### `POST /api/notifications`
- 알림 생성 (시스템/관리자용)

#### `PATCH /api/notifications/[id]/read`
- 알림 읽음 처리

#### `PATCH /api/notifications/read-all`
- 모든 알림 읽음 처리

#### `DELETE /api/notifications/[id]`
- 알림 삭제

#### `DELETE /api/notifications/clear-all`
- 모든 알림 삭제

#### `GET /api/notifications/unread-count`
- 읽지 않은 알림 개수 조회

---

## 4. 검색 기록 DB 및 API

### 4.1 DB 테이블 추가 필요

#### `search_history` 테이블
```sql
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text, -- 비회원 세션 ID
  query text NOT NULL,
  result_type text CHECK (result_type IN ('product', 'creator', 'region', 'all')),
  result_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  INDEX idx_search_history_user ON search_history(user_id, created_at DESC);
  INDEX idx_search_history_session ON search_history(session_id, created_at DESC);
  INDEX idx_search_history_query ON search_history(query);
  INDEX idx_search_history_created ON search_history(created_at DESC);
);
```

#### `popular_searches` 테이블 (선택사항)
```sql
CREATE TABLE IF NOT EXISTS popular_searches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  query text NOT NULL UNIQUE,
  search_count integer DEFAULT 1,
  last_searched_at timestamptz DEFAULT now(),
  INDEX idx_popular_searches_count ON popular_searches(search_count DESC);
  INDEX idx_popular_searches_last ON popular_searches(last_searched_at DESC);
);
```

### 4.2 API 엔드포인트 추가 필요

#### `GET /api/search/history`
- 사용자별 검색 기록 조회
- 쿼리 파라미터: `?limit=10`

#### `POST /api/search/history`
- 검색 기록 저장

#### `DELETE /api/search/history`
- 검색 기록 삭제 (전체 또는 특정 기록)

#### `GET /api/search/popular`
- 인기 검색어 조회
- 쿼리 파라미터: `?limit=10`

---

## 5. 라이브 방송 상품 소개 기능

### 5.1 DB 테이블 수정 필요

#### `live_streams` 테이블에 필드 추가
```sql
ALTER TABLE live_streams
  ADD COLUMN IF NOT EXISTS featured_product_id uuid REFERENCES products(id) ON DELETE SET NULL, -- 현재 소개 중인 상품 ID
  ADD COLUMN IF NOT EXISTS hls_url text; -- HLS 스트림 URL

CREATE INDEX IF NOT EXISTS idx_live_streams_featured_product ON live_streams(featured_product_id);
```

### 5.2 API 엔드포인트 수정/추가 필요

#### `PATCH /api/streaming/[streamId]/featured-product`
- 라이브 방송 중 소개 상품 설정/변경
- 권한 확인: 현재 사용자가 해당 스트림의 크리에이터인지 확인

#### `GET /api/streaming/[streamId]/featured-product`
- 현재 소개 중인 상품 조회

---

## 6. 장바구니 DB 저장 (선택사항)

### 6.1 DB 테이블 추가 필요

#### `cart_items` 테이블
```sql
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text, -- 비회원 세션 ID
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id), -- 회원의 경우
  UNIQUE(session_id, product_id), -- 비회원의 경우
  INDEX idx_cart_items_user ON cart_items(user_id);
  INDEX idx_cart_items_session ON cart_items(session_id);
  INDEX idx_cart_items_product ON cart_items(product_id);
);
```

### 6.2 API 엔드포인트 추가 필요

#### `GET /api/cart`
- 장바구니 조회

#### `POST /api/cart`
- 장바구니에 상품 추가

#### `PATCH /api/cart/[itemId]`
- 장바구니 상품 수량 변경

#### `DELETE /api/cart/[itemId]`
- 장바구니 상품 삭제

#### `DELETE /api/cart`
- 장바구니 전체 비우기

---

## 7. 추가 개선 사항

### 7.1 라이브 스트림 테이블 개선

#### `live_streams` 테이블에 필드 추가
```sql
ALTER TABLE live_streams
  ADD COLUMN IF NOT EXISTS description text, -- 방송 설명
  ADD COLUMN IF NOT EXISTS rtmp_url text, -- RTMP 스트림 URL
  ADD COLUMN IF NOT EXISTS stream_key text; -- 스트림 키 (암호화 저장 권장)
```

### 7.2 상품 테이블 개선

#### `products` 테이블에 필드 확인 및 추가
```sql
-- 이미 migration 파일에 추가되어 있는지 확인 필요
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS thumbnail_url text,
  ADD COLUMN IF NOT EXISTS detail_images jsonb,
  ADD COLUMN IF NOT EXISTS detail_description text,
  ADD COLUMN IF NOT EXISTS tags jsonb,
  ADD COLUMN IF NOT EXISTS is_specialty boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS specialty_id text;
```

### 7.3 주문 테이블 개선

#### `orders` 테이블에 필드 추가
```sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS coin_payment_amount numeric DEFAULT 0, -- 코인으로 결제한 금액
  ADD COLUMN IF NOT EXISTS coin_earned numeric DEFAULT 0; -- 적립된 코인 수
```

---

## 8. API 권한 관리

### 8.1 크리에이터 권한 확인 미들웨어

모든 크리에이터 전용 API에 다음 권한 확인 로직 필요:

```typescript
// 예시: /api/chat/messages/[messageId] DELETE
async function checkCreatorPermission(userId: string, streamId: string): Promise<boolean> {
  // user_profiles에서 bj_id 조회
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('bj_id')
    .eq('id', userId)
    .single();
  
  if (!profile?.bj_id) return false;
  
  // live_streams에서 bj_id 확인
  const { data: stream } = await supabaseAdmin
    .from('live_streams')
    .select('bj_id')
    .eq('id', streamId)
    .single();
  
  return profile.bj_id === stream?.bj_id;
}
```

### 8.2 관리자 권한 확인 미들웨어

모든 관리자 전용 API에 권한 확인 필요:

```typescript
async function checkAdminPermission(userId: string): Promise<boolean> {
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  
  return profile?.is_admin === true;
}
```

---

## 9. 마이그레이션 실행 순서

1. **기본 스키마**: `schema.sql` 실행
2. **기존 마이그레이션 파일들**:
   - `add-product-details.sql`
   - `add-reviews.sql`
   - `add-promotions.sql`
   - `add-refunds.sql`
   - `add-coin-system.sql`
   - `add-admin-role.sql`
3. **새로 생성된 마이그레이션 파일들** (✅ 완료):
   - ✅ `add-chat-system.sql` - 채팅 메시지 및 차단 테이블
   - ✅ `add-notifications.sql` - 알림 테이블
   - ✅ `add-search-history.sql` - 검색 기록 테이블
   - ✅ `add-live-stream-features.sql` - 라이브 스트림 기능 확장
   - ✅ `add-user-bj-mapping.sql` - 사용자-크리에이터 매핑
   - ✅ `add-rls-policies.sql` - RLS 정책 추가
4. **RLS 정책**: `rls.sql` 실행 후 `add-rls-policies.sql` 실행

---

## 10. 우선순위 및 진행 상황

### 높은 우선순위 (필수) - ✅ 완료
1. ✅ 채팅 메시지 저장 및 관리 (DB + API)
   - ✅ `chat_messages` 테이블 생성
   - ✅ `POST /api/chat/messages` - 메시지 저장
   - ✅ `GET /api/chat/messages` - 메시지 히스토리 조회
   - ✅ `DELETE /api/chat/messages/[messageId]` - 메시지 삭제

2. ✅ 채팅 차단 기능 (DB + API)
   - ✅ `chat_banned_users` 테이블 생성
   - ✅ `POST /api/chat/ban` - 사용자 차단
   - ✅ `GET /api/chat/ban` - 차단 목록 조회
   - ✅ `DELETE /api/chat/ban/[userId]` - 차단 해제

3. ✅ 사용자-크리에이터 매핑 (DB 수정 + API)
   - ✅ `user_profiles.bj_id` 필드 추가
   - ✅ `user_bj_mapping` 테이블 생성 (선택사항)
   - ✅ `GET /api/users/[userId]/creator` - 크리에이터 정보 조회
   - ✅ `POST /api/users/[userId]/creator` - 크리에이터 등록

4. ✅ 라이브 방송 상품 소개 기능 (DB 수정 + API)
   - ✅ `live_streams.featured_product_id` 필드 추가
   - ✅ `GET /api/streaming/[streamId]/featured-product` - 소개 상품 조회
   - ✅ `PATCH /api/streaming/[streamId]/featured-product` - 소개 상품 설정

### 중간 우선순위 (권장) - ✅ 완료
5. ✅ 알림 시스템 DB 저장 (현재 LocalStorage 사용 중)
   - ✅ `notifications` 테이블 생성
   - ✅ `GET /api/notifications` - 알림 목록 조회
   - ✅ `POST /api/notifications` - 알림 생성
   - ✅ `PATCH /api/notifications/[id]/read` - 알림 읽음 처리
   - ✅ `PATCH /api/notifications/read-all` - 모든 알림 읽음 처리
   - ✅ `GET /api/notifications/unread-count` - 읽지 않은 알림 개수

6. ✅ 검색 기록 DB 저장 (현재 LocalStorage 사용 중)
   - ✅ `search_history` 테이블 생성
   - ✅ `popular_searches` 테이블 생성
   - ✅ `GET /api/search/history` - 검색 기록 조회
   - ✅ `POST /api/search/history` - 검색 기록 저장
   - ✅ `DELETE /api/search/history` - 검색 기록 삭제
   - ✅ `GET /api/search/popular` - 인기 검색어 조회

### 낮은 우선순위 (선택사항)
7. 장바구니 DB 저장 (현재 Zustand Store 사용 중)
   - `cart_items` 테이블 생성 필요
   - API 엔드포인트 구현 필요

---

## 11. 구현 가이드

각 기능별로 다음 순서로 개발:

1. **DB 마이그레이션 파일 작성** ✅ 완료
   - ✅ `supabase/migrations/add-chat-system.sql`
   - ✅ `supabase/migrations/add-notifications.sql`
   - ✅ `supabase/migrations/add-search-history.sql`
   - ✅ `supabase/migrations/add-live-stream-features.sql`
   - ✅ `supabase/migrations/add-user-bj-mapping.sql`
   - ✅ `supabase/migrations/add-rls-policies.sql`

2. **API 엔드포인트 구현** ✅ 완료
   - ✅ 채팅 메시지 API (`/api/chat/messages`)
   - ✅ 채팅 차단 API (`/api/chat/ban`)
   - ✅ 알림 API (`/api/notifications`)
   - ✅ 검색 기록 API (`/api/search/history`, `/api/search/popular`)
   - ✅ 라이브 스트림 상품 소개 API (`/api/streaming/[streamId]/featured-product`)
   - ✅ 사용자-크리에이터 매핑 API (`/api/users/[userId]/creator`)

3. **타입 정의 추가** (필요 시)
   - `src/types/chat.ts` - 채팅 메시지 타입
   - `src/types/notification.ts` - 알림 타입
   - `src/types/search.ts` - 검색 기록 타입

4. **프론트엔드 연동** (다음 단계)
   - 기존 Mock 데이터를 실제 API 호출로 교체
   - 에러 처리 및 로딩 상태 관리
   - Socket.io 서버에서 메시지 저장 API 호출 추가

5. **테스트** (필요)
   - API 엔드포인트 테스트
   - 권한 확인 테스트
   - 에러 케이스 테스트

---

## 12. 다음 단계 작업

### 12.1 Socket.io 서버 연동
- 채팅 서버에서 메시지 수신 시 `/api/chat/messages` API 호출하여 DB 저장
- 메시지 삭제 시 `/api/chat/messages/[messageId]` API 호출
- 사용자 차단 시 `/api/chat/ban` API 호출

### 12.2 프론트엔드 연동
- `useChat` 훅에서 실제 API 호출 추가
- 알림 시스템을 LocalStorage에서 DB로 전환
- 검색 기록을 LocalStorage에서 DB로 전환

### 12.3 권한 확인 로직 개선
- 크리에이터 권한 확인을 `user_profiles.bj_id` 기반으로 변경
- 관리자 권한 확인을 `user_profiles.role` 기반으로 변경

### 12.4 에러 처리 및 로깅
- API 에러 로깅 시스템 구축
- 사용자 친화적인 에러 메시지 제공
