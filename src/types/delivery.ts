/**
 * 배송 관련 타입 정의
 */

export interface DeliveryInfo {
  orderId: string;
  shippingAddress: string;
  recipientName?: string;
  recipientPhone?: string;
  deliveryMethod?: 'standard' | 'express' | 'pickup';
  trackingNumber?: string;
  carrier?: string; // 택배사 (CJ대한통운, 한진택배 등)
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: 'pending' | 'preparing' | 'shipped' | 'in_transit' | 'delivered' | 'failed';
  notes?: string;
}

export interface DeliveryUpdate {
  orderId: string;
  status: DeliveryInfo['status'];
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
}

export interface ShippingAddress {
  recipientName: string;
  recipientPhone: string;
  address: string;
  detailAddress: string;
  postalCode: string;
  deliveryMethod?: 'standard' | 'express' | 'pickup';
  deliveryNotes?: string;
}
