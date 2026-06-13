const express = require('express');
const router = express.Router();
const User = require('../models/User');
const EffectUpload = require('../models/EffectUpload');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { mockUser, mockEffectUploads } = require('../data/mockData');
const { checkMemberLevel, calculateUpgradeProgress } = require('../utils');

router.post('/login', async (req, res) => {
  try {
    const { phone, password, code } = req.body;

    if (code) {
      const token = jwt.sign(
        { userId: 'mock-user-id' },
        process.env.JWT_SECRET || 'your-secret-key-here-change-in-production',
        { expiresIn: '30d' }
      );

      return res.json({
        success: true,
        token,
        user: mockUser
      });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({
        phone,
        name: '宠物主人',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
        memberLevel: 'normal',
        memberPoints: 0,
        totalCourses: 0,
        totalSpent: 0
      });

      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      user.memberUpgradeProgress = calculateUpgradeProgress('normal', 0, 0);
      await user.save();
    } else if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-here-change-in-production',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
        memberLevel: user.memberLevel,
        memberPoints: user.memberPoints,
        totalCourses: user.totalCourses,
        totalSpent: user.totalSpent,
        memberUpgradeProgress: user.memberUpgradeProgress
      }
    });
  } catch (error) {
    console.error('[Users] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';

    let user = await User.findById(userId);

    if (!user) {
      user = mockUser;
    }

    res.json(user);
  } catch (error) {
    console.error('[Users] Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';

    let user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    Object.assign(user, req.body);

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    user.memberLevel = checkMemberLevel(user.totalCourses, user.totalSpent);
    user.memberUpgradeProgress = calculateUpgradeProgress(
      user.memberLevel,
      user.totalCourses,
      user.totalSpent
    );

    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      memberLevel: user.memberLevel,
      memberPoints: user.memberPoints,
      totalCourses: user.totalCourses,
      totalSpent: user.totalSpent,
      memberUpgradeProgress: user.memberUpgradeProgress
    });
  } catch (error) {
    console.error('[Users] Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/effect-upload', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';
    const { courseId, trainerId, beforeVideo, afterVideo, description, rating, behaviorImproved } = req.body;

    const effectUpload = new EffectUpload({
      userId,
      courseId,
      trainerId,
      beforeVideo,
      afterVideo,
      description,
      rating,
      behaviorImproved
    });

    await effectUpload.save();

    res.status(201).json({
      success: true,
      effectUpload
    });
  } catch (error) {
    console.error('[Users] Effect upload error:', error);
    res.status(500).json({ error: 'Failed to upload effect' });
  }
});

router.get('/effect-uploads', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';

    let effectUploads = await EffectUpload.find({ userId }).populate('courseId').populate('trainerId');

    if (effectUploads.length === 0) {
      effectUploads = mockEffectUploads.map(e => ({ ...e, userId, _id: e.id }));
    }

    effectUploads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(effectUploads);
  } catch (error) {
    console.error('[Users] Get effect uploads error:', error);
    res.status(500).json({ error: 'Failed to get effect uploads' });
  }
});

module.exports = router;
