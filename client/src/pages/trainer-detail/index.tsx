import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView
} from '@tarojs/components';
import Taro, { useRouter, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { Trainer, TrainerReview, TimeSlot } from '@/types';
import { BehaviorProblemTypeLabels } from '@/types/pet';
import StarRating from '@/components/StarRating';
import { trainerApi } from '@/services/api';
import { formatDate } from '@/utils';

const weekDayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const TrainerDetailPage: React.FC = () => {
  const router = useRouter();
  const trainerId = router.params.id as string;

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [reviews, setReviews] = useState<TrainerReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [weekDays, setWeekDays] = useState<{ date: string; dayName: string; dayNum: number }[]>([]);

  useEffect(() => {
    generateWeekDays();
    loadTrainerDetail();
    loadReviews();
  }, [trainerId]);

  usePullDownRefresh(() => {
    loadTrainerDetail();
    loadReviews();
    Taro.stopPullDownRefresh();
  });

  const generateWeekDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: i === 0 ? '今天' : weekDayNames[date.getDay()],
        dayNum: date.getDate()
      });
    }
    setWeekDays(days);
    if (days.length > 0) {
      setSelectedDate(days[0].date);
    }
  };

  const loadTrainerDetail = useCallback(async () => {
    setLoading(true);
    try {
      const result = await trainerApi.getTrainerById(trainerId);
      setTrainer(result);
    } catch (error) {
      console.error('[TrainerDetail] loadTrainerDetail error:', error);
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  const loadReviews = useCallback(async () => {
    try {
      const result = await trainerApi.getTrainerReviews(trainerId);
      setReviews(result);
    } catch (error) {
      console.error('[TrainerDetail] loadReviews error:', error);
    }
  }, [trainerId]);

  const getCurrentSchedule = () => {
    if (!trainer) return null;
    return trainer.schedule.find((s) => s.date === selectedDate);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot);
  };

  const handleBook = () => {
    if (!trainer || !selectedSlot) return;
    Taro.navigateTo({
      url: `/pages/course-booking/index?trainerId=${trainerId}&date=${selectedDate}&slotId=${selectedSlot.id}`
    });
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const currentSchedule = getCurrentSchedule();

  if (loading && !trainer) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!trainer) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>未找到训导师信息</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.avatar}>
          <Image src={trainer.avatar} mode="aspectFill" />
        </View>
        <View className={styles.info}>
          <Text className={styles.name}>{trainer.name}</Text>
          <Text className={styles.title}>{trainer.title}</Text>
          <View className={styles.ratingRow}>
            <StarRating rating={trainer.starRating} size={28} />
            <Text className={styles.price}>¥{trainer.pricePerHour}/小时</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.section}>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{trainer.experienceYears}</Text>
              <Text className={styles.statLabel}>从业年限</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{trainer.courseCount}</Text>
              <Text className={styles.statLabel}>累计课程</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{trainer.successRate}%</Text>
              <Text className={styles.statLabel}>改善成功率</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{trainer.reviewCount}</Text>
              <Text className={styles.statLabel}>好评数</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🎯</Text>
            <Text>擅长领域</Text>
          </View>
          <View className={styles.tags}>
            {trainer.specialties.map((specialty) => (
              <View key={specialty} className={styles.tag}>
                <Text>{BehaviorProblemTypeLabels[specialty]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📜</Text>
            <Text>资质认证</Text>
          </View>
          <View className={styles.certList}>
            {trainer.certifications.map((cert, index) => (
              <View key={index} className={styles.certItem}>
                <Text className={styles.certIcon}>🏆</Text>
                <Text className={styles.certText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📝</Text>
            <Text>个人简介</Text>
          </View>
          <Text className={styles.introText}>{trainer.introduction}</Text>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📍</Text>
            <Text>服务方式</Text>
          </View>
          <View className={styles.locationRow}>
            <Text>地址:</Text>
            <Text>{trainer.location.city} {trainer.location.district} {trainer.location.address}</Text>
          </View>
          <View className={styles.modeBadges}>
            {trainer.onlineAvailable && (
              <View className={`${styles.modeBadge} ${styles.modeBadgeOnline}`}>
                <Text>📹</Text>
                <Text>线上视频</Text>
              </View>
            )}
            {trainer.offlineAvailable && (
              <View className={`${styles.modeBadge} ${styles.modeBadgeOffline}`}>
                <Text>🏠</Text>
                <Text>线下当面</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.scheduleSection}>
          <View className={styles.section}>
            <View className={styles.scheduleHeader}>
              <View className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                <Text className={styles.sectionTitleIcon}>📅</Text>
                <Text>预约排班</Text>
              </View>
            </View>
            <ScrollView scrollX className={styles.weekDays}>
              {weekDays.map((day) => (
                <View
                  key={day.date}
                  className={`${styles.weekDayItem} ${selectedDate === day.date ? styles.active : ''}`}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSelectedSlot(null);
                  }}
                >
                  <Text className={styles.dayName}>{day.dayName}</Text>
                  <Text className={styles.dayNum}>{day.dayNum}</Text>
                </View>
              ))}
            </ScrollView>

            {currentSchedule ? (
              <View className={styles.timeSlots}>
                {currentSchedule.timeSlots.map((slot) => (
                  <View
                    key={slot.id}
                    className={`
                      ${styles.slotItem}
                      ${slot.available ? styles.available : styles.unavailable}
                      ${selectedSlot?.id === slot.id ? styles.selected : ''}
                    `}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <Text className={styles.slotTime}>
                      {slot.startTime}
                    </Text>
                    <Text className={styles.slotType}>
                      {slot.courseType === 'one_on_one' ? '一对一' : '小班课'}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className={styles.loading}>
                <Text>当日暂无可预约时段</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.reviewSection}>
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>⭐</Text>
              <Text>用户评价 ({reviews.length})</Text>
            </View>
          </View>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} className={styles.reviewItem}>
                <View className={styles.reviewHeader}>
                  <View className={styles.reviewerAvatar}>
                    <Image src={review.userAvatar} mode="aspectFill" />
                  </View>
                  <View className={styles.reviewerInfo}>
                    <Text className={styles.reviewerName}>{review.userName}</Text>
                    <Text className={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
                  </View>
                  <StarRating rating={review.rating} size={24} />
                </View>
                <Text className={styles.reviewContent}>{review.content}</Text>
                {review.behaviorImproved && (
                  <View className={styles.improvedBadge}>
                    <Text>✅</Text>
                    <Text>行为已改善</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className={styles.section}>
              <View className={styles.loading}>
                <Text>暂无评价</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.backBtn} onClick={handleBack}>
          <Text>←</Text>
        </View>
        <View
          className={`${styles.bookBtn} ${!selectedSlot ? styles.disabled : ''}`}
          onClick={selectedSlot ? handleBook : undefined}
        >
          <Text>
            {selectedSlot ? `立即预约 · ¥${trainer.pricePerHour}` : '请选择上课时间'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default TrainerDetailPage;
