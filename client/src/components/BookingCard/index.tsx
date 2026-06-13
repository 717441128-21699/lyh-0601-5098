import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import {
  Course,
  CourseTypeLabels,
  CourseModeLabels,
  CourseStatusLabels
} from '@/types';
import Tag from '../Tag';

interface BookingCardProps {
  course: Course;
  onAction?: (course: Course) => void;
  actionText?: string;
}

const BookingCard: React.FC<BookingCardProps> = ({
  course,
  onAction,
  actionText
}) => {
  const handleTap = () => {
    Taro.navigateTo({
      url: `/pages/course-detail/index?id=${course.id}`
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDefaultActionText = () => {
    switch (course.status) {
      case 'upcoming':
        return '立即签到';
      case 'pending':
        return '去支付';
      case 'completed':
        if (!course.ownerConfirmed) return '确认课程';
        return '上传效果';
      default:
        return '查看详情';
    }
  };

  return (
    <View className={styles.card} onClick={handleTap}>
      <View className={styles.header}>
        <Image
          className={styles.trainerAvatar}
          src={course.trainerAvatar}
          mode="aspectFill"
          onError={(e) => {
            console.error('[BookingCard] Image load error:', e.detail);
          }}
        />
        <View className={styles.headerInfo}>
          <View className={styles.trainerRow}>
            <Text className={styles.trainerName}>{course.trainerName}</Text>
            <Tag
              text={CourseStatusLabels[course.status]}
              type={getStatusColor(course.status) as any}
            />
          </View>
          <Text className={styles.petName}>
            宠物：{course.petName}
          </Text>
        </View>
      </View>

      <View className={styles.info}>
        <View className={styles.infoRow}>
          <Text className={styles.label}>课程类型</Text>
          <View className={styles.tags}>
            <Tag text={CourseTypeLabels[course.type]} type="default" />
            <Tag text={CourseModeLabels[course.mode]} type="success" />
          </View>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>上课时间</Text>
          <Text className={styles.value}>
            {course.date} {course.startTime}-{course.endTime}
          </Text>
        </View>
        {course.location && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>上课地点</Text>
            <Text className={styles.value}>{course.location}</Text>
          </View>
        )}
        <View className={styles.infoRow}>
          <Text className={styles.label}>课程票号</Text>
          <Text className={styles.ticketCode}>{course.ticketCode}</Text>
        </View>
      </View>

      <View className={styles.footer}>
        <Text className={styles.price}>¥{course.price}</Text>
        {actionText !== 'none' && (
          <Button
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              if (onAction) {
                onAction(course);
              }
            }}
          >
            {actionText || getDefaultActionText()}
          </Button>
        )}
      </View>
    </View>
  );
};

export default BookingCard;
