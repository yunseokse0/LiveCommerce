# 데이터베이스 설정 가이드

이 디렉토리에는 Supabase 데이터베이스 스키마 및 설정 파일이 포함되어 있습니다.

## 📋 파일 구조

- `schema.sql` - 데이터베이스 스키마 (테이블, 인덱스, 트리거)
- `rls.sql` - Row Level Security (RLS) 정책
- `seed.sql` - 초기 데이터 (선택사항)

## 🚀 설정 방법

### 방법 1: Supabase 대시보드 사용

1. **Supabase 프로젝트 생성**
   - [Supabase](https://supabase.com)에서 새 프로젝트 생성
   - 프로젝트 설정에서 Database URL과 API Keys 확인

2. **SQL Editor에서 실행**
   - Supabase 대시보드 > SQL Editor 이동
   - 다음 순서로 SQL 파일 실행:
     1. `schema.sql` - 전체 내용 복사하여 실행
     2. `rls.sql` - 전체 내용 복사하여 실행
     3. `seed.sql` - 선택사항, 초기 데이터 삽입

### 방법 2: Supabase CLI 사용

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

### 방법 3: 직접 SQL 실행

각 파일의 SQL을 순서대로 Supabase SQL Editor에서 실행:

```sql
-- 1. schema.sql 실행
-- 2. rls.sql 실행
-- 3. seed.sql 실행 (선택사항)
```

## 📊 테이블 구조

### 핵심 테이블

1. **bjs** - 크리에이터 정보
2. **live_streams** - 라이브 방송 상태
3. **bj_stats** - 크리에이터 통계 및 랭킹
4. **ads** - 광고 관리
5. **ad_stats** - 광고 통계
6. **regions** - 지역 정보
7. **local_products** - 특산물 정보
8. **creator_regions** - 크리에이터-지역 연동

### 라이브커머스 확장 테이블

9. **products** - 상품 정보
10. **live_product_links** - 라이브 방송-상품 연동
11. **orders** - 주문 정보
12. **order_items** - 주문 상품
13. **user_profiles** - 사용자 프로필 확장

## 🔒 보안 설정

### RLS (Row Level Security)

모든 테이블에 RLS가 활성화되어 있습니다:

- **읽기**: 대부분의 테이블은 모든 사용자가 읽기 가능
- **쓰기**: 서버 사이드(Service Role)에서만 가능
- **사용자 데이터**: 사용자는 자신의 데이터만 접근 가능

### 인증

- Supabase Auth를 통한 사용자 인증
- 소셜 로그인 지원 (Google, Facebook, Kakao)

## 🔄 자동화 기능

### 트리거

- `updated_at` 자동 업데이트: 모든 테이블의 `updated_at` 컬럼이 자동으로 업데이트됩니다.
- 랭킹 자동 계산: `bj_stats` 테이블의 점수가 변경되면 자동으로 랭킹이 업데이트됩니다.

### 함수

- `update_updated_at_column()` - updated_at 자동 업데이트
- `update_ranking()` - 랭킹 자동 계산
- `trigger_update_ranking()` - 랭킹 업데이트 트리거

## 📝 초기 데이터

`seed.sql` 파일에는 다음 초기 데이터가 포함되어 있습니다:

- 한국 17개 시/도 지역 정보
- 제주도 특산물 예시 (한라봉, 감귤)

필요에 따라 추가 데이터를 삽입할 수 있습니다.

## 🔍 인덱스

성능 최적화를 위해 다음 인덱스가 생성됩니다:

- 외래 키 인덱스
- 자주 조회되는 컬럼 인덱스
- 정렬에 사용되는 컬럼 인덱스

## ⚠️ 주의사항

1. **순서 중요**: `schema.sql` → `rls.sql` → `seed.sql` 순서로 실행해야 합니다.
2. **RLS 정책**: 프로덕션 환경에서는 RLS 정책을 반드시 확인하세요.
3. **백업**: 중요한 데이터는 정기적으로 백업하세요.

## 🐛 문제 해결

### 오류: "relation already exists"
- 테이블이 이미 존재하는 경우, `DROP TABLE` 후 다시 생성하거나 `IF NOT EXISTS` 사용

### 오류: "permission denied"
- Service Role Key를 사용하여 실행해야 합니다.
- RLS 정책을 확인하세요.

### 오류: "foreign key constraint"
- 참조되는 테이블이 먼저 생성되어야 합니다.
- `schema.sql`의 순서를 확인하세요.

## 📚 추가 리소스

- [Supabase 문서](https://supabase.com/docs)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [RLS 가이드](https://supabase.com/docs/guides/auth/row-level-security)
