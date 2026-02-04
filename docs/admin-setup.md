# 관리자 계정 설정 가이드

## 방법 1: 데이터베이스에서 직접 설정 (권장)

### 1. Supabase SQL Editor에서 실행

```sql
-- 특정 사용자를 관리자로 설정
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = '사용자_UUID';

-- 또는 이메일로 설정
UPDATE user_profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);
```

### 2. 사용자 UUID 확인 방법

Supabase 대시보드 → Authentication → Users에서 사용자 ID 확인

## 방법 2: 마이그레이션 실행 후 수동 설정

### 1. 마이그레이션 실행

Supabase SQL Editor에서 `supabase/migrations/add-admin-role.sql` 파일 내용 실행

### 2. 관리자 계정 생성

```sql
-- 새 사용자 생성 후 관리자로 설정
INSERT INTO user_profiles (id, role)
VALUES ('사용자_UUID', 'admin')
ON CONFLICT (id) 
DO UPDATE SET role = 'admin';
```

## 방법 3: 개발 환경에서 임시 관리자 설정

개발 환경에서는 특정 이메일을 관리자로 자동 설정할 수 있습니다:

```typescript
// src/lib/auth.ts에서
const isAdminEmail = user.email === 'admin@example.com';
if (isAdminEmail && !profile?.role) {
  // 개발 환경에서만 자동으로 관리자 설정
  await supabaseAdmin
    .from('user_profiles')
    .upsert({ id: user.id, role: 'admin' });
}
```

## 역할 종류

- `user`: 일반 사용자 (기본값)
- `seller`: 셀러 (상품 판매 가능)
- `admin`: 관리자 (모든 권한)

## 확인 방법

관리자 페이지(`/admin/products`, `/admin/ranking`)에 접근하여 확인할 수 있습니다.
