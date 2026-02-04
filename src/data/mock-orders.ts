/**
 * 주문용 MOCK 데이터
 */

import type { Order, OrderItem } from '@/types/product';

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    totalAmount: 60000,
    discountAmount: 5000,
    coinPaymentAmount: 0,
    finalAmount: 55000,
    coinEarned: 550,
    status: 'paid',
    paymentMethod: 'card',
    shippingAddress: '서울특별시 강남구 테헤란로 123',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-1',
        orderId: 'order-1',
        productId: 'product-1',
        quantity: 2,
        price: 25000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'item-2',
        orderId: 'order-1',
        productId: 'product-2',
        quantity: 1,
        price: 35000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'order-2',
    userId: 'user-1',
    totalAmount: 28000,
    discountAmount: 0,
    coinPaymentAmount: 5000,
    finalAmount: 23000,
    coinEarned: 230,
    status: 'shipped',
    paymentMethod: 'coin',
    shippingAddress: '서울특별시 강남구 테헤란로 123',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-3',
        orderId: 'order-2',
        productId: 'product-3',
        quantity: 1,
        price: 28000,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'order-3',
    userId: 'user-1',
    totalAmount: 45000,
    discountAmount: 0,
    coinPaymentAmount: 0,
    finalAmount: 45000,
    coinEarned: 450,
    status: 'delivered',
    paymentMethod: 'card',
    shippingAddress: '서울특별시 강남구 테헤란로 123',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-4',
        orderId: 'order-3',
        productId: 'product-4',
        quantity: 1,
        price: 45000,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];
