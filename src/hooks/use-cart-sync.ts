/**
 * 장바구니 동기화 훅
 * 로그인 시 비회원 장바구니를 회원 장바구니와 병합
 */

import { useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';

export function useCartSync() {
  const { user } = useAuth();
  const { mergeGuestCart, syncWithServer, items } = useCart();

  useEffect(() => {
    if (!user) {
      // 로그아웃 시 비회원 장바구니로 전환 (현재 장바구니를 guestItems로 저장)
      // 이 부분은 필요에 따라 구현
      return;
    }

    // 로그인 시 비회원 장바구니 병합
    mergeGuestCart();

    // 서버 장바구니와 동기화 (실제 운영 시 API 호출)
    // 현재는 Mock 데이터이므로 주석 처리
    /*
    fetch(`/api/cart?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          syncWithServer(data.items);
        }
      })
      .catch((error) => {
        console.error('장바구니 동기화 오류:', error);
      });
    */
  }, [user?.id, mergeGuestCart, syncWithServer]);
}
