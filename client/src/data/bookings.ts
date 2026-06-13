import { Course } from '@/types';

export const mockBookings: Course[] = [
  {
    id: 'c1',
    trainerId: '1',
    trainerName: '李训练师',
    trainerAvatar: 'https://picsum.photos/id/64/200/200',
    petId: '1',
    petName: '豆豆',
    type: 'one_on_one',
    mode: 'offline',
    status: 'upcoming',
    date: '2024-06-15',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    price: 399,
    location: '朝阳区建国路88号SOHO现代城',
    ticketCode: 'TK20240615001',
    ownerConfirmed: false,
    settled: false,
    createdAt: '2024-06-10T10:00:00Z'
  },
  {
    id: 'c2',
    trainerId: '2',
    trainerName: '王老师',
    trainerAvatar: 'https://picsum.photos/id/91/200/200',
    petId: '3',
    petName: '旺财',
    type: 'small_group',
    mode: 'online',
    status: 'paid',
    date: '2024-06-16',
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    price: 199,
    meetingUrl: 'https://meeting.example.com/room/123456',
    ticketCode: 'TK20240616002',
    ownerConfirmed: false,
    settled: false,
    createdAt: '2024-06-11T15:00:00Z'
  },
  {
    id: 'c3',
    trainerId: '1',
    trainerName: '李训练师',
    trainerAvatar: 'https://picsum.photos/id/64/200/200',
    petId: '1',
    petName: '豆豆',
    type: 'one_on_one',
    mode: 'offline',
    status: 'completed',
    date: '2024-06-10',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    price: 399,
    location: '朝阳区建国路88号SOHO现代城',
    ticketCode: 'TK20240610001',
    checkInTime: '2024-06-10T09:55:00Z',
    trainingRecord: {
      id: 'tr1',
      courseId: 'c3',
      trainerId: '1',
      content: '今天主要训练了随行和注意力集中。豆豆表现很好，已经能够在有干扰的情况下保持注意力约30秒。',
      achievements: ['随行时不拉扯牵引', '听到名字能迅速回应'],
      issues: ['看到其他狗狗还是会兴奋'],
      nextGoals: ['延长注意力时间到1分钟', '遇到其他狗狗时能保持冷静'],
      createdAt: '2024-06-10T11:30:00Z'
    },
    homework: {
      id: 'hw1',
      courseId: 'c3',
      tasks: [
        {
          id: 't1',
          description: '每天进行10分钟注意力训练，用零食奖励',
          frequency: '每天2次',
          duration: '10分钟',
          completed: true
        },
        {
          id: 't2',
          description: '出门时练习随行，遇到其他狗狗时做迂回练习',
          frequency: '每次出门',
          duration: '全程',
          completed: false
        }
      ],
      deadline: '2024-06-17T23:59:59Z',
      completed: true,
      completedAt: '2024-06-12T20:00:00Z'
    },
    ownerConfirmed: true,
    settled: true,
    createdAt: '2024-06-05T10:00:00Z'
  },
  {
    id: 'c4',
    trainerId: '3',
    trainerName: '张教练',
    trainerAvatar: 'https://picsum.photos/id/177/200/200',
    petId: '2',
    petName: '咪咪',
    type: 'one_on_one',
    mode: 'online',
    status: 'completed',
    date: '2024-06-08',
    startTime: '15:00',
    endTime: '16:00',
    duration: 60,
    price: 499,
    meetingUrl: 'https://meeting.example.com/room/789012',
    ticketCode: 'TK20240608001',
    checkInTime: '2024-06-08T14:58:00Z',
    trainingRecord: {
      id: 'tr2',
      courseId: 'c4',
      trainerId: '3',
      content: '评估了咪咪的分离焦虑情况，制定了渐进式独处训练计划。今天进行了第一步：主人离开房间1分钟。',
      achievements: ['咪咪能接受主人短暂离开', '没有出现过度应激反应'],
      issues: ['主人离开超过2分钟会开始不安'],
      nextGoals: ['逐步延长独处时间到5分钟', '建立离开-回来的正面联想'],
      createdAt: '2024-06-08T16:30:00Z'
    },
    homework: {
      id: 'hw2',
      courseId: 'c4',
      tasks: [
        {
          id: 't3',
          description: '每天进行5次离开-回来练习，从30秒开始',
          frequency: '每天5次',
          duration: '每次1-5分钟',
          completed: true
        },
        {
          id: 't4',
          description: '离开时给咪咪一个特殊的玩具，回来时收回',
          frequency: '每次练习',
          duration: '全程',
          completed: true
        }
      ],
      deadline: '2024-06-15T23:59:59Z',
      completed: true,
      completedAt: '2024-06-10T18:00:00Z'
    },
    ownerConfirmed: true,
    settled: true,
    createdAt: '2024-06-03T15:00:00Z'
  }
];
