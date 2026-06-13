export interface Course {
  id: string;
  trainerId: string;
  trainerName: string;
  trainerAvatar: string;
  petId: string;
  petName: string;
  type: CourseType;
  mode: CourseMode;
  status: CourseStatus;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  price: number;
  location?: string;
  meetingUrl?: string;
  ticketCode: string;
  orderId?: string;
  checkInTime?: string;
  trainingRecord?: TrainingRecord;
  homework?: Homework;
  ownerConfirmed: boolean;
  settled: boolean;
  createdAt: string;
}

export type CourseType = 'one_on_one' | 'small_group';
export type CourseMode = 'online' | 'offline';
export type CourseStatus = 'pending' | 'paid' | 'upcoming' | 'in_progress' | 'completed' | 'cancelled';

export const CourseTypeLabels: Record<CourseType, string> = {
  one_on_one: '一对一',
  small_group: '小班课程'
};

export const CourseModeLabels: Record<CourseMode, string> = {
  online: '线上视频',
  offline: '线下当面'
};

export const CourseStatusLabels: Record<CourseStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  upcoming: '即将开始',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消'
};

export interface TrainingRecord {
  id: string;
  courseId: string;
  trainerId: string;
  content: string;
  achievements: string[];
  issues: string[];
  nextGoals: string[];
  createdAt: string;
}

export interface Homework {
  id: string;
  courseId: string;
  tasks: HomeworkTask[];
  deadline: string;
  completed: boolean;
  completedAt?: string;
}

export interface HomeworkTask {
  id: string;
  description: string;
  frequency: string;
  duration: string;
  completed: boolean;
}
