export interface User {
  id: string;
  nickname: string;
  avatar: string;
  phone: string;
  memberLevel: MemberLevel;
  memberPoints: number;
  totalCourses: number;
  totalSpent: number;
  memberUpgradeProgress: MemberUpgradeProgress;
  benefits: MemberBenefit[];
  location?: {
    city: string;
    district: string;
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

export type MemberLevel = 'normal' | 'silver' | 'gold';

export const MemberLevelLabels: Record<MemberLevel, string> = {
  normal: '普通会员',
  silver: '银卡会员',
  gold: '金卡会员'
};

export interface MemberUpgradeProgress {
  currentLevel: MemberLevel;
  nextLevel?: MemberLevel;
  coursesNeeded: number;
  coursesCompleted: number;
  amountNeeded: number;
  amountSpent: number;
  progressPercent: number;
}

export interface MemberBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

export interface EffectUpload {
  id: string;
  userId: string;
  courseId: string;
  trainerId: string;
  beforeVideo?: string;
  afterVideo?: string;
  description: string;
  rating: number;
  behaviorImproved: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalTrainers: number;
  totalCoursesToday: number;
  completionRate: number;
  satisfactionRate: number;
  behaviorImprovementRate: number;
  weeklyCourses: DailyStat[];
  topTrainers: TrainerStat[];
  recentBookings: BookingStat[];
}

export interface DailyStat {
  date: string;
  count: number;
}

export interface TrainerStat {
  id: string;
  name: string;
  avatar: string;
  coursesCount: number;
  rating: number;
  successRate: number;
}

export interface BookingStat {
  id: string;
  petName: string;
  trainerName: string;
  date: string;
  status: string;
}
