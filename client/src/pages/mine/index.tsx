import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { User, Pet, MemberLevelLabels } from '@/types';
import PetCard from '@/components/PetCard';
import EmptyState from '@/components/EmptyState';
import { useUserStore } from '@/store/useUserStore';
import { mockPets } from '@/data';

const MinePage: React.FC = () => {
  const { user, pets, fetchUser, fetchPets, loading } = useUserStore();
  const [displayPets, setDisplayPets] = useState<Pet[]>([]);

  useEffect(() => {
    initData();
  }, []);

  useDidShow(() => {
    initData();
  });

  usePullDownRefresh(() => {
    initData();
    Taro.stopPullDownRefresh();
  });

  const initData = async () => {
    await Promise.all([fetchUser(), fetchPets()]);
  };

  useEffect(() => {
    setDisplayPets(pets.length > 0 ? pets : mockPets);
  }, [pets]);

  const handleEditPet = (pet: Pet) => {
    Taro.navigateTo({
      url: `/pages/pet-detail/index?id=${pet.id}`
    });
  };

  const handleAddPet = () => {
    Taro.navigateTo({ url: '/pages/pet-add/index' });
  };

  const menuItems = [
    {
      icon: '⭐',
      title: '会员中心',
      desc: '查看会员权益和升级进度',
      url: '/pages/membership/index'
    },
    {
      icon: '�',
      title: '订单中心',
      desc: '查看所有课程订单和票据',
      url: '/pages/orders/index'
    },
    {
      icon: '�📅',
      title: '我的预约',
      desc: '查看和管理课程预约',
      url: '/pages/booking/index'
    },
    {
      icon: '📊',
      title: '管理看板',
      desc: '查看训导师排班和数据统计',
      url: '/pages/dashboard/index'
    },
    {
      icon: '⚙️',
      title: '设置',
      desc: '应用设置和帮助中心',
      url: ''
    }
  ];

  const getMemberColor = (level: string) => {
    switch (level) {
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      default:
        return '🐾';
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image
            className={styles.avatar}
            src={user?.avatar || 'https://picsum.photos/id/64/200/200'}
            mode="aspectFill"
            onError={(e) => {
              console.error('[MinePage] Avatar error:', e.detail);
            }}
          />
          <View className={styles.userDetail}>
            <Text className={styles.nickname}>
              {user?.nickname || '爱宠达人'}
            </Text>
            <View className={styles.memberBadge}>
              <Text className={styles.memberIcon}>
                {getMemberColor(user?.memberLevel || 'normal')}
              </Text>
              <Text className={styles.memberText}>
                {MemberLevelLabels[user?.memberLevel || 'normal']}
              </Text>
            </View>
          </View>
        </View>
        <View className={styles.pointsRow}>
          <View className={styles.pointItem}>
            <Text className={styles.pointValue}>{user?.memberPoints || 0}</Text>
            <Text className={styles.pointLabel}>积分</Text>
          </View>
          <View className={styles.pointItem}>
            <Text className={styles.pointValue}>{user?.totalCourses || 0}</Text>
            <Text className={styles.pointLabel}>已上课程</Text>
          </View>
          <View className={styles.pointItem}>
            <Text className={styles.pointValue}>¥{user?.totalSpent || 0}</Text>
            <Text className={styles.pointLabel}>累计消费</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{displayPets.length}</Text>
          <Text className={styles.statLabel}>宠物档案</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>
            {user?.memberUpgradeProgress?.progressPercent || 0}%
          </Text>
          <Text className={styles.statLabel}>升级进度</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>
            {user?.benefits?.filter((b) => b.available).length || 0}
          </Text>
          <Text className={styles.statLabel}>可用权益</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.petHeader}>
          <Text className={styles.sectionTitle}>我的宠物</Text>
          <Button className={styles.addPetBtn} onClick={handleAddPet}>
            <Text>+ 添加宠物</Text>
          </Button>
        </View>
        {loading ? (
          <View className={styles.loading}>
            <Text>加载中...</Text>
          </View>
        ) : displayPets.length > 0 ? (
          <View className={styles.petList}>
            {displayPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} onEdit={handleEditPet} />
            ))}
          </View>
        ) : (
          <EmptyState
            title="暂无宠物档案"
            description="添加宠物档案，开始专业训导之旅"
            actionText="添加宠物"
            onAction={handleAddPet}
          />
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>常用功能</Text>
        <View className={styles.menuList}>
          {menuItems.map((item, index) => (
            <View
              key={index}
              className={styles.menuItem}
              onClick={() => {
                if (item.url) {
                  if (item.url.startsWith('/pages/booking') || item.url.startsWith('/pages/trainers')) {
                    Taro.switchTab({ url: item.url });
                  } else {
                    Taro.navigateTo({ url: item.url });
                  }
                } else {
                  Taro.showToast({ title: '功能开发中', icon: 'none' });
                }
              }}
            >
              <View className={styles.menuIcon}>
                <Text>{item.icon}</Text>
              </View>
              <View className={styles.menuContent}>
                <Text className={styles.menuTitle}>{item.title}</Text>
                <Text className={styles.menuDesc}>{item.desc}</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
