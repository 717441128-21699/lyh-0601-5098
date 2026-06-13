import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image
} from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { Order, Course, OrderStatus } from '@/types';
import { orderApi, courseApi } from '@/services/api';
import StarRating from '@/components/StarRating';
import Tag from '@/components/Tag';
import EmptyState from '@/components/EmptyState';

const tabList = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待支付' },
  { key: 'paid', label: '已支付' },
  { key: 'refunded', label: '已退款' }
];

const statusTextMap: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  refunded: '已退款',
  cancelled: '已取消'
};

const statusColorMap: Record<OrderStatus, string> = {
  pending: 'warning',
  paid: 'success',
  refunded: 'default',
  cancelled: 'default'
};

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [coursesMap, setCoursesMap] = useState<Record<string, Course>>({});
  const [loading, setLoading] = useState(false);

  useDidShow(() => {
    loadOrders();
  });

  const loadOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await orderApi.getUserOrders();
      setOrders(allOrders);

      const courseIds = [...new Set(allOrders.map((o) => o.courseId))];
      const map: Record<string, Course> = {};
      for (const cid of courseIds) {
        try {
          const course = await courseApi.getCourseById(cid);
          map[cid] = course;
        } catch (e) {
          console.error('[Orders] load course error:', cid, e);
        }
      }
      setCoursesMap(map);
    } catch (error) {
      console.error('[Orders] loadOrders error:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const handleGoCourse = (courseId: string) => {
    Taro.navigateTo({ url: `/pages/course-detail/index?id=${courseId}` });
  };

  const handleGoTrainer = (trainerId: string) => {
    Taro.navigateTo({ url: `/pages/trainer-detail/index?id=${trainerId}` });
  };

  const handlePay = async (order: Order) => {
    Taro.showModal({
      title: '确认支付',
      content: `需支付 ¥${order.amount}`,
      success: async (res) => {
        if (res.confirm) {
          try {
            await orderApi.payOrder(order.id, { paymentMethod: 'wechat' });
            Taro.showToast({ title: '支付成功', icon: 'success' });
            loadOrders();
          } catch (e) {
            console.error('[Orders] pay error:', e);
            Taro.showToast({ title: '支付失败', icon: 'none' });
          }
        }
      }
    });
  };

  const handleViewTicket = (order: Order) => {
    Taro.navigateTo({ url: `/pages/course-detail/index?id=${order.courseId}` });
  };

  const renderOrderCard = (order: Order) => {
    const course = coursesMap[order.courseId];
    if (!course) return null;

    return (
      <View key={order.id} className={styles.orderCard} onClick={() => handleGoCourse(course.id)}>
        <View className={styles.orderHeader}>
          <Text className={styles.orderNo}>订单号：{order.orderNo}</Text>
          <Tag
            type={statusColorMap[order.status] as any}
            size="small"
            text={statusTextMap[order.status]}
          />
        </View>

        <View className={styles.orderBody}>
          <Image
            className={styles.trainerAvatar}
            src={course.trainerAvatar}
            mode="aspectFill"
          />
          <View className={styles.orderInfo}>
            <Text className={styles.trainerName}>{course.trainerName}</Text>
            <Text className={styles.courseInfo}>
              {course.type === 'one_on_one' ? '一对一' : '小班课'}
              {' · '}
              {course.mode === 'offline' ? '线下' : '线上'}
            </Text>
            <Text className={styles.petInfo}>🐾 {course.petName}</Text>
            <Text className={styles.timeInfo}>
              📅 {course.date} {course.startTime}-{course.endTime}
            </Text>
          </View>
          <View className={styles.priceCol}>
            <Text className={styles.price}>¥{order.amount}</Text>
          </View>
        </View>

        {order.ticket && order.status === 'paid' && (
          <View className={styles.ticketRow} onClick={(e) => { e.stopPropagation(); handleViewTicket(order); }}>
            <Text className={styles.ticketLabel}>🎫 电子课程票</Text>
            <Text className={styles.ticketCode}>{order.ticket.code}</Text>
            <Text className={styles.ticketAction}>查看 ›</Text>
          </View>
        )}

        <View className={styles.orderFooter}>
          <Text className={styles.createTime}>
            {new Date(order.createdAt).toLocaleString('zh-CN')}
          </Text>
          <View className={styles.footerActions}>
            {order.status === 'pending' && (
              <View
                className={styles.payBtn}
                onClick={(e) => { e.stopPropagation(); handlePay(order); }}
              >
                <Text>立即支付</Text>
              </View>
            )}
            {order.status === 'paid' && (
              <View
                className={styles.detailBtn}
                onClick={(e) => { e.stopPropagation(); handleGoTrainer(course.trainerId); }}
              >
                <Text>训导师详情</Text>
              </View>
            )}
            {order.status === 'refunded' && (
              <View className={styles.refundBtn}>
                <Text>退款详情</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabBar}>
        {tabList.map((tab) => (
          <View
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
            {activeTab === tab.key && <View className={styles.tabIndicator} />}
          </View>
        ))}
      </View>

      <ScrollView className={styles.content} scrollY>
        {loading ? (
          <View className={styles.loading}>
            <Text>加载中...</Text>
          </View>
        ) : filteredOrders.length > 0 ? (
          <View className={styles.orderList}>
            {filteredOrders.map((order) => renderOrderCard(order))}
          </View>
        ) : (
          <EmptyState
            title="暂无订单"
            description="快去预约心仪的训导师吧"
            actionText="去预约"
            onAction={() => Taro.switchTab({ url: '/pages/trainers/index' })}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersPage;
