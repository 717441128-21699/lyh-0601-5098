export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  ageUnit: 'month' | 'year';
  gender: 'male' | 'female';
  weight?: number;
  avatar: string;
  behaviorProblems: BehaviorProblem[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface BehaviorProblem {
  id: string;
  type: BehaviorProblemType;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  duration: string;
}

export type BehaviorProblemType =
  | 'aggression'
  | 'anxiety'
  | 'barking'
  | 'chewing'
  | 'digging'
  | 'jumping'
  | 'pulling'
  | 'separation_anxiety'
  | 'toilet_training'
  | 'socialization'
  | 'obedience'
  | 'other';

export const BehaviorProblemTypeLabels: Record<BehaviorProblemType, string> = {
  aggression: '攻击行为',
  anxiety: '焦虑',
  barking: '过度吠叫',
  chewing: '乱咬东西',
  digging: '乱挖',
  jumping: '扑人',
  pulling: '拉扯牵引',
  separation_anxiety: '分离焦虑',
  toilet_training: '如厕训练',
  socialization: '社交问题',
  obedience: '服从性差',
  other: '其他'
};
