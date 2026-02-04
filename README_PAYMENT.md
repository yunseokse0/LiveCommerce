# 토스페이먼츠 결제 연동 가이드

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# 토스페이먼츠 클라이언트 키 (공개 키)
NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY=test_ck_...

# 토스페이먼츠 시크릿 키 (서버 사이드 전용)
TOSS_PAYMENTS_SECRET_KEY=test_sk_...
```

## 토스페이먼츠 계정 설정

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)에 가입
2. 테스트 모드에서 클라이언트 키와 시크릿 키 발급
3. 환경 변수에 키 설정
4. 결제 위젯이 자동으로 활성화됩니다

## 결제 프로세스

1. **주문 생성**: `/api/orders` POST
2. **결제 요청**: `/api/payment/request` POST
3. **토스페이먼츠 위젯 표시**: `TossPaymentWidget` 컴포넌트
4. **결제 승인**: `/api/payment/complete` POST
5. **결제 완료**: `/payment/success` 페이지로 리다이렉트

## 결제 위젯 사용

`PaymentButton` 컴포넌트는 환경 변수가 설정되면 자동으로 토스페이먼츠 위젯을 사용합니다.

```tsx
<PaymentButton
  items={cartItems}
  shippingAddress={address}
  useTossPayments={true} // 자동으로 감지됨
  onSuccess={(orderId) => {
    // 결제 성공 처리
  }}
/>
```

## Supabase Storage 설정 (이미지 업로드)

1. Supabase 대시보드에서 Storage 활성화
2. `images` 버킷 생성
3. Public Access 정책 설정
4. 리뷰 이미지 업로드가 자동으로 작동합니다

## 환불 관리

관리자는 `/admin/refunds` 페이지에서 환불 요청을 승인/거부할 수 있습니다.
