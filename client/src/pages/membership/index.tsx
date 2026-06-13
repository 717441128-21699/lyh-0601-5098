import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { User, MemberLevel, MemberBenefit, EffectUpload } from '@/types';
import { MemberLevelLabels } from '@/types/user';
import { useUserStore } from '@/store/useUserStore';
import { userApi, trainerApi } from '@/services/api';
import StarRating from '@/components/StarRating';
import Tag from '@/components/Tag';
import EmptyState from '@/components/EmptyState';

const levelIcons: Record<MemberLevel, string> = {
  normal: '🥉',
  silver: '🥈',
  gold: '🥇'
};

const allBenefits: MemberBenefit[] = [
  { id: '1', name: '专属客服', description: '一对一专属客服服务', icon: '👨‍💼', available: true },
  { id: '2', name: '会员折扣', description: '享受课程专属优惠', icon: '💰', available: true },
  { id: '3', name: '优先预约', description: '优先预约资深训导师', icon: '⏰', available: false },
  { id: '4', name: '免费复训', description: '每年2次免费复训机会', icon: '🔄', available: false },
  { id: '5', name: '生日礼包', description: '宠物生日专属礼包', icon: '🎁', available: false },
  { id: '6', name: '专属活动', description: '会员专属线下活动', icon: '🎉', available: false }
];

const comparisonItems = [
  { name: '课程折扣', normal: '无', silver: '9折', gold: '8.5折' },
  { name: '优先预约', normal: '✗', silver: '✓', gold: '✓' },
  { name: '免费复训', normal: '✗', silver: '✗', gold: '2次/年' },
  { name: '专属客服', normal: '✗', silver: '✓', gold: '✓' },
  { name: '积分加倍', normal: '1倍', silver: '1.5倍', gold: '2倍' },
  { name: '生日礼包', normal: '✗', silver: '✗', gold: '✓' }
];

const levelHistory = [
  { id: '1', icon: '🎊', title: '注册成为会员', desc: '欢迎加入宠物训导社区', date: '2024-01-15' },
  { id: '2', icon: '⬆️', title: '升级为银卡会员', desc: '累计完成10节课程', date: '2024-03-20' }
];

const MembershipPage: React.FC = () => {
  const userStore = useUserStore();
  const user = userStore.user;
  const [loading, setLoading] = useState(false);
  const [effects, setEffects] = useState<EffectUpload[]>([]);
  const [trainerMap, setTrainerMap] = useState<Record<string, any>>({});
  const [effectsLoading, setEffectsLoading] = useState(false);

  useEffect(() => {
    userStore.fetchUser();
    loadEffects();
  }, []);

  const loadEffects = async () => {
    setEffectsLoading(true);
    try {
      const list = await userApi.getMyEffects();
      setEffects(list);

      const trainerIds = [...new Set(list.map((e) => e.trainerId))];
      const map: Record<string, any> = {};
      for (const tid of trainerIds) {
        try {
          const trainer = await trainerApi.getTrainerDetail(tid);
          map[tid] = trainer;
        } catch (e) {
          console.error('[Membership] load trainer error:', tid, e);
        }
      }
      setTrainerMap(map);
    } catch (error) {
      console.error('[Membership] loadEffects error:', error);
    } finally {
      setEffectsLoading(false);
    }
  };

  const userBenefits = useMemo(() => {
    if (!user) return allBenefits.map(b => ({ ...b, available: false }));

    return allBenefits.map((benefit) => {
      let available = false;
      if (benefit.id === '1' || benefit.id === '2') {
        available = user.memberLevel !== 'normal';
      } else if (benefit.id === '3' || benefit.id === '4') {
        available = user.memberLevel === 'silver' || user.memberLevel === 'gold';
      } else if (benefit.id === '5' || benefit.id === '6') {
        available = user.memberLevel === 'gold';
      }
      return { ...benefit, available };
    });
  }, [user]);

  const getNextLevelText = () => {
    if (!user || !user.memberUpgradeProgress.nextLevel) {
      return '已达最高等级';
    }
    const progress = user.memberUpgradeProgress;
    const coursesNeeded = progress.coursesNeeded - progress.coursesCompleted;
    const amountNeeded = progress.amountNeeded - progress.amountSpent;

    if (coursesNeeded > 0 && amountNeeded > 0) {
      return `再完成 ${coursesNeeded} 节课程 或 消费 ¥${amountNeeded} 即可升级`;
    } else if (coursesNeeded > 0) {
      return `再完成 ${coursesNeeded} 节课程即可升级`;
    } else {
      return `再消费 ¥${amountNeeded} 即可升级`;
    }
  };

  const renderComparisonIcon = (value: string) => {
    if (value === '✓') {
      return <Text className={styles.checkIcon}>✓</Text>;
    } else if (value === '✗') {
      return <Text className={styles.crossIcon}>✗</Text>;
    }
    return <Text>{value}</Text>;
  };

  if (!user) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  const progress = user.memberUpgradeProgress;

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.memberHeader}>
          <View className={styles.memberCard}>
            <View className={styles.memberLevelRow}>
              <View className={styles.levelBadge}>
                <Text className={styles.levelIcon}>{levelIcons[user.memberLevel]}</Text>
                <Text>{MemberLevelLabels[user.memberLevel]}</Text>
              </View>
            </View>

            <View className={styles.pointsRow}>
              <View className={styles.pointsItem}>
                <Text className={styles.pointsValue}>{user.memberPoints}</Text>
                <Text className={styles.pointsLabel}>会员积分</Text>
              </View>
              <View className={styles.pointsItem}>
                <Text className={styles.pointsValue}>{user.totalCourses}</Text>
                <Text className={styles.pointsLabel}>累计课程</Text>
              </View>
              <View className={styles.pointsItem}>
                <Text className={styles.pointsValue}>¥{user.totalSpent}</Text>
                <Text className={styles.pointsLabel}>累计消费</Text>
              </View>
            </View>

            <View className={styles.upgradeProgress}>
              <View className={styles.upgradeInfo}>
                <Text className={styles.upgradeText}>
                  {progress.nextLevel
                    ? `升级${MemberLevelLabels[progress.nextLevel]}`
                    : '已达最高等级'
                  }
                </Text>
                <Text className={styles.upgradePercent}>{progress.progressPercent}%</Text>
              </View>
              <View className={styles.progressBar}>
                <View
                  className={styles.progressFill}
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </View>
              <Text className={styles.upgradeHint}>
                {progress.nextLevel && (
                  <>
                    {progress.coursesCompleted}/{progress.coursesNeeded} 节课程 ·
                    ¥{progress.amountSpent}/¥{progress.amountNeeded}
                    <br />
                    <Text className={styles.upgradeHintHighlight}>{getNextLevelText()}</Text>
                  </>
                )}
                {!progress.nextLevel && '恭喜您已成为最高等级会员！'}
              </Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🎁</Text>
            <Text>我的权益</Text>
          </View>
          <View className={styles.benefitsGrid}>
            {userBenefits.map((benefit) => (
              <View
                key={benefit.id}
                className={`
                  ${styles.benefitCard}
                  ${benefit.available ? styles.available : styles.unavailable}
                `}
              >
                <Text className={styles.benefitIcon}>{benefit.icon}</Text>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text className={styles.benefitName}>{benefit.name}</Text>
                  {!benefit.available && (
                    <Text className={styles.lockIcon}>🔒</Text>
                  )}
                </View>
                <Text className={styles.benefitDesc}>{benefit.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📊</Text>
            <Text>等级对比</Text>
          </View>
          <View className={styles.levelComparison}>
            <View className={styles.comparisonTable}>
              <View className={styles.tableHeader}>
                <View className={styles.tableCell}>权益</View>
                <View className={styles.tableCell}>普通会员</View>
                <View className={styles.tableCell}>银卡会员</View>
                <View className={styles.tableCell}>金卡会员</View>
              </View>
              {comparisonItems.map((item, index) => (
                <View key={index} className={styles.tableRow}>
                  <View className={styles.tableBodyCell}>{item.name}</View>
                  <View className={styles.tableBodyCell}>
                    {renderComparisonIcon(item.normal)}
                  </View>
                  <View className={styles.tableBodyCell}>
                    {renderComparisonIcon(item.silver)}
                  </View>
                  <View className={styles.tableBodyCell}>
                    {renderComparisonIcon(item.gold)}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📈</Text>
            <Text>成长记录</Text>
          </View>
          <View className={styles.historicalStats}>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{user.totalCourses}</Text>
              <Text className={styles.statLabel}>累计课程</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>¥{user.totalSpent}</Text>
              <Text className={styles.statLabel}>累计消费</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{user.memberPoints}</Text>
              <Text className={styles.statLabel}>会员积分</Text>
            </View>
          </View>

          <View className={styles.levelHistory}>
            {levelHistory.map((item) => (
              <View key={item.id} className={styles.historyItem}>
                <View className={styles.historyIcon}>
                  <Text>{item.icon}</Text>
                </View>
                <View className={styles.historyInfo}>
                  <Text className={styles.historyTitle}>{item.title}</Text>
                  <Text className={styles.historyDesc}>{item.desc}</Text>
                </View>
                <Text className={styles.historyDate}>{item.date}</Text>
              </View>
            ))}
          </View>

          {progress.nextLevel && (
            <View className={styles.upgradeTip}>
              <Text className={styles.upgradeTipIcon}>💡</Text>
              <Text className={styles.upgradeTipText}>
                小提示：上传训练效果视频可获得额外积分奖励，每完成1节课程可获得10-20积分，积分可用于兑换免费复训机会哦！
              </Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>⭐</Text>
            <Text>我的评价</Text>
            <Text className={styles.sectionSubTitle}>
              共 {effects.length} 条评价
            </Text>
          </View>

          {effectsLoading ? (
            <View className={styles.loadingSmall}>
              <Text>加载中...</Text>
            </View>
          ) : effects.length > 0 ? (
            <View className={styles.reviewList}>
              {effects.map((effect) => {
              const trainer = trainerMap[effect.trainerId];
              const pointsEarned = effect.rating >= 4 ? 100 : effect.rating >= 2 ? 50 : 20;
              return (
                <View
                  key={effect.id}
                  className={styles.reviewCard}
                  onClick={() => {
                    if (effect.trainerId && Taro.navigateTo({
                      url: `/pages/trainer-detail/index?id=${effect.trainerId}`
                    }));
                  }}
                >
                  <View className={styles.reviewHeader}>
                    <View className={styles.reviewTrainer}>
                      {trainer ? (
                        <>
                          <Image
                            className={styles.reviewTrainerAvatar}
                            src={trainer.avatar}
                            mode="aspectFill"
                          />
                          <View className={styles.reviewTrainerInfo}>
                            <Text className={styles.reviewTrainerName}>{trainer.name}</Text>
                            <Text className={styles.reviewTrainerSpec}>
                              {trainer.specialties?.slice(0, 2).join(' · ') || ''}
                            </Text>
                          </View>
                        </>
                      ) : (
                        <Text className={styles.reviewTrainerName}>训导师</Text>
                      )}
                    </View>
                    <View className={styles.reviewRatingRow}>
                      <StarRating
                        rating={effect.rating}
                        size="small"
                        showText={false}
                      />
                      <Tag
                        type="warning"
                        size="small"
                        text={`+${pointsEarned}积分"
                      />
                    </View>
                  </View>
                  <Text className={styles.reviewContent} numberOfLines={3}>
                    {effect.description}
                  </Text>
                  <View className={styles.reviewFooter}>
                    <Text className={styles.reviewDate}>
                      {new Date(effect.createdAt).toLocaleDateString('zh-CN')}
                    </Text>
                    {effect.behaviorImproved && (
                      <Tag
                        type="success"
                        size="small"
                        text="✓ 行为有改善"
                      />
                    )}
                  </View>
                </View>
              );
            })}
            </View>
          ) : (
            <EmptyState
              title="暂无评价"
              description="完成课程后上传训练效果，分享您的评价可以帮助其他主人选择合适的训导师"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MembershipPage;
