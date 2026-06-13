import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { Course, CourseStatus } from '@/types';
import BookingCard from '@/components/BookingCard';
import EmptyState from '@/components/EmptyState';
import { courseApi } from '@/services/api';

const statusTabs = [
  { key: 'all', label: '全部' },
  { key: 'upcoming', label: '待上课' },
  { key: 'completed', label: '已完成' },
  { key: 'pending', label: '待支付' }
];

const BookingPage: React.FC = () => {
  const [bookings, setBookings] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  useDidShow(() => {
    loadBookings();
  });

  usePullDownRefresh(() => {
    loadBookings();
    Taro.stopPullDownRefresh();
  });

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const result = await courseApi.getCourses(status);
      setBookings(result);
    } catch (error) {
      console.error('[BookingPage] loadBookings error:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const upcomingCount = useMemo(() => {
    return bookings.filter(
      (b) => b.status === 'upcoming' || b.status === 'paid'
    ).length;
  }, [bookings]);

  const nearestUpcoming = useMemo(() => {
    const upcoming = bookings.filter(
      (b) => b.status === 'upcoming' || b.status === 'paid'
    );
    if (upcoming.length === 0) return null;
    return upcoming.sort(
      (a, b) =>
        new Date(`${a.date} ${a.startTime}`).getTime() -
        new Date(`${b.date} ${b.startTime}`).getTime()
    )[0];
  }, [bookings]);

  const handleAction = async (course: Course) => {
    try {
      switch (course.status) {
        case 'upcoming':
          const result = await courseApi.checkIn(course.id);
          Taro.showToast({ title: '签到成功', icon: 'success' });
          loadBookings();
          break;
        case 'pending':
          Taro.navigateTo({
            url: `/pages/course-booking/index?courseId=${course.id}`
          });
          break;
        case 'completed':
          if (!course.ownerConfirmed) {
            await courseApi.confirmCourse(course.id);
            Taro.showToast({ title: '确认成功', icon: 'success' });
            loadBookings();
          } else {
            Taro.navigateTo({
              url: `/pages/effect-upload/index?courseId=${course.id}`
            });
          }
          break;
        default:
          Taro.navigateTo({
            url: `/pages/course-detail/index?id=${course.id}`
          });
      }
    } catch (error) {
      console.error('[BookingPage] handleAction error:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      );
    }

    if (bookings.length === 0) {
      return (
        <EmptyState
          title={`暂无${statusTabs.find((t) => t.key === activeTab)?.label}课程`}
          description="去发现合适的训导师吧"
          actionText="浏览训导师"
          onAction={() => Taro.switchTab({ url: '/pages/trainers/index' })}
        />
      );
    }

    return (
      <View className={styles.bookingList}>
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            course={booking}
            onAction={handleAction}
          />
        ))}
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        {statusTabs.map((tab) => (
          <View
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
            {tab.key === 'upcoming' && upcomingCount > 0 && (
              <View className={styles.tabBadge}>
                <Text className={styles.badgeText}>
                  {upcomingCount > 99 ? '99+' : upcomingCount}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {nearestUpcoming && activeTab === 'all' && (
        <View className={styles.reminderBanner}>
          <View className={styles.reminderIcon}>
            <Text>⏰</Text>
          </View>
          <View className={styles.reminderContent}>
            <Text className={styles.reminderTitle}>即将开始的课程</Text>
            <Text className={styles.reminderDesc}>
              {nearestUpcoming.date} {nearestUpcoming.startTime} · {nearestUpcoming.trainerName}
            </Text>
          </View>
          <Button
            className={styles.reminderBtn}
            onClick={() =>
              Taro.navigateTo({
                url: `/pages/course-detail/index?id=${nearestUpcoming.id}`
              })
            }
          >
            查看
          </Button>
        </View>
      )}

      <ScrollView scrollY>{renderContent()}</ScrollView>
    </View>
  );
};

export default BookingPage;
