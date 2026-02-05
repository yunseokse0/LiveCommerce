import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types/product';

interface CartState {
  items: CartItem[];
  guestItems?: CartItem[]; // 비회원 장바구니 (로그인 전)
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  syncWithServer: (serverItems: CartItem[]) => void; // 서버 장바구니와 동기화
  mergeGuestCart: () => void; // 비회원 장바구니 병합
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      guestItems: [],
      
      addItem: (product: Product, quantity = 1) => {
        // 낙관적 업데이트: 서버 응답 전에 UI 먼저 업데이트
        const items = get().items;
        const existingItem = items.find((item) => item.product.id === product.id);
        
        if (existingItem) {
          // 이미 장바구니에 있으면 수량 증가
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
                : item
            ),
          });
        } else {
          // 새 상품 추가
          set({
            items: [...items, { product, quantity: Math.min(quantity, product.stock) }],
          });
        }

        // 실제 운영 시 서버에 동기화 (실패 시 롤백 가능)
        /*
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id, quantity }),
        })
          .then((res) => res.json())
          .catch((error) => {
            console.error('장바구니 추가 실패:', error);
            // 롤백: 이전 상태로 복원
            set({ items });
          });
        */
      },
      
      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const items = get().items;
        const item = items.find((item) => item.product.id === productId);
        if (!item) return;
        
        // 재고 확인
        const maxQuantity = item.product.stock;
        const finalQuantity = Math.min(quantity, maxQuantity);
        
        set({
          items: items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: finalQuantity }
              : item
          ),
        });
      },
      
      clearCart: () => {
        set({ items: [], guestItems: [] });
      },

      // 서버 장바구니와 동기화
      syncWithServer: (serverItems: CartItem[]) => {
        const currentItems = get().items;
        
        // 서버 아이템을 기준으로 병합 (서버 우선)
        const mergedItems: CartItem[] = [];
        const processedProductIds = new Set<string>();

        // 1. 서버 아이템 먼저 추가
        serverItems.forEach((serverItem) => {
          mergedItems.push(serverItem);
          processedProductIds.add(serverItem.product.id);
        });

        // 2. 로컬에만 있는 아이템 추가 (중복 제외)
        currentItems.forEach((localItem) => {
          if (!processedProductIds.has(localItem.product.id)) {
            mergedItems.push(localItem);
          }
        });

        set({ items: mergedItems });
      },

      // 비회원 장바구니 병합 (로그인 시 호출)
      mergeGuestCart: () => {
        const { items, guestItems } = get();
        
        if (!guestItems || guestItems.length === 0) {
          return;
        }

        const mergedItems: CartItem[] = [...items];
        const existingProductIds = new Set(items.map((item) => item.product.id));

        // 비회원 장바구니 아이템 병합
        guestItems.forEach((guestItem) => {
          if (existingProductIds.has(guestItem.product.id)) {
            // 이미 있으면 수량 합산 (재고 확인)
            const existingItem = mergedItems.find(
              (item) => item.product.id === guestItem.product.id
            );
            if (existingItem) {
              const newQuantity = Math.min(
                existingItem.quantity + guestItem.quantity,
                guestItem.product.stock
              );
              existingItem.quantity = newQuantity;
            }
          } else {
            // 없으면 추가
            mergedItems.push(guestItem);
          }
        });

        set({ items: mergedItems, guestItems: [] });
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      // 비회원 장바구니는 별도 키로 저장
      partialize: (state) => ({
        items: state.items,
        guestItems: state.guestItems,
      }),
    }
  )
);
