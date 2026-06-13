const mockUser = {
  id: 'mock-user-id',
  name: '张小明',
  phone: '13800138000',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
  memberLevel: 'silver',
  memberPoints: 1280,
  totalCourses: 8,
  totalSpent: 1680,
  memberUpgradeProgress: {
    currentLevel: 'silver',
    nextLevel: 'gold',
    coursesNeeded: 20,
    coursesCompleted: 8,
    amountNeeded: 5000,
    amountSpent: 1680,
    progressPercent: 40
  }
};

const mockPets = [
  {
    id: 'pet-1',
    userId: 'mock-user-id',
    name: '豆豆',
    avatar: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
    breed: '金毛寻回犬',
    age: 2,
    gender: 'male',
    weight: 28,
    behaviorProblems: [
      {
        id: 'bp-1',
        type: 'obedience',
        severity: 'mild',
        duration: '3个月',
        description: '唤回反应慢，出门容易乱跑'
      },
      {
        id: 'bp-2',
        type: 'socialization',
        severity: 'moderate',
        duration: '2个月',
        description: '对陌生人警惕，偶尔会吠叫'
      }
    ],
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'pet-2',
    userId: 'mock-user-id',
    name: '咪咪',
    avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop',
    breed: '英国短毛猫',
    age: 1,
    gender: 'female',
    weight: 4.5,
    behaviorProblems: [
      {
        id: 'bp-3',
        type: 'anxiety',
        severity: 'severe',
        duration: '6个月',
        description: '分离焦虑严重，主人出门会乱抓家具'
      }
    ],
    createdAt: '2024-02-20T14:00:00Z'
  }
];

const mockTrainers = [
  {
    id: 'trainer-1',
    name: '李训犬师',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    title: '高级宠物训导师',
    starRating: 4.9,
    reviewCount: 128,
    experienceYears: 8,
    specialties: ['obedience', 'aggression', 'socialization'],
    certifications: ['CKU认证训犬师', '国家二级宠物驯导师'],
    location: '朝阳区宠物训练中心',
    pricePerHour: 398,
    onlineAvailable: true,
    offlineAvailable: true,
    courseCount: 156,
    successRate: 92,
    satisfactionRate: 98,
    schedule: [],
    reviews: [],
    bio: '专注犬只行为矫正8年，擅长解决攻击、分离焦虑等复杂行为问题',
    introduction: '国家二级宠物驯导师，CKU认证训犬师。曾服务超过500只宠物，成功率达92%。'
  },
  {
    id: 'trainer-2',
    name: '王老师',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    title: '猫咪行为专家',
    starRating: 4.8,
    reviewCount: 86,
    experienceYears: 6,
    specialties: ['anxiety', 'toilet_training', 'socialization'],
    certifications: ['国际猫咪行为协会认证', '宠物营养师'],
    location: '海淀区猫咪行为诊所',
    pricePerHour: 358,
    onlineAvailable: true,
    offlineAvailable: true,
    courseCount: 98,
    successRate: 89,
    satisfactionRate: 96,
    schedule: [],
    reviews: [],
    bio: '专攻猫咪行为学6年，尤其擅长猫咪分离焦虑和如厕问题矫正',
    introduction: '国际猫咪行为协会认证专家，帮助200+猫咪家庭解决行为问题。'
  },
  {
    id: 'trainer-3',
    name: '赵教官',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    title: '服从训练专家',
    starRating: 4.7,
    reviewCount: 95,
    experienceYears: 5,
    specialties: ['obedience', 'trick_training', 'socialization'],
    certifications: ['警犬训练基地认证', '宠物行为矫正师'],
    location: '丰台区训练基地',
    pricePerHour: 328,
    onlineAvailable: false,
    offlineAvailable: true,
    courseCount: 120,
    successRate: 95,
    satisfactionRate: 94,
    schedule: [],
    reviews: [],
    bio: '退役警犬训练员，专注服从训练和技能训练5年',
    introduction: '曾在警犬训练基地工作8年，退役后专注宠物训练领域。'
  },
  {
    id: 'trainer-4',
    name: '陈老师',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    title: '幼犬训练专家',
    starRating: 4.9,
    reviewCount: 112,
    experienceYears: 7,
    specialties: ['obedience', 'socialization', 'toilet_training'],
    certifications: ['美国KPA认证训犬师', '幼犬社会化专家'],
    location: '东城区宠物生活馆',
    pricePerHour: 368,
    onlineAvailable: true,
    offlineAvailable: true,
    courseCount: 145,
    successRate: 96,
    satisfactionRate: 99,
    schedule: [],
    reviews: [],
    bio: '专注幼犬社会化和基础训练7年，美国KPA认证训犬师',
    introduction: '美国KPA认证训犬师，擅长3-12月龄幼犬的社会化和基础训练。'
  },
  {
    id: 'trainer-5',
    name: '刘医生',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    title: '宠物行为医师',
    starRating: 4.6,
    reviewCount: 68,
    experienceYears: 10,
    specialties: ['anxiety', 'aggression', 'obedience'],
    certifications: ['兽医博士', '动物行为学硕士'],
    location: '西城区宠物医院',
    pricePerHour: 498,
    onlineAvailable: true,
    offlineAvailable: true,
    courseCount: 75,
    successRate: 88,
    satisfactionRate: 95,
    schedule: [],
    reviews: [],
    bio: '兽医博士+动物行为学硕士，从医学角度解决复杂行为问题',
    introduction: '动物行为学硕士，兽医博士，能够结合医学和行为学综合治疗。'
  },
  {
    id: 'trainer-6',
    name: '周教练',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    title: '技能训练专家',
    starRating: 4.8,
    reviewCount: 78,
    experienceYears: 4,
    specialties: ['trick_training', 'obedience', 'socialization'],
    certifications: ['飞盘狗训练认证', '敏捷训练指导手'],
    location: '通州区运动犬训练基地',
    pricePerHour: 318,
    onlineAvailable: false,
    offlineAvailable: true,
    courseCount: 89,
    successRate: 93,
    satisfactionRate: 97,
    schedule: [],
    reviews: [],
    bio: '专注宠物技能训练4年，飞盘狗训练认证教练',
    introduction: '飞盘狗训练认证教练，多次带领学员在国内比赛中获奖。'
  }
];

const mockBookings = [
  {
    id: 'course-1',
    userId: 'mock-user-id',
    trainerId: 'trainer-1',
    trainerName: '李训犬师',
    trainerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    petId: 'pet-1',
    petName: '豆豆',
    type: 'one_on_one',
    mode: 'offline',
    status: 'completed',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    duration: 60,
    price: 398,
    location: '朝阳区宠物训练中心',
    ticketCode: 'A1B2C3D4',
    checkInTime: '13:58',
    ownerConfirmed: true,
    settled: true,
    trainingRecord: {
      id: 'tr-1',
      courseId: 'course-1',
      trainerId: 'trainer-1',
      content: '今天主要训练了唤回和坐定延缓，豆豆的专注力有明显提升。',
      achievements: ['唤回成功率从50%提升到80%', '坐定延缓坚持了30秒'],
      issues: ['遇到其他狗狗时容易分心'],
      nextGoals: ['延长坐定延缓时间到1分钟', '带干扰下的唤回训练']
    },
    homework: {
      id: 'hw-1',
      courseId: 'course-1',
      tasks: [
        { id: '1', description: '每日唤回训练10分钟', frequency: '每天2次', duration: '10分钟', completed: true },
        { id: '2', description: '坐定延缓练习', frequency: '每天3次', duration: '5分钟', completed: false }
      ],
      deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: false
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'course-2',
    userId: 'mock-user-id',
    trainerId: 'trainer-2',
    trainerName: '王老师',
    trainerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    petId: 'pet-2',
    petName: '咪咪',
    type: 'one_on_one',
    mode: 'online',
    status: 'upcoming',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    price: 322,
    location: '',
    meetingUrl: 'https://meeting.example.com/xyz123',
    ticketCode: 'E5F6G7H8',
    ownerConfirmed: false,
    settled: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'course-3',
    userId: 'mock-user-id',
    trainerId: 'trainer-1',
    trainerName: '李训犬师',
    trainerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    petId: 'pet-1',
    petName: '豆豆',
    type: 'small_group',
    mode: 'offline',
    status: 'paid',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '15:00',
    endTime: '16:30',
    duration: 90,
    price: 279,
    location: '朝阳区宠物训练中心',
    ticketCode: 'I9J0K1L2',
    ownerConfirmed: false,
    settled: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'course-4',
    userId: 'mock-user-id',
    trainerId: 'trainer-4',
    trainerName: '陈老师',
    trainerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    petId: 'pet-1',
    petName: '豆豆',
    type: 'one_on_one',
    mode: 'offline',
    status: 'pending',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    duration: 60,
    price: 368,
    location: '东城区宠物生活馆',
    ownerConfirmed: false,
    settled: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'course-5',
    userId: 'mock-user-id',
    trainerId: 'trainer-3',
    trainerName: '赵教官',
    trainerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    petId: 'pet-1',
    petName: '豆豆',
    type: 'one_on_one',
    mode: 'offline',
    status: 'completed',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    price: 328,
    location: '丰台区训练基地',
    ticketCode: 'M3N4O5P6',
    checkInTime: '09:55',
    ownerConfirmed: true,
    settled: true,
    trainingRecord: {
      id: 'tr-2',
      courseId: 'course-5',
      trainerId: 'trainer-3',
      content: '基础服从训练，包括坐下、趴下、握手等动作。',
      achievements: ['学会握手动作', '趴下动作正确率100%'],
      issues: ['动作执行速度有待提高'],
      nextGoals: ['增加动作执行速度', '加入手势指令']
    },
    homework: {
      id: 'hw-2',
      courseId: 'course-5',
      tasks: [
        { id: '1', description: '复习基础服从动作', frequency: '每天2次', duration: '15分钟', completed: true }
      ],
      deadline: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completed: true
    },
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockOrders = [
  {
    id: 'order-1',
    orderNo: 'PT20240115ABC123',
    userId: 'mock-user-id',
    courseId: 'course-1',
    amount: 398,
    description: '1对1服从训练课程',
    status: 'paid',
    paymentMethod: 'wechat',
    transactionId: 'TXN1234567890',
    paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'order-2',
    orderNo: 'PT20240118DEF456',
    userId: 'mock-user-id',
    courseId: 'course-2',
    amount: 322,
    description: '线上猫咪行为咨询',
    status: 'paid',
    paymentMethod: 'alipay',
    transactionId: 'TXN0987654321',
    paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'order-3',
    orderNo: 'PT20240119GHI789',
    userId: 'mock-user-id',
    courseId: 'course-3',
    amount: 279,
    description: '小班社会化课程',
    status: 'paid',
    paymentMethod: 'wechat',
    transactionId: 'TXN1122334455',
    paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockReviews = [
  {
    id: 'review-1',
    trainerId: 'trainer-1',
    userId: 'user-1',
    userName: '王先生',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    content: '李老师非常专业，我家狗狗的攻击行为有了明显改善。',
    beforeVideo: '',
    afterVideo: '',
    behaviorImproved: true,
    courseType: 'one_on_one',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review-2',
    trainerId: 'trainer-1',
    userId: 'user-2',
    userName: '李女士',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    rating: 4,
    content: '训练效果不错，就是狗狗有时候还是会分心。',
    beforeVideo: '',
    afterVideo: '',
    behaviorImproved: true,
    courseType: 'one_on_one',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'review-3',
    trainerId: 'trainer-2',
    userId: 'user-3',
    userName: '张小姐',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    rating: 5,
    content: '王老师对猫咪行为的分析非常到位，按照她的方法，我家猫咪的分离焦虑好多了！',
    beforeVideo: '',
    afterVideo: '',
    behaviorImproved: true,
    courseType: 'online',
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockEffectUploads = [
  {
    id: 'effect-1',
    userId: 'mock-user-id',
    courseId: 'course-1',
    trainerId: 'trainer-1',
    beforeVideo: '',
    afterVideo: '',
    description: '豆豆的唤回反应明显变快了，出门也不乱跑了！',
    rating: 5,
    behaviorImproved: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

module.exports = {
  mockUser,
  mockPets,
  mockTrainers,
  mockBookings,
  mockOrders,
  mockReviews,
  mockEffectUploads
};
