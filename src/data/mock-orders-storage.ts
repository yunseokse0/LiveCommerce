/**
 * 주문 로컬 스토리지 관리
 */

import type { Order } from '@/types/product';
import { mockOrders } from './mock-orders';

const ORDERS_STORAGE_KEY = 'livecommerce_orders';

/**
 * 로컬 스토리지에서 주문 목록 가져오기
 */
export function getLocalOrders(userId?: string): Order[] {
  if (typeof window === 'undefined') return mockOrders;
  
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const allOrders = [...mockOrders, ...parsed];
      return userId ? allOrders.filter((o) => o.userId === userId) : allOrders;
    }
  } catch (error) {
    console.error('주문 목록 로드 오류:', error);
  }
  
  return userId ? mockOrders.filter((o) => o.userId === userId) : mockOrders;
}

/**
 * 로컬 스토리지에 주문 저장
 */
export function saveLocalOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getLocalOrders();
    const filtered = existing.filter((o) => o.id !== order.id);
    const updated = [...filtered, order];
    
    // mock 데이터 제외하고 저장
    const customOrders = updated.filter((o) => !mockOrders.find((mo) => mo.id === o.id));
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(customOrders));
  } catch (error) {
    console.error('주문 저장 오류:', error);
  }
}

/**
 * 로컬 스토리지에서 주문 업데이트
 */
export function updateLocalOrder(orderId: string, updates: Partial<Order>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = getLocalOrders();
    const updated = existing.map((o) =>
      o.id === orderId ? { ...o, ...updates } : o
    );
    
    // mock 데이터 제외하고 저장
    const customOrders = updated.filter((o) => !mockOrders.find((mo) => mo.id === o.id));
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(customOrders));
  } catch (error) {
    console.error('주문 업데이트 오류:', error);
  }
}
