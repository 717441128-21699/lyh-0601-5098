import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView
} from '@tarojs/components';
import Taro, { useRouter, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import { Course, HomeworkTask } from '@/types';
import {
  CourseTypeLabels,
  CourseModeLabels,
  CourseStatusLabels
} from '@/types/course';
import StarRating from '@/components/StarRating';
import Tag from '@/components/Tag';
import { courseApi, orderApi, trainerApi } from '@/services/api';
import { useUserStore } from '@/store/useUserStore';
import { formatDate } from '@/utils';

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const courseId = router.params.id as string;

  const userStore = useUserStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [homeworkChecked, setHomeworkChecked] = useState<Record<string, boolean>>({});
  const [trainerReviews, setTrainerReviews] = useState<any[]>([]);
  const [trainerAvgRating, setTrainerAvgRating] = useState(0);

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  usePullDownRefresh(() => {
    loadCourseDetail();
    Taro.stopPullDownRefresh();
  });

  useEffect(() => {
    if (course?.status === 'upcoming') {
      const timer = setInterval(() => {
        const courseTime = new Date(`${course.date}T${course.startTime}`).getTime();
        const now = Date.now();
        const diff = courseTime - now;

        if (diff > 0) {
          setCountdown({
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000)
          });
        } else {
          setCountdown({ hours: 0, minutes: 0, seconds: 0 });
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [course]);

  const loadCourseDetail = useCallback(async () => {
    setLoading(true);
    try {
      const result = await courseApi.getCourseById(courseId);
      setCourse(result);
      if (result.homework?.tasks) {
        const checked: Record<string, boolean> = {};
        result.homework.tasks.forEach((t) => {
          checked[t.id] = t.completed;
        });
        setHomeworkChecked(checked);
      }

      if (result.trainerId) {
        try {
          const reviews = await trainerApi.getTrainerReviews(result.trainerId);
          setTrainerReviews(reviews);
          const detail = await trainerApi.getTrainerDetail(result.trainerId);
          setTrainerAvgRating(detail.starRating || 0);
        } catch (e) {
          console.error('[CourseDetail] load trainer reviews error:', e);
        }
      }
    } catch (error) {
      console.error('[CourseDetail] loadCourseDetail error:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const statusBannerClass = useMemo(() => {
    if (!course) return styles.statusUpcoming;
    const classMap: Record<string, string> = {
      pending: styles.statusPending,
      paid: styles.statusUpcoming,
      upcoming: styles.statusUpcoming,
      in_progress: styles.statusInProgress,
      completed: styles.statusCompleted,
      cancelled: styles.statusCancelled
    };
    return classMap[course.status] || styles.statusUpcoming;
  }, [course]);

  const statusText = useMemo(() => {
    if (!course) return '';
    return CourseStatusLabels[course.status];
  }, [course]);

  const statusDesc = useMemo(() => {
    if (!course) return '';
    const descMap: Record<string, string> = {
      pending: '请尽快完成支付以锁定课程',
      paid: '支付成功，等待课程开始',
      upcoming: '课程即将开始，请做好准备',
      in_progress: '课程进行中，认真学习哦',
      completed: '课程已完成，查看训练记录',
      cancelled: '课程已取消'
    };
    return descMap[course.status] || '';
  }, [course]);

  const handleCheckIn = async () => {
    if (!course) return;
    try {
      await courseApi.checkIn(course.id);
      Taro.showToast({ title: '签到成功', icon: 'success' });
      loadCourseDetail();
    } catch (error) {
      console.error('[CourseDetail] handleCheckIn error:', error);
      Taro.showToast({ title: '签到失败', icon: 'none' });
    }
  };

  const handleUploadEffect = () => {
    Taro.navigateTo({ url: `/pages/effect-upload/index?courseId=${courseId}` });
  };

  const handlePay = async () => {
    if (!course) return;
    try {
      const order = await orderApi.getOrderByCourseId(course.id);
      Taro.showModal({
        title: '确认支付',
        content: `${course.trainerName} - ${CourseTypeLabels[course.type]}课程\n需支付 ¥${order.amount}`,
        success: async (res) => {
          if (res.confirm) {
            try {
              await orderApi.payOrder(order.id, { paymentMethod: 'wechat' });
              Taro.showToast({ title: '支付成功', icon: 'success' });
              await loadCourseDetail();
            } catch (payError) {
              console.error('[CourseDetail] pay error:', payError);
              Taro.showToast({ title: '支付失败，请重试', icon: 'none' });
            }
          }
        }
      });
    } catch (error) {
      console.error('[CourseDetail] handlePay error:', error);
      Taro.showToast({ title: '获取订单失败', icon: 'none' });
    }
  };

  const handleSubmitHomework = async () => {
    if (!course?.homework) return;
    try {
      const tasks = course.homework.tasks.map((task) => ({
        id: task.id,
        completed: homeworkChecked[task.id] || false
      }));
      await courseApi.submitHomework(course.id, { tasks });
      Taro.showToast({ title: '作业提交成功', icon: 'success' });
      loadCourseDetail();
    } catch (error) {
      console.error('[CourseDetail] submitHomework error:', error);
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
    }
  };

  const handleConfirmCourse = async () => {
    if (!course) return;
    Taro.showModal({
      title: '确认课程完成',
      content: '确认课程已完成，将自动结算课时费给训导师',
      success: async (res) => {
        if (res.confirm) {
          try {
            await courseApi.confirmCourse(course.id);
            Taro.showToast({ title: '已确认完成', icon: 'success' });
            loadCourseDetail();
            userStore.fetchUser();
          } catch (error) {
            console.error('[CourseDetail] handleConfirmCourse error:', error);
            Taro.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  };

  const handleJoinMeeting = () => {
    if (course?.meetingUrl) {
      Taro.showToast({ title: '正在进入会议室...', icon: 'none' });
    }
  };

  const toggleHomeworkTask = (taskId: string) => {
    setHomeworkChecked((prev) => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const renderBottomBar = () => {
    if (!course) return null;

    switch (course.status) {
      case 'pending':
        return (
          <View className={styles.bottomBar}>
            <View
              className={`${styles.secondaryBtn} ${styles.fullWidthBtn}`}
              onClick={handlePay}
            >
              <Text>立即支付 ¥{course.price}</Text>
            </View>
          </View>
        );
      case 'upcoming':
        return (
          <View className={styles.bottomBar}>
            <View
              className={styles.secondaryBtn}
              onClick={() => Taro.navigateBack()}
            >
              <Text>返回</Text>
            </View>
            {course.mode === 'online' ? (
              <View className={styles.primaryBtn} onClick={handleJoinMeeting}>
                <Text>进入会议室</Text>
              </View>
            ) : (
              <View className={styles.primaryBtn} onClick={handleCheckIn}>
                <Text>立即签到</Text>
              </View>
            )}
          </View>
        );
      case 'in_progress':
        return (
          <View className={styles.bottomBar}>
            <View
              className={`${styles.primaryBtn} ${styles.fullWidthBtn}`}
              onClick={handleJoinMeeting}
            >
              <Text>进入课程</Text>
            </View>
          </View>
        );
      case 'completed':
        if (!course.ownerConfirmed) {
          return (
            <View className={styles.bottomBar}>
              <View
                className={styles.secondaryBtn}
                onClick={handleUploadEffect}
              >
                <Text>上传效果</Text>
              </View>
              <View
                className={styles.primaryBtn}
                onClick={handleConfirmCourse}
              >
                <Text>确认完成</Text>
              </View>
            </View>
          );
        } else {
          return (
            <View className={styles.bottomBar}>
              <View
                className={styles.secondaryBtn}
                onClick={() => Taro.navigateTo({
                  url: `/pages/trainer-detail/index?id=${course.trainerId}`
                })}
              >
                <Text>再次预约</Text>
              </View>
              <View
                className={`${styles.primaryBtn} ${styles.fullWidthBtn}`}
                onClick={handleUploadEffect}
              >
                <Text>上传训练效果</Text>
              </View>
            </View>
          );
        }
      default:
        return (
          <View className={styles.bottomBar}>
            <View
              className={`${styles.primaryBtn} ${styles.fullWidthBtn}`}
              onClick={() => Taro.navigateBack()}
            >
              <Text>返回</Text>
            </View>
          </View>
        );
    }
  };

  if (loading && !course) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!course) {
    return (
      <View className={styles.page}>
        <View className={styles.loading}>
          <Text>未找到课程信息</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={`${styles.statusBanner} ${statusBannerClass}`}>
        <Text className={styles.statusTitle}>{statusText}</Text>
        <Text className={styles.statusDesc}>{statusDesc}</Text>
        {course.status === 'upcoming' && (
          <View className={styles.countdown}>
            <View className={styles.countdownItem}>
              <View className={styles.countdownValue}>
                {String(countdown.hours).padStart(2, '0')}
              </View>
              <Text className={styles.countdownLabel}>时</Text>
            </View>
            <View className={styles.countdownItem}>
              <View className={styles.countdownValue}>
                {String(countdown.minutes).padStart(2, '0')}
              </View>
              <Text className={styles.countdownLabel}>分</Text>
            </View>
            <View className={styles.countdownItem}>
              <View className={styles.countdownValue}>
                {String(countdown.seconds).padStart(2, '0')}
              </View>
              <Text className={styles.countdownLabel}>秒</Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView scrollY>
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🎫</Text>
            <Text>电子课程票</Text>
          </View>
          <View className={styles.ticketCard}>
            <View className={styles.ticketHeader}>
              <Text className={styles.ticketTitle}>宠物训导课程</Text>
              <Text className={styles.ticketCode}>{course.ticketCode}</Text>
            </View>
            <View className={styles.ticketInfo}>
              <View className={styles.ticketInfoItem}>
                <Text className={styles.ticketInfoLabel}>日期</Text>
                <Text className={styles.ticketInfoValue}>{formatDate(course.date)}</Text>
              </View>
              <View className={styles.ticketInfoItem}>
                <Text className={styles.ticketInfoLabel}>时间</Text>
                <Text className={styles.ticketInfoValue}>{course.startTime}</Text>
              </View>
              <View className={styles.ticketInfoItem}>
                <Text className={styles.ticketInfoLabel}>类型</Text>
                <Text className={styles.ticketInfoValue}>{CourseTypeLabels[course.type]}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>👨‍🏫</Text>
            <Text>训导师</Text>
          </View>
          <View
            className={styles.trainerCard}
            onClick={() => Taro.navigateTo({
              url: `/pages/trainer-detail/index?id=${course.trainerId}`
            })}
          >
            <View className={styles.trainerAvatar}>
              <Image src={course.trainerAvatar} mode="aspectFill" />
            </View>
            <View className={styles.trainerInfo}>
              <Text className={styles.trainerName}>{course.trainerName}</Text>
              <Text className={styles.trainerTitle}>点击查看训导师详情</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📋</Text>
            <Text>课程信息</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>课程类型</Text>
            <View className={`${styles.tag} ${styles.tagPrimary}`}>
              <Text>{CourseTypeLabels[course.type]}</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>上课方式</Text>
            <View className={`${styles.tag} ${styles.tagSecondary}`}>
              <Text>{CourseModeLabels[course.mode]}</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>上课日期</Text>
            <Text className={styles.infoValue}>{formatDate(course.date)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>上课时间</Text>
            <Text className={styles.infoValue}>{course.startTime} - {course.endTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>课程时长</Text>
            <Text className={styles.infoValue}>{course.duration}分钟</Text>
          </View>
          {course.checkInTime && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>签到时间</Text>
              <Text className={styles.infoValue}>{course.checkInTime}</Text>
            </View>
          )}
          {course.location && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>上课地点</Text>
              <Text className={styles.infoValue}>{course.location}</Text>
            </View>
          )}
          {course.meetingUrl && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>会议室链接</Text>
              <View className={`${styles.tag} ${styles.tagSuccess}`} onClick={handleJoinMeeting}>
                <Text>📹 点击进入</Text>
              </View>
            </View>
          )}
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>参训宠物</Text>
            <Text className={styles.infoValue}>{course.petName}</Text>
          </View>
        </View>

        {course.trainingRecord && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📝</Text>
              <Text>训练记录</Text>
            </View>
            <View className={styles.recordContent}>
              <Text className={styles.recordText}>{course.trainingRecord.content}</Text>

              {course.trainingRecord.achievements.length > 0 && (
                <>
                  <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#FF7A45', marginBottom: '16rpx' }}>
                    ✅ 本次训练成果
                  </Text>
                  <View className={styles.recordList}>
                    {course.trainingRecord.achievements.map((item, index) => (
                      <View key={index} className={styles.recordItem}>
                        <Text className={styles.recordItemIcon}>👍</Text>
                        <Text>{item}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {course.trainingRecord.issues.length > 0 && (
                <>
                  <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#FF6B6B', marginTop: '24rpx', marginBottom: '16rpx' }}>
                    ⚠️ 需要注意的问题
                  </Text>
                  <View className={styles.recordList}>
                    {course.trainingRecord.issues.map((item, index) => (
                      <View key={index} className={styles.recordItem}>
                        <Text className={styles.recordItemIcon}>📌</Text>
                        <Text>{item}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {course.trainingRecord.nextGoals.length > 0 && (
                <>
                  <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#4ECDC4', marginTop: '24rpx', marginBottom: '16rpx' }}>
                    🎯 下一阶段目标
                  </Text>
                  <View className={styles.recordList}>
                    {course.trainingRecord.nextGoals.map((item, index) => (
                      <View key={index} className={styles.recordItem}>
                        <Text className={styles.recordItemIcon}>💪</Text>
                        <Text>{item}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {course.homework && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📚</Text>
              <Text>家庭作业</Text>
            </View>
            <View className={styles.homeworkCard}>
              <View className={styles.homeworkTitle}>
                <Text>📝</Text>
                <Text>每日训练任务</Text>
              </View>
              <View className={styles.homeworkList}>
                {course.homework.tasks.map((task: HomeworkTask) => (
                  <View key={task.id} className={styles.homeworkTask}>
                    <View className={styles.homeworkTaskContent}>
                      <Text className={styles.homeworkTaskDesc}>{task.description}</Text>
                      <Text className={styles.homeworkTaskMeta}>
                        {task.frequency} · {task.duration}
                      </Text>
                    </View>
                    <View
                      className={`${styles.homeworkCheck} ${homeworkChecked[task.id] ? styles.checked : ''}`}
                      onClick={() => toggleHomeworkTask(task.id)}
                    >
                      {homeworkChecked[task.id] && (
                        <Text className={styles.homeworkCheckIcon}>✓</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
              <View className={styles.deadlineRow}>
                <Text className={styles.deadlineText}>
                  截止日期: {formatDate(course.homework.deadline)}
                </Text>
                {course.homework.completed ? (
                  <View className={`${styles.actionBtn} ${styles.completedBtn}`}>
                    <Text>✓ 已完成</Text>
                  </View>
                ) : (
                  <View className={styles.actionBtn} onClick={handleSubmitHomework}>
                    <Text>提交作业</Text>
                  </View>
                )}
              </View>
              {course.homework.completed && course.homework.completedAt && (
                <View className={styles.completedAtRow}>
                  <Text className={styles.completedAtText}>
                    🎉 完成时间: {formatDate(course.homework.completedAt)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {course.status === 'completed' && !course.trainingRecord && (
          <View className={styles.section}>
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>⏳</Text>
              <Text className={styles.emptyText}>训导师尚未填写训练记录</Text>
            </View>
          </View>
        )}

        {course.status === 'completed' && course.ownerConfirmed && (
          <View className={styles.uploadSection}>
            <View className={styles.section}>
              <View className={styles.sectionTitle}>
                <Text className={styles.sectionTitleIcon}>🎬</Text>
                <Text>训练效果对比</Text>
              </View>
              <View className={styles.uploadBtn} onClick={handleUploadEffect}>
                <Text className={styles.uploadIcon}>📹</Text>
                <Text className={styles.uploadText}>上传训练效果视频</Text>
                <Text className={styles.uploadHint}>上传前后对比视频，帮助其他主人参考</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>⭐</Text>
            <Text>课后反馈</Text>
            <Text className={styles.sectionSubTitle}>
              训导师综合评分
            </Text>
          </View>

          <View className={styles.feedbackSummary}>
            <View className={styles.avgRatingCol}>
              <Text className={styles.avgRatingValue}>{trainerAvgRating.toFixed(1)}</Text>
              <View className={styles.avgRatingStars}>
                <StarRating
                  rating={trainerAvgRating}
                  size="small"
                  showText={false}
                />
              </View>
              <Text className={styles.avgRatingLabel}>
                共 {trainerReviews.length} 条评价
              </Text>
            </View>
            <View className={styles.feedbackActions}>
              <View
                className={styles.bookAgainBtn}
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/trainer-detail/index?id=${course.trainerId}`
                  });
                }}
              >
                <Text>再次预约</Text>
              </View>
            </View>
          </View>

          {trainerReviews.length > 0 && (
            <View className={styles.recentReviews}>
              <Text className={styles.recentReviewsTitle}>最近评价</Text>
              <View className={styles.reviewList}>
                {trainerReviews.slice(0, 3).map((review: any) => (
                  <View key={review.id} className={styles.reviewItem}>
                    <View className={styles.reviewItemHeader}>
                      <Image
                        className={styles.reviewItemAvatar}
                        src={review.userAvatar}
                        mode="aspectFill"
                      />
                      <View className={styles.reviewItemInfo}>
                        <Text className={styles.reviewItemName}>{review.userName}</Text>
                        <View className={styles.reviewItemMeta}>
                          <StarRating
                            rating={review.rating}
                            size="small"
                            showText={false}
                          />
                          <Text className={styles.reviewItemDate}>
                            {new Date(review.createdAt).toLocaleDateString('zh-CN')}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text className={styles.reviewItemContent} numberOfLines={2}>
                      {review.content}
                    </Text>
                  </View>
                ))}
              </View>
              <View
                className={styles.viewAllReviews}
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/trainer-detail/index?id=${course.trainerId}`
                  });
                }}
              >
                <Text>查看全部评价 ›</Text>
              </View>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>💰</Text>
            <Text>费用信息</Text>
          </View>
          <View className={styles.priceRow}>
            <Text className={styles.priceLabel}>课程费用</Text>
            <Text className={styles.priceValue}>¥{course.price}</Text>
          </View>
          {course.settled && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>结算状态</Text>
              <View className={`${styles.tag} ${styles.tagSuccess}`}>
                <Text>已结算</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {renderBottomBar()}
    </View>
  );
};

export default CourseDetailPage;
