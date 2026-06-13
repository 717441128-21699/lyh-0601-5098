import { BehaviorProblemType } from './pet';

export interface Trainer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  starRating: number;
  reviewCount: number;
  experienceYears: number;
  specialties: BehaviorProblemType[];
  certifications: string[];
  introduction: string;
  location: {
    city: string;
    district: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  distance?: number;
  pricePerHour: number;
  onlineAvailable: boolean;
  offlineAvailable: boolean;
  schedule: TrainerSchedule[];
  courseCount: number;
  successRate: number;
  satisfactionRate: number;
}

export interface TrainerSchedule {
  id: string;
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  courseType?: 'one_on_one' | 'small_group';
}

export interface TrainerReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  trainerId: string;
  rating: number;
  content: string;
  beforeVideo?: string;
  afterVideo?: string;
  createdAt: string;
  courseType: string;
  behaviorImproved: boolean;
}
