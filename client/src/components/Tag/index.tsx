import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface TagProps {
  text: string;
  type?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium';
  className?: string;
}

const Tag: React.FC<TagProps> = ({
  text,
  type = 'default',
  size = 'small',
  className
}) => {
  return (
    <View
      className={classnames(
        styles.tag,
        styles[type],
        styles[size],
        className
      )}
    >
      <Text className={styles.text}>{text}</Text>
    </View>
  );
};

export default Tag;
