import { Trainer, TrainerReview } from '@/types';

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 18; hour++) {
    slots.push({
      id: `slot-${hour}`,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      available: Math.random() > 0.3,
      courseType: Math.random() > 0.5 ? 'one_on_one' : 'small_group'
    });
  }
  return slots;
};

export const mockTrainers: Trainer[] = [
  {
    id: '1',
    name: '李训练师',
    avatar: 'https://picsum.photos/id/64/200/200',
    title: '高级宠物行为训导师',
    starRating: 4.9,
    reviewCount: 156,
    experienceYears: 8,
    specialties: ['aggression', 'anxiety', 'separation_anxiety'],
    certifications: ['国际认证训犬师（CCBC）', '国家二级宠物营养师'],
    introduction: '专注宠物行为矫正8年，擅长处理焦虑、攻击等复杂行为问题。已成功帮助500+家庭改善宠物行为。',
    location: {
      city: '北京',
      district: '朝阳区',
      address: '建国路88号SOHO现代城',
      latitude: 39.9042,
      longitude: 116.4074
    },
    distance: 2.5,
    pricePerHour: 399,
    onlineAvailable: true,
    offlineAvailable: true,
    schedule: [
      { id: 's1', date: '2024-06-15', timeSlots: generateTimeSlots() },
      { id: 's2', date: '2024-06-16', timeSlots: generateTimeSlots() },
      { id: 's3', date: '2024-06-17', timeSlots: generateTimeSlots() }
    ],
    courseCount: 328,
    successRate: 95,
    satisfactionRate: 98
  },
  {
    id: '2',
    name: '王老师',
    avatar: 'https://picsum.photos/id/91/200/200',
    title: '资深幼犬训导师',
    starRating: 4.8,
    reviewCount: 128,
    experienceYears: 5,
    specialties: ['toilet_training', 'socialization', 'obedience', 'chewing'],
    certifications: ['AKC训犬师认证', '幼犬行为专家'],
    introduction: '专注幼犬训练5年，擅长如厕训练、社会化训练和基础服从。让您的爱宠从小养成好习惯。',
    location: {
      city: '北京',
      district: '海淀区',
      address: '中关村大街1号',
      latitude: 39.9842,
      longitude: 116.3074
    },
    distance: 5.8,
    pricePerHour: 299,
    onlineAvailable: true,
    offlineAvailable: true,
    schedule: [
      { id: 's4', date: '2024-06-15', timeSlots: generateTimeSlots() },
      { id: 's5', date: '2024-06-16', timeSlots: generateTimeSlots() }
    ],
    courseCount: 256,
    successRate: 92,
    satisfactionRate: 96
  },
  {
    id: '3',
    name: '张教练',
    avatar: 'https://picsum.photos/id/177/200/200',
    title: '宠物行为治疗师',
    starRating: 4.95,
    reviewCount: 203,
    experienceYears: 12,
    specialties: ['aggression', 'anxiety', 'barking', 'separation_anxiety'],
    certifications: ['动物行为学硕士', '国际动物行为咨询师（IAABC）'],
    introduction: '12年宠物行为治疗经验，擅长处理严重攻击、恐惧焦虑等疑难杂症。科学训练，拒绝暴力。',
    location: {
      city: '北京',
      district: '西城区',
      address: '金融街15号',
      latitude: 39.9142,
      longitude: 116.3674
    },
    distance: 3.2,
    pricePerHour: 499,
    onlineAvailable: true,
    offlineAvailable: false,
    schedule: [
      { id: 's6', date: '2024-06-15', timeSlots: generateTimeSlots() },
      { id: 's7', date: '2024-06-16', timeSlots: generateTimeSlots() }
    ],
    courseCount: 412,
    successRate: 97,
    satisfactionRate: 99
  },
  {
    id: '4',
    name: '陈训导师',
    avatar: 'https://picsum.photos/id/338/200/200',
    title: '猫咪行为专家',
    starRating: 4.7,
    reviewCount: 89,
    experienceYears: 6,
    specialties: ['anxiety', 'barking', 'toilet_training', 'socialization'],
    certifications: ['国际猫咪行为咨询师', '猫咪健康护理师'],
    introduction: '专注猫咪行为研究6年，精通猫咪心理和行为矫正。解决猫咪乱尿、攻击、过度叫等问题。',
    location: {
      city: '北京',
      district: '东城区',
      address: '东直门外大街',
      latitude: 39.9442,
      longitude: 116.4374
    },
    distance: 4.1,
    pricePerHour: 349,
    onlineAvailable: true,
    offlineAvailable: true,
    schedule: [
      { id: 's8', date: '2024-06-15', timeSlots: generateTimeSlots() }
    ],
    courseCount: 178,
    successRate: 90,
    satisfactionRate: 95
  },
  {
    id: '5',
    name: '刘指导',
    avatar: 'https://picsum.photos/id/1027/200/200',
    title: '家庭犬只行为顾问',
    starRating: 4.85,
    reviewCount: 167,
    experienceYears: 7,
    specialties: ['jumping', 'pulling', 'obedience', 'digging'],
    certifications: ['家庭犬训练师认证', '宠物急救认证'],
    introduction: '擅长家庭伴侣犬行为塑造，专注解决扑人、拉扯、乱挖等常见问题，让爱宠更好地融入家庭。',
    location: {
      city: '北京',
      district: '丰台区',
      address: '丽泽商务区',
      latitude: 39.8542,
      longitude: 116.3474
    },
    distance: 7.3,
    pricePerHour: 279,
    onlineAvailable: false,
    offlineAvailable: true,
    schedule: [
      { id: 's9', date: '2024-06-15', timeSlots: generateTimeSlots() },
      { id: 's10', date: '2024-06-16', timeSlots: generateTimeSlots() }
    ],
    courseCount: 289,
    successRate: 93,
    satisfactionRate: 97
  }
];

export const mockTrainerReviews: TrainerReview[] = [
  {
    id: 'r1',
    userId: 'u1',
    userName: '张女士',
    userAvatar: 'https://picsum.photos/id/64/100/100',
    trainerId: '1',
    rating: 5,
    content: '李训练师非常专业，我家狗狗的分离焦虑问题改善了很多。之前我一出门它就叫个不停，现在已经能安静地等待我回来了。',
    createdAt: '2024-05-20T10:00:00Z',
    courseType: '一对一课程',
    behaviorImproved: true
  },
  {
    id: 'r2',
    userId: 'u2',
    userName: '王先生',
    userAvatar: 'https://picsum.photos/id/91/100/100',
    trainerId: '1',
    rating: 5,
    content: '李老师的方法很科学，不打骂，完全用正强化训练。我们家的金毛现在出门再也不拉扯牵引了。',
    createdAt: '2024-05-15T14:30:00Z',
    courseType: '小班课程',
    behaviorImproved: true
  },
  {
    id: 'r3',
    userId: 'u3',
    userName: '李女士',
    userAvatar: 'https://picsum.photos/id/177/100/100',
    trainerId: '2',
    rating: 4,
    content: '王老师很有耐心，教了我们很多幼犬训练的实用技巧。虽然还有些小问题，但整体改善很明显。',
    createdAt: '2024-05-10T09:00:00Z',
    courseType: '一对一课程',
    behaviorImproved: true
  }
];
