import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Input,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { Trainer, BehaviorProblemType, BehaviorProblemTypeLabels } from '@/types';
import TrainerCard from '@/components/TrainerCard';
import EmptyState from '@/components/EmptyState';
import { trainerApi } from '@/services/api';

const behaviorTypes: (BehaviorProblemType | 'all')[] = [
  'all',
  'aggression',
  'anxiety',
  'barking',
  'chewing',
  'toilet_training',
  'socialization',
  'obedience',
  'separation_anxiety'
];

const sortOptions = [
  { key: 'rating', label: '评分最高' },
  { key: 'distance', label: '距离最近' },
  { key: 'price', label: '价格最低' }
];

const TrainersPage: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<BehaviorProblemType | 'all'>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | 'online' | 'offline'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'price'>('rating');

  useEffect(() => {
    loadTrainers();
  }, [selectedSpecialty, selectedMode, sortBy]);

  useDidShow(() => {
    loadTrainers();
  });

  usePullDownRefresh(() => {
    loadTrainers();
    Taro.stopPullDownRefresh();
  });

  const loadTrainers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        specialty: selectedSpecialty === 'all' ? undefined : selectedSpecialty,
        mode: selectedMode === 'all' ? undefined : selectedMode,
        sortBy
      };
      const result = await trainerApi.getTrainers(params);
      let filtered = result;
      if (searchText) {
        filtered = result.filter(
          (t) =>
            t.name.includes(searchText) ||
            t.title.includes(searchText)
        );
      }
      setTrainers(filtered);
    } catch (error) {
      console.error('[TrainersPage] loadTrainers error:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedSpecialty, selectedMode, sortBy, searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadTrainers();
  };

  return (
    <View className={styles.page}>
      <View className={styles.searchBar}>
        <View className={styles.searchInput}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.input}
            placeholder="搜索训导师"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            onConfirm={(e) => handleSearch(e.detail.value)}
          />
        </View>
      </View>

      <View className={styles.modeFilter}>
        <View
          className={`${styles.modeTab} ${selectedMode === 'all' ? styles.active : ''}`}
          onClick={() => setSelectedMode('all')}
        >
          <Text className={styles.modeText}>全部</Text>
        </View>
        <View
          className={`${styles.modeTab} ${selectedMode === 'online' ? styles.active : ''}`}
          onClick={() => setSelectedMode('online')}
        >
          <Text className={styles.modeText}>线上视频</Text>
        </View>
        <View
          className={`${styles.modeTab} ${selectedMode === 'offline' ? styles.active : ''}`}
          onClick={() => setSelectedMode('offline')}
        >
          <Text className={styles.modeText}>线下当面</Text>
        </View>
      </View>

      <ScrollView className={styles.filterBar} scrollX>
        {behaviorTypes.map((type) => (
          <View
            key={type}
            className={`${styles.filterItem} ${selectedSpecialty === type ? styles.active : ''}`}
            onClick={() => setSelectedSpecialty(type)}
          >
            <Text className={styles.filterText}>
              {type === 'all' ? '全部' : BehaviorProblemTypeLabels[type]}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.sortBar}>
        {sortOptions.map((option) => (
          <View
            key={option.key}
            className={`${styles.sortItem} ${sortBy === option.key ? styles.active : ''}`}
            onClick={() => setSortBy(option.key as any)}
          >
            <Text className={styles.sortText}>{option.label}</Text>
            {sortBy === option.key && (
              <Text className={styles.sortArrow}>↓</Text>
            )}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.trainerList}>
        {loading ? (
          <View className={styles.loading}>
            <Text>加载中...</Text>
          </View>
        ) : trainers.length > 0 ? (
          <>
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </>
        ) : (
          <EmptyState
            title="暂无符合条件的训导师"
            description="试试调整筛选条件"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default TrainersPage;
