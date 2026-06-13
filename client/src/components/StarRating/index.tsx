import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  showText = true,
  size = 'medium'
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < maxRating; i++) {
      let starClass = styles.emptyStar;
      if (i < fullStars) {
        starClass = styles.fullStar;
      } else if (i === fullStars && hasHalfStar) {
        starClass = styles.halfStar;
      }
      stars.push(
        <Text
          key={i}
          className={`${styles.star} ${starClass} ${styles[size]}`}
        >
          ★
        </Text>
      );
    }
    return stars;
  };

  return (
    <View className={styles.container}>
      <View className={styles.stars}>{renderStars()}</View>
      {showText && (
        <Text className={`${styles.ratingText} ${styles[size]}`}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

export default StarRating;
