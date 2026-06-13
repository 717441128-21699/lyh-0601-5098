export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  courseId: string;
  amount: number;
  status: OrderStatus;
  paymentMethod?: string;
  paidAt?: string;
  ticket: CourseTicket;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';

export interface CourseTicket {
  id: string;
  orderId: string;
  code: string;
  qrCode: string;
  validFrom: string;
  validTo: string;
  used: boolean;
  usedAt?: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: 'wechat' | 'alipay';
}
