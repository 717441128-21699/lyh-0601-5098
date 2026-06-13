import { Pet } from '@/types';

export const mockPets: Pet[] = [
  {
    id: '1',
    name: '豆豆',
    breed: '金毛寻回犬',
    age: 2,
    ageUnit: 'year',
    gender: 'male',
    weight: 28,
    avatar: 'https://picsum.photos/id/237/200/200',
    behaviorProblems: [
      {
        id: 'bp1',
        type: 'pulling',
        severity: 'moderate',
        description: '出门时总是拉扯牵引绳，看到其他狗狗会兴奋地冲过去',
        duration: '6个月'
      },
      {
        id: 'bp2',
        type: 'jumping',
        severity: 'mild',
        description: '见到陌生人会扑上去打招呼',
        duration: '3个月'
      }
    ],
    description: '性格活泼，喜欢与人互动，但需要改善 leash 礼仪',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-20T14:30:00Z'
  },
  {
    id: '2',
    name: '咪咪',
    breed: '布偶猫',
    age: 1,
    ageUnit: 'year',
    gender: 'female',
    weight: 5,
    avatar: 'https://picsum.photos/id/659/200/200',
    behaviorProblems: [
      {
        id: 'bp3',
        type: 'anxiety',
        severity: 'severe',
        description: '主人出门后会过度叫，甚至出现破坏行为',
        duration: '2个月'
      }
    ],
    description: '平时很温顺，但分离焦虑问题严重',
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-03-15T11:20:00Z'
  },
  {
    id: '3',
    name: '旺财',
    breed: '柯基',
    age: 8,
    ageUnit: 'month',
    gender: 'male',
    weight: 10,
    avatar: 'https://picsum.photos/id/718/200/200',
    behaviorProblems: [
      {
        id: 'bp4',
        type: 'toilet_training',
        severity: 'moderate',
        description: '还不会定点上厕所，偶尔会在家乱拉',
        duration: '3个月'
      },
      {
        id: 'bp5',
        type: 'chewing',
        severity: 'mild',
        description: '喜欢咬家具和鞋子',
        duration: '1个月'
      }
    ],
    description: '幼犬，正在学习基本规矩',
    createdAt: '2024-01-20T15:00:00Z',
    updatedAt: '2024-03-10T09:45:00Z'
  }
];
