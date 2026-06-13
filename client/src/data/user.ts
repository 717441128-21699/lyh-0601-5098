import { User, DashboardStats } from '@/types';

export const mockUser: User = {
  id: 'u1',
  nickname: '爱宠达人',
  avatar: 'https://picsum.photos/id/64/200/200',
  phone: '138****8888',
  memberLevel: 'silver',
  memberPoints: 2580,
  totalCourses: 8,
  totalSpent: 3192,
  memberUpgradeProgress: {
    currentLevel: 'silver',
    nextLevel: 'gold',
    coursesNeeded: 20,
    coursesCompleted: 8,
    amountNeeded: 8000,
    amountSpent: 3192,
    progressPercent: 40
  },
  benefits: [
    { id: 'b1', name: '优先预约', description: '优先预约资深训导师', icon: '⭐', available: true },
    { id: 'b2', name: '免费复训', description: '课程效果不佳可免费复训', icon: '🔄', available: true },
    { id: 'b3', name: '专属客服', description: '1对1专属客服服务', icon: '👤', available: false },
    { id: 'b4', name: '生日福利', description: '生日当月课程8折', icon: '🎂', available: true }
  ],
  location: {
    city: '北京',
    district: '朝阳区',
    latitude: 39.9042,
    longitude: 116.4074
  },
  createdAt: '2023-12-01T10:00:00Z'
};

export const mockDashboardStats: DashboardStats = {
  totalTrainers: 25,
  totalCoursesToday: 18,
  completionRate: 92,
  satisfactionRate: 96,
  behaviorImprovementRate: 89,
  weeklyCourses: [
    { date: '周一', count: 15 },
    { date: '周二', count: 18 },
    { date: '周三', count: 22 },
    { date: '周四', count: 16 },
    { date: '周五', count: 20 },
    { date: '周六', count: 28 },
    { date: '周日', count: 24 }
  ],
  topTrainers: [
    { id: '1', name: '李训练师', avatar: 'https://picsum.photos/id/64/100/100', coursesCount: 32, rating: 4.9, successRate: 95 },
    { id: '3', name: '张教练', avatar: 'https://picsum.photos/id/177/100/100', coursesCount: 28, rating: 4.95, successRate: 97 },
    { id: '2', name: '王老师', avatar: 'https://picsum.photos/id/91/100/100', coursesCount: 24, rating: 4.8, successRate: 92 }
  ],
  recentBookings: [
    { id: 'c1', petName: '豆豆', trainerName: '李训练师', date: '2024-06-15 10:00', status: '即将开始' },
    { id: 'c2', petName: '旺财', trainerName: '王老师', date: '2024-06-16 14:00', status: '已支付' },
    { id: 'c3', petName: '豆豆', trainerName: '李训练师', date: '2024-06-10 10:00', status: '已完成' }
  ]
};
