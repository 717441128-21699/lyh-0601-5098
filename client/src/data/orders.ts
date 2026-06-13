import { Order } from '@/types';

export const mockOrders: Order[] = [
  {
    id: 'o1',
    orderNo: 'ORD20240615001',
    userId: 'u1',
    courseId: 'c1',
    amount: 399,
    status: 'paid',
    paymentMethod: 'wechat',
    paidAt: '2024-06-10T10:30:00Z',
    ticket: {
      id: 't1',
      orderId: 'o1',
      code: 'TK20240615001',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TK20240615001',
      validFrom: '2024-06-10T10:00:00Z',
      validTo: '2024-07-10T23:59:59Z',
      used: false
    },
    createdAt: '2024-06-10T10:00:00Z'
  },
  {
    id: 'o2',
    orderNo: 'ORD20240616002',
    userId: 'u1',
    courseId: 'c2',
    amount: 199,
    status: 'paid',
    paymentMethod: 'wechat',
    paidAt: '2024-06-11T15:30:00Z',
    ticket: {
      id: 't2',
      orderId: 'o2',
      code: 'TK20240616002',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TK20240616002',
      validFrom: '2024-06-11T15:00:00Z',
      validTo: '2024-07-11T23:59:59Z',
      used: false
    },
    createdAt: '2024-06-11T15:00:00Z'
  },
  {
    id: 'o3',
    orderNo: 'ORD20240610003',
    userId: 'u1',
    courseId: 'c3',
    amount: 399,
    status: 'paid',
    paymentMethod: 'wechat',
    paidAt: '2024-06-05T10:30:00Z',
    ticket: {
      id: 't3',
      orderId: 'o3',
      code: 'TK20240610001',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TK20240610001',
      validFrom: '2024-06-05T10:00:00Z',
      validTo: '2024-07-05T23:59:59Z',
      used: true
    },
    createdAt: '2024-06-05T10:00:00Z'
  },
  {
    id: 'o4',
    orderNo: 'ORD20240608004',
    userId: 'u1',
    courseId: 'c4',
    amount: 499,
    status: 'paid',
    paymentMethod: 'wechat',
    paidAt: '2024-06-03T15:30:00Z',
    ticket: {
      id: 't4',
      orderId: 'o4',
      code: 'TK20240608001',
      qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TK20240608001',
      validFrom: '2024-06-03T15:00:00Z',
      validTo: '2024-07-03T23:59:59Z',
      used: true
    },
    createdAt: '2024-06-03T15:00:00Z'
  }
];
