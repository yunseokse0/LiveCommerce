# Live Commerce - 실시간 라이브 스트리밍 플랫폼

자체 라이브커머스 솔루션을 구축한 Next.js 16 기반의 실시간 라이브 스트리밍 플랫폼입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 또는 yarn
- Supabase 계정
- YouTube Data API v3 키 (선택사항)

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필요한 값들을 입력하세요

# 개발 서버 실행
npm run dev

# 채팅 서버 실행 (별도 터미널)
npm run dev:chat

# 스트리밍 서버 실행 (별도 터미널, 선택사항)
npm run dev:streaming
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📋 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# 필수
YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 선택사항
CRON_SECRET=your_cron_secret
ENCRYPTION_KEY=your-secure-encryption-key-change-this-in-production
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:3001
```

## 🗄️ 데이터베이스 설정

### Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 Database URL과 API Keys 확인

### 데이터베이스 스키마 생성

Supabase SQL Editor에서 다음 순서로 실행:

1. **기본 스키마 생성**: `supabase/schema.sql` 파일의 내용 실행
2. **마이그레이션 파일 실행**:
   - `supabase/migrations/add-product-details.sql`
   - `supabase/migrations/add-reviews.sql`
   - `supabase/migrations/add-promotions.sql`
   - `supabase/migrations/add-refunds.sql`
   - `supabase/migrations/add-coin-system.sql`
   - `supabase/migrations/add-admin-role.sql`
   - `supabase/migrations/add-chat-system.sql`
   - `supabase/migrations/add-notifications.sql`
   - `supabase/migrations/add-search-history.sql`
   - `supabase/migrations/add-live-stream-features.sql`
   - `supabase/migrations/add-user-bj-mapping.sql`
3. **RLS 정책 설정**: `supabase/rls.sql` 파일의 내용 실행
4. **RLS 정책 추가**: `supabase/migrations/add-rls-policies.sql` 파일의 내용 실행
5. **초기 데이터 삽입** (선택사항): `supabase/seed.sql` 파일의 내용 실행

또는 Supabase CLI 사용:

```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

### 주요 테이블

- `bjs` - 크리에이터 정보
- `live_streams` - 라이브 방송 상태
- `bj_stats` - 크리에이터 통계 및 랭킹
- `ads` - 광고 관리
- `ad_stats` - 광고 통계
- `regions` - 지역 정보
- `local_products` - 특산물 정보
- `creator_regions` - 크리에이터-지역 연동
- `products` - 상품 정보 (라이브커머스)
- `orders` - 주문 정보
- `order_items` - 주문 상품
- `user_profiles` - 사용자 프로필 확장
- `chat_messages` - 채팅 메시지
- `chat_banned_users` - 채팅 차단 사용자
- `notifications` - 알림
- `search_history` - 검색 기록
- `popular_searches` - 인기 검색어
- `user_coins` - 코인 잔액
- `coin_transactions` - 코인 거래 내역
- `product_reviews` - 상품 리뷰
- `coupons` - 쿠폰
- `order_refunds` - 환불

## 🔐 인증 설정

### Supabase Auth 설정

1. **Supabase 대시보드에서 인증 활성화**
   - Authentication > Providers에서 다음 제공자 활성화:
     - Email (기본 활성화)
     - Google
     - Facebook
     - Kakao

2. **OAuth 제공자 설정**

   **Google:**
   - Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
   - 승인된 리디렉션 URI: `https://your-project.supabase.co/auth/v1/callback`
   - Supabase에 Client ID와 Client Secret 입력

   **Facebook:**
   - Facebook Developers에서 앱 생성
   - 승인된 OAuth 리디렉션 URI: `https://your-project.supabase.co/auth/v1/callback`
   - Supabase에 App ID와 App Secret 입력

   **Kakao:**
   - Kakao Developers에서 앱 생성
   - Redirect URI: `https://your-project.supabase.co/auth/v1/callback`
   - Supabase에 REST API 키 입력

3. **Site URL 설정**
   - Authentication > URL Configuration
   - Site URL: `http://localhost:3000` (개발) 또는 프로덕션 URL
   - Redirect URLs: `http://localhost:3000/auth/callback` 추가

## 🛠️ 주요 기능

- ✅ **회원가입 및 로그인 시스템**
  - 이메일 회원가입/로그인
  - Google 소셜 로그인
  - Facebook 소셜 로그인
  - 카카오 소셜 로그인
  - 사용자 프로필 관리
- ✅ **다국어 지원 (6개 언어)**
  - 한국어, 영어, 일본어, 중국어, 베트남어, 태국어
  - 로케일별 통화/날짜/시간 포맷팅
  - 국가별 지역 및 특산물 다국어화
- ✅ **보안 시스템**
  - 코드 난독화 (프로덕션 빌드)
  - 암호화 유틸리티 (AES, SHA-256)
  - Rate Limiting (API 요청 제한)
  - SQL Injection 방지
  - XSS 공격 방지
  - 보안 헤더 설정 (CSP, XSS Protection 등)
  - JWT 토큰 보안 강화
  - 역할 기반 접근 제어 (RBAC)
- ✅ **UI/UX 개선**
  - 스켈레톤 UI (로딩 상태)
  - Toast 알림 시스템
  - 확인 다이얼로그 컴포넌트
  - 빈 상태(Empty State) UI
  - 로딩 버튼 컴포넌트
  - 접근성 개선 (키보드 네비게이션, 포커스 상태)
- ✅ 실시간 라이브 방송 통합 (YouTube)
- ✅ 크리에이터 랭킹 시스템
- ✅ 통합 플레이어 (YouTube + 자체 플랫폼)
- ✅ **라이브 채팅 시스템**
  - 실시간 메시지 전송
  - 크리에이터 채팅 관리 (메시지 삭제, 사용자 차단)
  - 구매 알림 채팅
- ✅ 관리자 백오피스
- ✅ 광고 관리 시스템
- ✅ **전국 특산물 지도** (지역별 특산물 및 방송 연동)
- ✅ **실시간 상품 팝업** (라이브 방송 중 상품 소개)
- ✅ **알림 시스템** (Toast 알림, 알림 센터)
- ✅ **전역 검색** (상품/크리에이터/지역 통합 검색)
- ✅ **다크 모드** 지원
- ✅ 30초 자동 갱신
- ✅ 완벽한 모바일 반응형

## 📁 프로젝트 구조

```
src/
├── app/              # Next.js App Router
│   ├── api/          # API 라우트
│   │   ├── bjs/      # 크리에이터 API
│   │   ├── regions/  # 지역 API
│   │   ├── ads/      # 광고 API
│   │   └── ...
│   ├── auth/         # 인증 페이지
│   ├── map/          # 지도 페이지
│   └── ...
├── components/        # React 컴포넌트
├── lib/              # 유틸리티 및 서버 액션
├── hooks/            # Custom Hooks
├── store/            # Zustand 상태 관리
└── types/            # TypeScript 타입 정의

supabase/
├── schema.sql        # 데이터베이스 스키마
├── rls.sql          # RLS 정책
└── seed.sql         # 초기 데이터
```

## 🔌 API 엔드포인트

### 크리에이터 API
- `GET /api/bjs` - 크리에이터 목록 조회
- `POST /api/bjs` - 크리에이터 추가
- `GET /api/bjs/[id]` - 크리에이터 상세 조회
- `PATCH /api/bjs/[id]` - 크리에이터 수정
- `DELETE /api/bjs/[id]` - 크리에이터 삭제

### 지역 API
- `GET /api/regions` - 지역 목록 조회
- `POST /api/regions` - 지역 추가

### 특산물 API
- `GET /api/local-products` - 특산물 목록 조회
- `POST /api/local-products` - 특산물 추가

### 광고 API
- `GET /api/ads` - 광고 목록 조회
- `POST /api/ads` - 광고 추가
- `POST /api/ad-stats` - 광고 통계 기록
- `GET /api/ad-stats` - 광고 통계 조회

### 라이브 방송 API
- `GET /api/live-list` - 라이브 방송 목록
- `GET /api/live-ranking` - 랭킹 조회
- `GET /api/region-streams` - 지역별 방송 조회
- `GET /api/streaming/[streamId]/featured-product` - 소개 상품 조회
- `PATCH /api/streaming/[streamId]/featured-product` - 소개 상품 설정

### 채팅 API
- `POST /api/chat/messages` - 채팅 메시지 저장
- `GET /api/chat/messages` - 채팅 메시지 히스토리 조회
- `DELETE /api/chat/messages/[messageId]` - 메시지 삭제 (크리에이터)
- `POST /api/chat/ban` - 사용자 차단 (크리에이터)
- `GET /api/chat/ban` - 차단 목록 조회
- `DELETE /api/chat/ban/[userId]` - 차단 해제

### 알림 API
- `GET /api/notifications` - 알림 목록 조회
- `POST /api/notifications` - 알림 생성
- `PATCH /api/notifications/[id]/read` - 알림 읽음 처리
- `PATCH /api/notifications/read-all` - 모든 알림 읽음 처리
- `GET /api/notifications/unread-count` - 읽지 않은 알림 개수

### 검색 API
- `GET /api/search/history` - 검색 기록 조회
- `POST /api/search/history` - 검색 기록 저장
- `DELETE /api/search/history` - 검색 기록 삭제
- `GET /api/search/popular` - 인기 검색어 조회

### 사용자 API
- `GET /api/users/[userId]/creator` - 크리에이터 정보 조회
- `POST /api/users/[userId]/creator` - 크리에이터 등록

## 🚢 배포

### 빌드

```bash
# 일반 빌드
npm run build

# 난독화 빌드 (프로덕션)
npm run build:obfuscated

# 프로덕션 서버 실행
npm start
```

### Vercel 배포

1. GitHub에 프로젝트 푸시
2. Vercel에 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포 완료

### Cron 작업

Vercel Cron을 통해 다음 작업이 자동 실행됩니다:
- **일일 YouTube 동기화**: 매일 자정 (`/api/sync-youtube`)
- **점수 계산**: 30분마다 (`/api/calculate-scores`)

### 채팅 서버 배포

채팅 서버는 별도로 배포해야 합니다:
- Node.js 서버 (포트 3001)
- Socket.io 기반 실시간 통신
- 환경 변수: `NEXT_PUBLIC_CHAT_SERVER_URL` 설정 필요

## 📚 문서

- **[기능 정리 (기능_정리.md)](./기능_정리.md)**: 전체 기능 상세 정리
- **[백엔드 DB 개발 필요사항](./백엔드_DB_개발_필요사항.md)**: 백엔드 API 및 DB 개발 가이드
- **[보안 구현 가이드](./보안_구현_가이드.md)**: 코드 난독화, 암호화, 보안 미들웨어 등
- **[UI/UX 개선 내용](./UI_UX_개선_내용.md)**: 로딩 상태, 알림 시스템, 접근성 개선 등
- **[다국어 지원 구현 내용](./다국어_지원_구현_내용.md)**: 다국어 시스템 상세 구현 내용
- **[라이브 쇼핑 고도화](./라이브_쇼핑_고도화_구현_내용.md)**: 실시간 상품 팝업, 구매 알림 등
- **[관리자 대시보드 고도화](./관리자_대시보드_고도화_구현_내용.md)**: 매출 분석, 트래픽 모니터링 등
- **[UX 개선 구현 내용](./UX_개선_구현_내용.md)**: 알림 시스템, 검색, 에러 처리 등
- **[데이터 관리 및 보안](./데이터_관리_및_보안_구현_내용.md)**: 장바구니 동기화, 트랜잭션 로그 등
- **[스트리밍 서버 가이드](./src/lib/streaming/README.md)**: 자체 스트리밍 서버 구축 및 설정 가이드
- **[채팅 시스템 가이드](./src/lib/chat/README.md)**: 실시간 채팅 시스템 구축 가이드

## 📄 라이선스

MIT License
