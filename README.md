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
```

## 🗄️ 데이터베이스 설정

### Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 Database URL과 API Keys 확인

### 데이터베이스 스키마 생성

Supabase SQL Editor에서 다음 순서로 실행:

1. **스키마 생성**: `supabase/schema.sql` 파일의 내용 실행
2. **RLS 정책 설정**: `supabase/rls.sql` 파일의 내용 실행
3. **초기 데이터 삽입** (선택사항): `supabase/seed.sql` 파일의 내용 실행

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
- ✅ 실시간 라이브 방송 통합 (YouTube)
- ✅ 크리에이터 랭킹 시스템
- ✅ 통합 플레이어 (YouTube + 자체 플랫폼)
- ✅ 라이브 채팅
- ✅ 관리자 백오피스
- ✅ 광고 관리 시스템
- ✅ **전국 특산물 지도** (지역별 특산물 및 방송 연동)
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

## 🚢 배포

### Vercel 배포

1. GitHub에 프로젝트 푸시
2. Vercel에 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포 완료

### Cron 작업

Vercel Cron을 통해 다음 작업이 자동 실행됩니다:
- **일일 YouTube 동기화**: 매일 자정 (`/api/sync-youtube`)
- **점수 계산**: 30분마다 (`/api/calculate-scores`)

## 📚 문서

자세한 개발 가이드는 프로젝트 루트의 `DEVELOPMENT_GUIDE.md` 파일을 참고하세요.

## 📄 라이선스

MIT License
