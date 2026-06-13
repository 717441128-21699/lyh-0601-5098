import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Pet, BehaviorProblemTypeLabels } from '@/types';
import Tag from '../Tag';

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onSelect?: (pet: Pet) => void;
  selectable?: boolean;
  selected?: boolean;
}

const PetCard: React.FC<PetCardProps> = ({
  pet,
  onEdit,
  onSelect,
  selectable = false,
  selected = false
}) => {
  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(pet);
    } else if (onEdit) {
      onEdit(pet);
    }
  };

  return (
    <View
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      <Image
        className={styles.avatar}
        src={pet.avatar}
        mode="aspectFill"
        onError={(e) => {
          console.error('[PetCard] Image load error:', e.detail);
        }}
      />
      <View className={styles.info}>
        <View className={styles.header}>
          <Text className={styles.name}>{pet.name}</Text>
          <Text className={styles.breed}>{pet.breed}</Text>
        </View>
        <View className={styles.meta}>
          <Text className={styles.metaText}>
            {pet.age}{pet.ageUnit === 'year' ? '岁' : '个月'}
          </Text>
          <Text className={styles.metaText}>
            {pet.gender === 'male' ? '♂ 公' : '♀ 母'}
          </Text>
          {pet.weight && (
            <Text className={styles.metaText}>{pet.weight}kg</Text>
          )}
        </View>
        {pet.behaviorProblems.length > 0 && (
          <View className={styles.tags}>
            {pet.behaviorProblems.slice(0, 3).map((problem) => (
              <Tag
                key={problem.id}
                text={BehaviorProblemTypeLabels[problem.type]}
                type={
                  problem.severity === 'severe'
                    ? 'error'
                    : problem.severity === 'moderate'
                    ? 'warning'
                    : 'default'
                }
              />
            ))}
          </View>
        )}
      </View>
      {selectable && (
        <View className={`${styles.checkbox} ${selected ? styles.checked : ''}`}>
          {selected && <Text className={styles.checkIcon}>✓</Text>}
        </View>
      )}
    </View>
  );
};

export default PetCard;
