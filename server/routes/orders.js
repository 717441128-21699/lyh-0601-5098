const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const { generateOrderNo, generateTicketCode } = require('../utils');
const { mockOrders } = require('../data/mockData');

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';

    let orders = await Order.find({ userId }).populate('courseId');

    if (orders.length === 0) {
      orders = mockOrders.map(o => ({ ...o, userId, _id: o.id }));
    }

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(orders);
  } catch (error) {
    console.error('[Orders] GET error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

router.post('/create-payment', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';
    const { courseId, amount, description } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const orderNo = generateOrderNo();

    const order = new Order({
      orderNo,
      userId,
      courseId,
      amount,
      description,
      status: 'pending'
    });
    await order.save();

    res.json({
      orderId: order._id,
      orderNo: order.orderNo,
      amount: order.amount,
      paymentInfo: {
        appId: 'mock-app-id',
        timeStamp: Date.now().toString(),
        nonceStr: Math.random().toString(36).substring(2),
        package: 'prepay_id=mock-prepay-id',
        signType: 'MD5',
        paySign: 'mock-pay-sign'
      }
    });
  } catch (error) {
    console.error('[Orders] Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

router.post('/:id/confirm-payment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'mock-user-id';

    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = 'paid';
    order.paidAt = new Date();
    order.transactionId = 'TXN' + Date.now().toString();
    await order.save();

    const course = await Course.findById(order.courseId);
    if (course) {
      course.status = 'paid';
      course.ticketCode = generateTicketCode();
      await course.save();
    }

    res.json({
      success: true,
      order,
      courseTicket: {
        id: Date.now().toString(),
        orderId: order._id,
        courseId: order.courseId,
        ticketCode: course?.ticketCode || generateTicketCode(),
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${course?.ticketCode || 'TEST'}`,
        status: 'valid'
      }
    });
  } catch (error) {
    console.error('[Orders] Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

router.post('/:id/refund', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'mock-user-id';

    const order = await Order.findOne({ _id: id, userId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'paid') {
      return res.status(400).json({ error: 'Only paid orders can be refunded' });
    }

    order.status = 'refunded';
    order.refundedAt = new Date();
    await order.save();

    const course = await Course.findById(order.courseId);
    if (course) {
      course.status = 'cancelled';
      await course.save();
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('[Orders] Refund error:', error);
    res.status(500).json({ error: 'Failed to refund' });
  }
});

module.exports = router;
