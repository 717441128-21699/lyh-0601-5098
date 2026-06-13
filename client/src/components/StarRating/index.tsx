import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large' | number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  precision?: 0.5 | 1;
  decimalPlaces?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  showText = true,
  size = 'medium',
  interactive = false,
  onChange,
  precision = 1,
  decimalPlaces = 1
}) => {
  const fullStars = Math.floor(rating);
  const remainder = rating - fullStars;

  const handleStarClick = (index: number, isHalf: boolean) => {
    if (!interactive || !onChange) return;
    let newRating = isHalf ? index + 0.5 : index + 1;
    if (precision === 1) {
      newRating = index + 1;
    }
    if (newRating < 0.5) newRating = 0.5;
    if (newRating > maxRating) newRating = maxRating;
    onChange(newRating);
  };

  const getStarWidth = (index: number): string => {
    if (rating <= 0) return '0%';
    if (index < fullStars) return '100%';
    if (index === fullStars && remainder > 0) {
      return `${remainder * 100}%`;
    }
    return '0%';
  };

  const sizeClass = typeof size === 'string' ? styles[size] : '';

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < maxRating; i++) {
      stars.push(
        <View
          key={i}
          className={`${styles.starWrapper} ${interactive ? styles.clickable : ''}`}
          onClick={() => handleStarClick(i, false)}
        >
          <Text className={`${styles.star} ${styles.emptyStar} ${sizeClass}`}>
            ★
          </Text>
          <View
            className={styles.starFill}
            style={{ width: getStarWidth(i) }}
          >
            <Text className={`${styles.star} ${styles.fullStar} ${sizeClass}`}>
              ★
            </Text>
          </View>
          {interactive && precision === 0.5 && (
            <View
              className={styles.halfHitArea}
              onClick={(e) => {
                e.stopPropagation();
                handleStarClick(i, true);
              }}
            />
          )}
        </View>
      );
    }
    return stars;
  };

  return (
    <View className={styles.container}>
      <View className={styles.stars}>{renderStars()}</View>
      {showText && (
        <Text className={`${styles.ratingText} ${sizeClass}`}>
          {rating.toFixed(decimalPlaces)}
        </Text>
      )}
    </View>
  );
};

export default StarRating;
