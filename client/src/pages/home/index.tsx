import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  Image,
  Swiper,
  SwiperItem,
  Input
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { Trainer, Pet } from '@/types';
import { BehaviorProblemTypeLabels } from '@/types';
import TrainerCard from '@/components/TrainerCard';
import EmptyState from '@/components/EmptyState';
import { trainerApi } from '@/services/api';
import { useUserStore } from '@/store/useUserStore';
import { mockPets } from '@/data';

const HomePage: React.FC = () => {
  const [recommendedTrainers, setRecommendedTrainers] = useState<Trainer[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);
  const { fetchUser, fetchPets, pets } = useUserStore();

  useEffect(() => {
    initData();
  }, []);

  useDidShow(() => {
    if (selectedPet) {
      loadRecommendations(selectedPet.id);
    }
    fetchUser();
    fetchPets();
  });

  usePullDownRefresh(() => {
    initData();
    Taro.stopPullDownRefresh();
  });

  const initData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUser(), fetchPets()]);
      const allPets = pets.length > 0 ? pets : mockPets;
      if (allPets.length > 0 && !selectedPet) {
        setSelectedPet(allPets[0]);
        await loadRecommendations(allPets[0].id);
      }
    } catch (error) {
      console.error('[HomePage] initData error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = useCallback(async (petId: string) => {
    try {
      const trainers = await trainerApi.getRecommendedTrainers(petId);
      setRecommendedTrainers(trainers);
    } catch (error) {
      console.error('[HomePage] loadRecommendations error:', error);
    }
  }, []);

  const handlePetSelect = async (pet: Pet) => {
    setSelectedPet(pet);
    await loadRecommendations(pet.id);
  };

  const quickActions = [
    { icon: '🐕', text: '添加宠物', url: '/pages/pet-add/index' },
    { icon: '📅', text: '我的预约', url: '/pages/booking/index' },
    { icon: '⭐', text: '会员中心', url: '/pages/membership/index' },
    { icon: '📊', text: '管理看板', url: '/pages/dashboard/index' }
  ];

  const tips = [
    { icon: '💡', text: '训练要循序渐进，每次10-15分钟效果最佳' },
    { icon: '🎯', text: '正强化训练：做对了立即奖励零食或表扬' },
    { icon: '⏰', text: '每天坚持训练，比一次长时间训练更有效' }
  ];

  const displayPets = pets.length > 0 ? pets : mockPets;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.banner}>
        <View className={styles.bannerCard}>
          <Text className={styles.bannerTitle}>专业宠物训导</Text>
          <Text className={styles.bannerSubtitle}>
            科学训练，让爱宠更懂你
          </Text>
          <Button
            className={styles.bannerBtn}
            onClick={() => Taro.navigateTo({ url: '/pages/pet-add/index' })}
          >
            立即添加宠物
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.quickActions}>
          {quickActions.map((action, index) => (
            <View
              key={index}
              className={styles.actionItem}
              onClick={() => Taro.navigateTo({ url: action.url })}
            >
              <View className={styles.actionIcon}>
                <Text>{action.icon}</Text>
              </View>
              <Text className={styles.actionText}>{action.text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitleRow}>
          <Text className={styles.sectionMainTitle}>智能推荐训导师</Text>
          <Text className={styles.sectionSubtitle}>
            根据宠物行为问题精准匹配
          </Text>
        </View>

        {displayPets.length > 0 && (
          <ScrollView className={styles.petSelector} scrollX>
            {displayPets.map((pet) => (
              <View
                key={pet.id}
                className={`${styles.petOption} ${
                  selectedPet?.id === pet.id ? styles.selected : ''
                }`}
                onClick={() => handlePetSelect(pet)}
              >
                <Image
                  className={styles.petOptionAvatar}
                  src={pet.avatar}
                  mode="aspectFill"
                  onError={(e) => {
                    console.error('[HomePage] Pet avatar error:', e.detail);
                  }}
                />
                <Text className={styles.petOptionName}>{pet.name}</Text>
                <Text className={styles.petOptionProblem}>
                  {pet.behaviorProblems.length > 0
                    ? BehaviorProblemTypeLabels[pet.behaviorProblems[0].type]
                    : '暂无问题'}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        {loading ? (
          <View className={styles.loading}>
            <Text>正在为您匹配最佳训导师...</Text>
          </View>
        ) : recommendedTrainers.length > 0 ? (
          <View className={styles.recommendList}>
            {recommendedTrainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </View>
        ) : (
          <EmptyState
            title="暂无推荐训导师"
            description="请先添加宠物档案，系统将为您智能匹配"
            actionText="添加宠物"
            onAction={() => Taro.navigateTo({ url: '/pages/pet-add/index' })}
          />
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>训导小贴士</Text>
        </View>
        <View className={styles.tipsSection}>
          {tips.map((tip, index) => (
            <View key={index} className={styles.tipItem}>
              <Text className={styles.tipIcon}>{tip.icon}</Text>
              <View className={styles.tipContent}>
                <Text className={styles.tipText}>{tip.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
