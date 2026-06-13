import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView
} from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { DashboardStats } from '@/types';
import { userApi } from '@/services/api';
import { formatDate } from '@/utils';

const tabs = [
  { key: 'overview', label: '总览' },
  { key: 'trainers', label: '训导师' },
  { key: 'bookings', label: '预约' }
];

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  usePullDownRefresh(() => {
    loadDashboardStats();
    Taro.stopPullDownRefresh();
  });

  const loadDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const result = await userApi.getDashboardStats();
      setStats(result);
    } catch (error) {
      console.error('[Dashboard] loadDashboardStats error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const maxWeeklyCount = useMemo(() => {
    if (!stats) return 1;
    return Math.max(...stats.weeklyCourses.map((d) => d.count), 1);
  }, [stats]);

  const getRankClass = (index: number) => {
    if (index === 0) return styles.rank1;
    if (index === 1) return styles.rank2;
    if (index === 2) return styles.rank3;
    return styles.other;
  };

  const getBookingStatusClass = (status: string) => {
    const classMap: Record<string, string> = {
      upcoming: styles.upcoming,
      completed: styles.completed,
      in_progress: styles.in_progress,
      pending: styles.pending,
      cancelled: styles.cancelled
    };
    return classMap[status] || styles.pending;
  };

  const getBookingStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      upcoming: '即将开始',
      completed: '已完成',
      in_progress: '进行中',
      pending: '待支付',
      cancelled: '已取消'
    };
    return labelMap[status] || status;
  };

  if (loading && !stats) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!stats) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>暂无数据</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.tabBar}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView scrollY>
        {activeTab === 'overview' && (
          <>
            <View className={styles.statsGrid}>
              <View className={styles.statCard}>
                <Text className={styles.statIcon}>👨‍🏫</Text>
                <Text className={styles.statValue}>{stats.totalTrainers}</Text>
                <Text className={styles.statLabel}>训导师总数</Text>
                <Text className={`${styles.statTrend} ${styles.up}`}>↑ 12% 较上月</Text>
              </View>
              <View className={styles.statCard}>
                <Text className={styles.statIcon}>📅</Text>
                <Text className={styles.statValue}>{stats.totalCoursesToday}</Text>
                <Text className={styles.statLabel}>今日课程</Text>
                <Text className={`${styles.statTrend} ${styles.up}`}>↑ 8% 较昨日</Text>
              </View>
              <View className={styles.statCard}>
                <Text className={styles.statIcon}>✅</Text>
                <Text className={styles.statValue}>{stats.completionRate}%</Text>
                <Text className={styles.statLabel}>课程完成率</Text>
                <Text className={`${styles.statTrend} ${styles.up}`}>↑ 5% 较上月</Text>
              </View>
              <View className={styles.statCard}>
                <Text className={styles.statIcon}>😊</Text>
                <Text className={styles.statValue}>{stats.satisfactionRate}%</Text>
                <Text className={styles.statLabel}>主人满意度</Text>
                <Text className={`${styles.statTrend} ${styles.down}`}>↓ 2% 较上月</Text>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionHeader}>
                <View className={styles.sectionTitle}>
                  <Text className={styles.sectionTitleIcon}>📊</Text>
                  <Text>本周课程趋势</Text>
                </View>
                <Text className={styles.sectionAction}>查看详情</Text>
              </View>
              <View className={styles.chartContainer}>
                {stats.weeklyCourses.map((day, index) => {
                  const heightPercent = (day.count / maxWeeklyCount) * 100;
                  return (
                    <View key={index} className={styles.chartBar}>
                      <View
                        className={styles.chartBarFill}
                        style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      />
                      <Text className={styles.chartBarValue}>{day.count}</Text>
                      <Text className={styles.chartBarLabel}>
                        {day.date.split('-').slice(1).join('/')}
                      </Text>
                    </View>
                  );
                })}
              </View>
              <View className={styles.legend}>
                <View className={styles.legendItem}>
                  <View className={styles.legendDot} />
                  <Text>课程数量</Text>
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <View className={styles.sectionHeader}>
                <View className={styles.sectionTitle}>
                  <Text className={styles.sectionTitleIcon}>🎯</Text>
                  <Text>行为改善成功率</Text>
                </View>
                <Text className={styles.sectionAction}>详细分析</Text>
              </View>
              <View className={styles.ringChartContainer}>
                <View className={styles.ringChart}>
                  <View className={styles.ringChartBg}>
                    <View className={styles.ringChartInner}>
                      <Text className={styles.ringChartValue}>{stats.behaviorImprovementRate}%</Text>
                      <Text className={styles.ringChartLabel}>改善率</Text>
                    </View>
                  </View>
                </View>
                <View className={styles.ringLegend}>
                  <View className={styles.ringLegendItem}>
                    <View className={styles.ringLegendLabel}>
                      <View className={`${styles.ringLegendDot} ${styles.ringLegendDotSuccess}`} />
                      <Text>显著改善</Text>
                    </View>
                    <Text className={styles.ringLegendValue}>85%</Text>
                  </View>
                  <View className={styles.ringLegendItem}>
                    <View className={styles.ringLegendLabel}>
                      <View className={`${styles.ringLegendDot} ${styles.ringLegendDotWarning}`} />
                      <Text>部分改善</Text>
                    </View>
                    <Text className={styles.ringLegendValue}>10%</Text>
                  </View>
                  <View className={styles.ringLegendItem}>
                    <View className={styles.ringLegendLabel}>
                      <View className={`${styles.ringLegendDot} ${styles.ringLegendDotError}`} />
                      <Text>无明显改善</Text>
                    </View>
                    <Text className={styles.ringLegendValue}>5%</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {activeTab === 'trainers' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionTitleIcon}>🏆</Text>
                <Text>训导师排行榜</Text>
              </View>
            </View>
            <View className={styles.trainerList}>
              {stats.topTrainers.map((trainer, index) => (
                <View key={trainer.id} className={styles.trainerRankItem}>
                  <View className={`${styles.rankBadge} ${getRankClass(index)}`}>
                    <Text>{index + 1}</Text>
                  </View>
                  <View className={styles.trainerAvatar}>
                    <Image src={trainer.avatar} mode="aspectFill" />
                  </View>
                  <View className={styles.trainerInfo}>
                    <Text className={styles.trainerName}>{trainer.name}</Text>
                    <View className={styles.trainerStats}>
                      <Text>课程: {trainer.coursesCount}节</Text>
                      <Text>评分: {trainer.rating}</Text>
                    </View>
                  </View>
                  <View className={styles.trainerRate}>
                    <Text className={styles.rateValue}>{trainer.successRate}%</Text>
                    <Text className={styles.rateLabel}>成功率</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'bookings' && (
          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionTitleIcon}>📋</Text>
                <Text>最近预约记录</Text>
              </View>
              <Text className={styles.sectionAction}>全部</Text>
            </View>
            <View className={styles.bookingList}>
              {stats.recentBookings.map((booking) => (
                <View key={booking.id} className={styles.bookingItem}>
                  <View className={styles.bookingInfo}>
                    <Text className={styles.bookingPetName}>{booking.petName}</Text>
                    <Text className={styles.bookingDetail}>
                      训导师: {booking.trainerName} · {formatDate(booking.date)}
                    </Text>
                  </View>
                  <View className={`${styles.bookingStatus} ${getBookingStatusClass(booking.status)}`}>
                    <Text>{getBookingStatusLabel(booking.status)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardPage;
