import { EffectUpload } from '@/types';

export const mockEffects: EffectUpload[] = [
  {
    id: 'e1',
    userId: 'u1',
    courseId: 'c3',
    trainerId: '1',
    beforeVideo: 'https://example.com/before1.mp4',
    afterVideo: 'https://example.com/after1.mp4',
    description: '豆豆现在不扑人了，能安稳坐下等待，太感谢李训练师了！',
    rating: 4.8,
    behaviorImproved: true,
    createdAt: '2024-06-11T16:00:00Z'
  },
  {
    id: 'e2',
    userId: 'u1',
    courseId: 'c4',
    trainerId: '2',
    beforeVideo: 'https://example.com/before2.mp4',
    afterVideo: 'https://example.com/after2.mp4',
    description: '旺财的分离焦虑有明显改善，在家不再乱叫了',
    rating: 4.5,
    behaviorImproved: true,
    createdAt: '2024-06-09T14:30:00Z'
  }
];
