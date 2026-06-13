import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Textarea,
  ScrollView,
  Image,
  Video
} from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { Course } from '@/types';
import StarRating from '@/components/StarRating';
import { courseApi, userApi } from '@/services/api';
import { formatDate } from '@/utils';

const EffectUploadPage: React.FC = () => {
  const router = useRouter();
  const courseId = router.params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [beforeVideo, setBeforeVideo] = useState('');
  const [afterVideo, setAfterVideo] = useState('');
  const [rating, setRating] = useState(5);
  const [behaviorImproved, setBehaviorImproved] = useState<boolean | null>(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCourseDetail();
  }, [courseId]);

  const loadCourseDetail = useCallback(async () => {
    setLoading(true);
    try {
      const result = await courseApi.getCourseById(courseId);
      setCourse(result);
    } catch (error) {
      console.error('[EffectUpload] loadCourseDetail error:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const handleChooseVideo = async (type: 'before' | 'after') => {
    try {
      const res = await Taro.chooseVideo({
        sourceType: ['album', 'camera'],
        maxDuration: 30,
        compressed: true,
        camera: 'back'
      });

      if (type === 'before') {
        setBeforeVideo(res.tempFilePath);
      } else {
        setAfterVideo(res.tempFilePath);
      }
    } catch (error) {
      console.error('[EffectUpload] handleChooseVideo error:', error);
    }
  };

  const handleRemoveVideo = (type: 'before' | 'after') => {
    if (type === 'before') {
      setBeforeVideo('');
    } else {
      setAfterVideo('');
    }
  };

  const canSubmit = rating > 0 && behaviorImproved !== null && description.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || !course || submitting) return;

    setSubmitting(true);
    try {
      const effectData = {
        courseId,
        trainerId: course.trainerId,
        beforeVideo,
        afterVideo,
        description,
        rating,
        behaviorImproved: behaviorImproved || false
      };

      await userApi.uploadEffect(effectData);

      Taro.showToast({ title: '上传成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    } catch (error) {
      console.error('[EffectUpload] handleSubmit error:', error);
      Taro.showToast({ title: '上传失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderVideoBox = (type: 'before' | 'after', videoUrl: string) => {
    const label = type === 'before' ? '训练前' : '训练后';
    const placeholder = type === 'before' ? '📹' : '🎬';

    return (
      <View className={styles.videoUploadItem}>
        <Text className={styles.videoLabel}>{label}</Text>
        <View className={styles.videoBox} onClick={() => !videoUrl && handleChooseVideo(type)}>
          {videoUrl ? (
            <>
              <View className={styles.videoPreview}>
                <Video src={videoUrl} showCenterPlayBtn />
              </View>
              <View className={styles.removeBtn} onClick={(e) => {
                e.stopPropagation();
                handleRemoveVideo(type);
              }}>
                <Text>×</Text>
              </View>
            </>
          ) : (
            <View className={styles.videoPlaceholder}>
              <Text className={styles.videoIcon}>{placeholder}</Text>
              <Text className={styles.videoText}>点击上传</Text>
              <Text className={styles.videoHint}>最长30秒</Text>
            </View>
          )}
        </View>
      </View>
    );
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

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        {course && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>📋</Text>
              <Text>课程信息</Text>
            </View>
            <View className={styles.trainingInfo}>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>训导师</Text>
                <Text className={styles.infoValue}>{course.trainerName}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>参训宠物</Text>
                <Text className={styles.infoValue}>{course.petName}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>课程日期</Text>
                <Text className={styles.infoValue}>{formatDate(course.date)}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>课程类型</Text>
                <Text className={styles.infoValue}>{course.type === 'one_on_one' ? '一对一' : '小班课程'}</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🎬</Text>
            <Text>效果对比视频</Text>
          </View>
          <View className={styles.videoUploadArea}>
            {renderVideoBox('before', beforeVideo)}
            {renderVideoBox('after', afterVideo)}
          </View>
          <Text className={styles.tipText}>
            💡 提示：上传训练前后的对比视频，可以更直观地展示训练效果，帮助其他主人参考。
          </Text>

          <View className={styles.benefitTip}>
            <Text className={styles.benefitIcon}>🎁</Text>
            <Text className={styles.benefitText}>
              上传有效效果视频，可获得会员积分奖励，积分可用于兑换免费复训机会！
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>⭐</Text>
            <Text>训练评价</Text>
          </View>
          <View className={styles.starRatingSection}>
            <Text className={styles.ratingLabel}>请为本次训练打分</Text>
            <StarRating
              rating={rating}
              size={48}
              interactive
              onChange={setRating}
            />
            <Text className={styles.ratingValue}>
              {rating === 5 ? '非常满意' : rating === 4 ? '满意' : rating === 3 ? '一般' : rating === 2 ? '不满意' : '非常不满意'}
            </Text>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>✅</Text>
            <Text>行为是否改善</Text>
          </View>
          <View className={styles.improvementToggle}>
            <View
              className={`${styles.improvementOption} ${behaviorImproved === true ? styles.selected : ''}`}
              onClick={() => setBehaviorImproved(true)}
            >
              <Text className={styles.improvementIcon}>😊</Text>
              <Text className={styles.improvementText}>有明显改善</Text>
              <Text className={styles.improvementDesc}>训练效果很好，宠物行为有积极变化</Text>
            </View>
            <View
              className={`${styles.improvementOption} ${behaviorImproved === false ? styles.selected : ''}`}
              onClick={() => setBehaviorImproved(false)}
            >
              <Text className={styles.improvementIcon}>🤔</Text>
              <Text className={styles.improvementText}>待观察</Text>
              <Text className={styles.improvementDesc}>需要更多时间观察效果</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📝</Text>
            <Text>效果描述</Text>
          </View>
          <Textarea
            className={styles.descriptionTextarea}
            placeholder="请详细描述训练效果，包括宠物的行为变化、改进之处、以及对训导师的建议..."
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
          <Text className={styles.charCount}>{description.length}/500</Text>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={`${styles.submitBtn} ${!canSubmit || submitting ? styles.disabled : ''}`}
          onClick={canSubmit && !submitting ? handleSubmit : undefined}
        >
          <Text>{submitting ? '提交中...' : '提交评价'}</Text>
        </View>
      </View>
    </View>
  );
};

export default EffectUploadPage;
