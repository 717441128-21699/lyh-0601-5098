import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  Textarea,
  ScrollView
} from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { Trainer, Pet, CourseType, CourseMode, TimeSlot } from '@/types';
import { CourseTypeLabels, CourseModeLabels } from '@/types/course';
import { MemberLevelLabels } from '@/types/user';
import { trainerApi, courseApi, orderApi } from '@/services/api';
import { useUserStore } from '@/store/useUserStore';
import { formatDate } from '@/utils';

const CourseBookingPage: React.FC = () => {
  const router = useRouter();
  const trainerId = router.params.trainerId as string;
  const date = router.params.date as string;
  const slotId = router.params.slotId as string;

  const userStore = useUserStore();
  const user = userStore.user;
  const pets = userStore.pets;

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [courseType, setCourseType] = useState<CourseType>('one_on_one');
  const [courseMode, setCourseMode] = useState<CourseMode>('offline');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTrainerDetail();
    userStore.fetchPets();
  }, [trainerId]);

  useEffect(() => {
    if (trainer && slotId) {
      const schedule = trainer.schedule.find((s) => s.date === date);
      if (schedule) {
        const slot = schedule.timeSlots.find((s) => s.id === slotId);
        if (slot) {
          setSelectedSlot(slot);
          if (slot.courseType) {
            setCourseType(slot.courseType);
          }
        }
      }
    }
  }, [trainer, date, slotId]);

  useEffect(() => {
    if (pets.length > 0 && !selectedPet) {
      setSelectedPet(pets[0]);
    }
  }, [pets]);

  const loadTrainerDetail = useCallback(async () => {
    setLoading(true);
    try {
      const result = await trainerApi.getTrainerById(trainerId);
      setTrainer(result);
      if (result.offlineAvailable) {
        setCourseMode('offline');
      } else if (result.onlineAvailable) {
        setCourseMode('online');
      }
    } catch (error) {
      console.error('[CourseBooking] loadTrainerDetail error:', error);
    } finally {
      setLoading(false);
    }
  }, [trainerId]);

  const totalPrice = useMemo(() => {
    if (!trainer || !selectedSlot) return 0;
    const basePrice = trainer.pricePerHour;
    const duration = selectedSlot.endTime > selectedSlot.startTime
      ? (parseInt(selectedSlot.endTime.split(':')[0]) * 60 + parseInt(selectedSlot.endTime.split(':')[1]) -
         parseInt(selectedSlot.startTime.split(':')[0]) * 60 - parseInt(selectedSlot.startTime.split(':')[1])) / 60
      : 1;
    const typeMultiplier = courseType === 'small_group' ? 0.7 : 1;
    const memberDiscount = user?.memberLevel === 'gold' ? 0.85 : user?.memberLevel === 'silver' ? 0.9 : 1;
    return Math.round(basePrice * duration * typeMultiplier * memberDiscount);
  }, [trainer, selectedSlot, courseType, user]);

  const originalPrice = useMemo(() => {
    if (!trainer || !selectedSlot) return 0;
    const basePrice = trainer.pricePerHour;
    const duration = selectedSlot.endTime > selectedSlot.startTime
      ? (parseInt(selectedSlot.endTime.split(':')[0]) * 60 + parseInt(selectedSlot.endTime.split(':')[1]) -
         parseInt(selectedSlot.startTime.split(':')[0]) * 60 - parseInt(selectedSlot.startTime.split(':')[1])) / 60
      : 1;
    const typeMultiplier = courseType === 'small_group' ? 0.7 : 1;
    return Math.round(basePrice * duration * typeMultiplier);
  }, [trainer, selectedSlot, courseType]);

  const discount = originalPrice - totalPrice;

  const canSubmit = trainer && selectedPet && selectedSlot && totalPrice > 0;

  const handleAddPet = () => {
    Taro.navigateTo({ url: '/pages/pet-add/index' });
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      const courseData = {
        trainerId: trainer!.id,
        trainerName: trainer!.name,
        trainerAvatar: trainer!.avatar,
        petId: selectedPet!.id,
        petName: selectedPet!.name,
        type: courseType,
        mode: courseMode,
        date,
        startTime: selectedSlot!.startTime,
        endTime: selectedSlot!.endTime,
        duration: 60,
        price: totalPrice,
        location: courseMode === 'offline' ? `${trainer!.location.city}${trainer!.location.district}${trainer!.location.address}` : undefined,
        meetingUrl: courseMode === 'online' ? 'https://meeting.example.com/123456' : undefined,
        notes
      };

      const conflictResult = await courseApi.checkConflict(trainer!.id, date, selectedSlot!.id);
      if (conflictResult.hasConflict) {
        Taro.showToast({ title: conflictResult.message, icon: 'none' });
        return;
      }

      const course = await courseApi.createCourse(courseData);
      const order = await orderApi.createOrder({
        courseId: course.id,
        amount: totalPrice,
        description: `${trainer!.name} - ${CourseTypeLabels[courseType]}课程`
      });

      Taro.showModal({
        title: '确认支付',
        content: `需要支付 ¥${totalPrice}`,
        success: async (res) => {
          if (res.confirm) {
            await orderApi.payOrder(order.id, { paymentMethod: 'wechat' });
            Taro.showToast({ title: '预约成功', icon: 'success' });
            setTimeout(() => {
              Taro.redirectTo({ url: `/pages/course-detail/index?id=${course.id}` });
            }, 1500);
          } else {
            Taro.redirectTo({ url: `/pages/course-detail/index?id=${course.id}` });
          }
        }
      });
    } catch (error) {
      console.error('[CourseBooking] handleSubmit error:', error);
      Taro.showToast({ title: '预约失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !trainer) {
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
        {trainer && (
          <View className={styles.section}>
            <View className={styles.sectionTitle}>
              <Text className={styles.sectionTitleIcon}>👨‍🏫</Text>
              <Text>训导师</Text>
            </View>
            <View className={styles.trainerCard}>
              <View className={styles.trainerAvatar}>
                <Image src={trainer.avatar} mode="aspectFill" />
              </View>
              <View className={styles.trainerInfo}>
                <Text className={styles.trainerName}>{trainer.name}</Text>
                <Text className={styles.trainerTitle}>{trainer.title}</Text>
              </View>
            </View>
          </View>
        )}

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🐕</Text>
            <Text>选择宠物</Text>
          </View>
          <View className={styles.petSelector}>
            <ScrollView scrollX className={styles.petList}>
              {pets.map((pet) => (
                <View
                  key={pet.id}
                  className={`${styles.petItem} ${selectedPet?.id === pet.id ? styles.selected : ''}`}
                  onClick={() => setSelectedPet(pet)}
                >
                  <View className={styles.petAvatar}>
                    <Image src={pet.avatar} mode="aspectFill" />
                  </View>
                  <Text className={styles.petName}>{pet.name}</Text>
                  <Text className={styles.petBreed}>{pet.breed}</Text>
                </View>
              ))}
              <View className={styles.petItem} onClick={handleAddPet}>
                <View className={styles.addPetBtn}>
                  <Text>+</Text>
                </View>
                <Text className={styles.petName}>添加宠物</Text>
              </View>
            </ScrollView>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📋</Text>
            <Text>课程类型</Text>
          </View>
          <View className={styles.typeSelector}>
            <View
              className={`${styles.typeOption} ${courseType === 'one_on_one' ? styles.selected : ''}`}
              onClick={() => setCourseType('one_on_one')}
            >
              <Text className={styles.typeIcon}>🎯</Text>
              <Text className={styles.typeName}>一对一</Text>
              <Text className={styles.typeDesc}>专属定制训练方案</Text>
              <Text className={styles.typePrice}>¥{trainer?.pricePerHour || 0}/小时</Text>
            </View>
            <View
              className={`${styles.typeOption} ${courseType === 'small_group' ? styles.selected : ''}`}
              onClick={() => setCourseType('small_group')}
            >
              <Text className={styles.typeIcon}>👥</Text>
              <Text className={styles.typeName}>小班课程</Text>
              <Text className={styles.typeDesc}>3-5只宠物互动训练</Text>
              <Text className={styles.typePrice}>¥{Math.round((trainer?.pricePerHour || 0) * 0.7)}/小时</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🎥</Text>
            <Text>上课方式</Text>
          </View>
          <View className={styles.modeSelector}>
            <View
              className={`${styles.modeOption} ${courseMode === 'online' ? styles.selected : ''} ${!trainer?.onlineAvailable ? styles.disabled : ''}`}
              onClick={() => trainer?.onlineAvailable && setCourseMode('online')}
            >
              <Text className={styles.modeIcon}>📹</Text>
              <Text className={styles.modeName}>线上视频</Text>
              <Text className={styles.modeDesc}>视频连线远程指导</Text>
            </View>
            <View
              className={`${styles.modeOption} ${courseMode === 'offline' ? styles.selected : ''} ${!trainer?.offlineAvailable ? styles.disabled : ''}`}
              onClick={() => trainer?.offlineAvailable && setCourseMode('offline')}
            >
              <Text className={styles.modeIcon}>🏠</Text>
              <Text className={styles.modeName}>线下当面</Text>
              <Text className={styles.modeDesc}>到店或上门服务</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>🕐</Text>
            <Text>预约时间</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>日期</Text>
            <Text className={styles.infoValue}>{formatDate(date)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时段</Text>
            <Text className={styles.infoValue}>{selectedSlot?.startTime} - {selectedSlot?.endTime}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>课程类型</Text>
            <Text className={styles.infoValue}>{CourseTypeLabels[courseType]}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>上课方式</Text>
            <Text className={styles.infoValue}>{CourseModeLabels[courseMode]}</Text>
          </View>
          {courseMode === 'offline' && trainer && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>上课地点</Text>
              <Text className={styles.infoValue}>{trainer.location.address}</Text>
            </View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📝</Text>
            <Text>备注信息</Text>
          </View>
          <Textarea
            className={styles.notesTextarea}
            placeholder="请填写特殊需求或注意事项..."
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
            maxlength={500}
          />
        </View>

        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>💰</Text>
            <Text>费用明细</Text>
          </View>
          <View className={styles.priceBreakdown}>
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel}>课程费用</Text>
              <Text className={styles.priceValue}>¥{originalPrice}</Text>
            </View>
            {discount > 0 && (
              <View className={styles.priceRow}>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text className={styles.priceLabel}>会员优惠</Text>
                  <Text className={styles.discountTag}>{MemberLevelLabels[user?.memberLevel || 'normal']}</Text>
                </View>
                <Text className={styles.priceValue} style={{ color: '#4ECDC4' }}>-¥{discount}</Text>
              </View>
            )}
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel}>实付金额</Text>
              <Text className={styles.totalPrice}>¥{totalPrice}</Text>
            </View>
          </View>
          {user && user.memberLevel !== 'normal' && (
            <View className={styles.memberBenefit}>
              <Text className={styles.memberIcon}>🎁</Text>
              <Text className={styles.memberText}>
                {MemberLevelLabels[user.memberLevel]}专享优惠已生效，升级金卡享更多权益
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.totalSection}>
          <Text className={styles.totalLabel}>合计:</Text>
          <Text className={styles.totalAmount}>¥{totalPrice}</Text>
        </View>
        <View
          className={`${styles.payBtn} ${!canSubmit || submitting ? styles.disabled : ''}`}
          onClick={canSubmit && !submitting ? handleSubmit : undefined}
        >
          <Text>{submitting ? '提交中...' : '确认预约'}</Text>
        </View>
      </View>
    </View>
  );
};

export default CourseBookingPage;
