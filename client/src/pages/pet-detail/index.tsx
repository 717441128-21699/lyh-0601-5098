import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { Pet, BehaviorProblemTypeLabels, BehaviorProblem } from '@/types';
import Tag from '@/components/Tag';
import { petApi } from '@/services/api';
import { mockPets } from '@/data';

const PetDetailPage: React.FC = () => {
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = router.params.id;
    if (id) {
      loadPet(id);
    }
  }, [router.params.id]);

  const loadPet = async (id: string) => {
    setLoading(true);
    try {
      const result = await petApi.getPetById(id);
      setPet(result);
    } catch (error) {
      console.error('[PetDetailPage] loadPet error:', error);
      const fallback = mockPets.find((p) => p.id === id);
      if (fallback) setPet(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    Taro.navigateTo({
      url: `/pages/pet-add/index?id=${pet?.id}`
    });
  };

  const handleDelete = async () => {
    if (!pet) return;
    try {
      await Taro.showModal({
        title: '确认删除',
        content: `确定要删除宠物"${pet.name}"的档案吗？`,
        success: async (res) => {
          if (res.confirm) {
            await petApi.deletePet(pet.id);
            Taro.showToast({ title: '删除成功', icon: 'success' });
            Taro.navigateBack();
          }
        }
      });
    } catch (error) {
      console.error('[PetDetailPage] handleDelete error:', error);
    }
  };

  const handleBookTrainer = () => {
    Taro.switchTab({ url: '/pages/trainers/index' });
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'severe':
        return { text: '严重', type: 'error' };
      case 'moderate':
        return { text: '中等', type: 'warning' };
      default:
        return { text: '轻微', type: 'default' };
    }
  };

  if (loading) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!pet) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>宠物不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.petHeader}>
        <Image
          className={styles.avatar}
          src={pet.avatar}
          mode="aspectFill"
          onError={(e) => {
            console.error('[PetDetailPage] Avatar error:', e.detail);
          }}
        />
        <View className={styles.petInfo}>
          <Text className={styles.name}>{pet.name}</Text>
          <Text className={styles.breed}>{pet.breed}</Text>
          <View className={styles.metaRow}>
            <Text className={styles.metaItem}>
              {pet.age}{pet.ageUnit === 'year' ? '岁' : '个月'}
            </Text>
            <Text className={styles.metaItem}>
              {pet.gender === 'male' ? '♂ 公' : '♀ 母'}
            </Text>
            {pet.weight && (
              <Text className={styles.metaItem}>{pet.weight}kg</Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📋 基本信息</Text>
        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>品种</Text>
            <Text className={styles.infoValue}>{pet.breed}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>年龄</Text>
            <Text className={styles.infoValue}>
              {pet.age} {pet.ageUnit === 'year' ? '岁' : '个月'}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>性别</Text>
            <Text className={styles.infoValue}>
              {pet.gender === 'male' ? '公' : '母'}
            </Text>
          </View>
          {pet.weight && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>体重</Text>
              <Text className={styles.infoValue}>{pet.weight} kg</Text>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>建档时间</Text>
            <Text className={styles.infoValue}>
              {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString() : '-'}
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>⚠️ 行为问题</Text>
        {pet.behaviorProblems.length > 0 ? (
          pet.behaviorProblems.map((problem: BehaviorProblem) => {
            const severity = getSeverityLabel(problem.severity);
            return (
              <View key={problem.id} className={styles.problemCard}>
                <View className={styles.problemHeader}>
                  <Text className={styles.problemType}>
                    {BehaviorProblemTypeLabels[problem.type]}
                  </Text>
                  <Tag text={severity.text} type={severity.type as any} />
                </View>
                <Text className={styles.problemDesc}>{problem.description}</Text>
                <View className={styles.problemMeta}>
                  <Text className={styles.problemMetaItem}>
                    持续时间：{problem.duration}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className={styles.infoCard}>
            <Text className={styles.descText}>暂无行为问题记录</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📝 备注说明</Text>
        <View className={styles.descCard}>
          <Text className={styles.descText}>
            {pet.description || '暂无备注信息'}
          </Text>
        </View>
      </View>

      <View className={styles.actionBar}>
        <Button className={`${styles.actionBtn} ${styles.secondary}`} onClick={handleDelete}>
          删除档案
        </Button>
        <Button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleEdit}>
          编辑档案
        </Button>
      </View>
    </ScrollView>
  );
};

export default PetDetailPage;
