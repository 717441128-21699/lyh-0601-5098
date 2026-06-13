import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Trainer, BehaviorProblemTypeLabels } from '@/types';
import StarRating from '../StarRating';
import Tag from '../Tag';

interface TrainerCardProps {
  trainer: Trainer;
  onTap?: () => void;
  showDistance?: boolean;
  compact?: boolean;
}

const TrainerCard: React.FC<TrainerCardProps> = ({
  trainer,
  onTap,
  showDistance = true,
  compact = false
}) => {
  const handleClick = () => {
    if (onTap) {
      onTap();
    } else {
      Taro.navigateTo({
        url: `/pages/trainer-detail/index?id=${trainer.id}`
      });
    }
  };

  return (
    <View
      className={`${styles.card} ${compact ? styles.compact : ''}`}
      onClick={handleClick}
    >
      <Image
        className={styles.avatar}
        src={trainer.avatar}
        mode="aspectFill"
        onError={(e) => {
          console.error('[TrainerCard] Image load error:', e.detail);
        }}
      />
      <View className={styles.info}>
        <View className={styles.header}>
          <Text className={styles.name}>{trainer.name}</Text>
          <View className={styles.rating}>
            <StarRating rating={trainer.starRating} showText size="small" />
            <Text className={styles.reviewCount}>({trainer.reviewCount})</Text>
          </View>
        </View>
        <Text className={styles.title}>{trainer.title}</Text>
        <View className={styles.meta}>
          <Text className={styles.metaItem}>从业 {trainer.experienceYears} 年</Text>
          <Text className={styles.metaItem}>·</Text>
          <Text className={styles.metaItem}>完成 {trainer.courseCount} 课</Text>
          {showDistance && trainer.distance && (
            <>
              <Text className={styles.metaItem}>·</Text>
              <Text className={styles.distance}>{trainer.distance}km</Text>
            </>
          )}
        </View>
        {!compact && (
          <>
            <View className={styles.tags}>
              {trainer.specialties.slice(0, 3).map((specialty) => (
                <Tag
                  key={specialty}
                  text={BehaviorProblemTypeLabels[specialty]}
                  type="default"
                />
              ))}
              {trainer.onlineAvailable && (
                <Tag text="线上" type="success" />
              )}
              {trainer.offlineAvailable && (
                <Tag text="线下" type="primary" />
              )}
            </View>
            <View className={styles.footer}>
              <Text className={styles.price}>
                ¥{trainer.pricePerHour}
                <Text className={styles.priceUnit}>/小时</Text>
              </Text>
              <Text className={styles.successRate}>
                成功率 {trainer.successRate}%
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default TrainerCard;
