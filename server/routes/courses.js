const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Trainer = require('../models/Trainer');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { generateTicketCode, checkMemberLevel, calculateUpgradeProgress } = require('../utils');
const { mockBookings } = require('../data/mockData');

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';
    const { status } = req.query;

    let courses = await Course.find({ userId });

    if (courses.length === 0) {
      courses = mockBookings.map(c => ({ ...c, userId, _id: c.id }));
    }

    if (status && status !== 'all') {
      courses = courses.filter(c => c.status === status);
    }

    courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(courses);
  } catch (error) {
    console.error('[Courses] GET error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'mock-user-id';

    let course = await Course.findOne({ _id: id, userId });

    if (!course) {
      course = mockBookings.find(c => c.id === id);
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('[Courses] GET by id error:', error);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

router.post('/check-conflict', auth, async (req, res) => {
  try {
    const { trainerId, date, slotId } = req.body;

    const existingCourse = await Course.findOne({
      trainerId,
      date,
      'timeSlot.id': slotId,
      status: { $in: ['paid', 'upcoming', 'in_progress'] }
    });

    if (existingCourse) {
      return res.json({
        hasConflict: true,
        message: '该时段已被预约，请选择其他时段'
      });
    }

    res.json({ hasConflict: false, message: '时段可用' });
  } catch (error) {
    console.error('[Courses] Check conflict error:', error);
    res.status(500).json({ error: 'Failed to check conflict' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';
    const courseData = {
      ...req.body,
      userId,
      ticketCode: generateTicketCode()
    };

    const course = new Course(courseData);
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error('[Courses] POST error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

router.post('/:id/check-in', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'mock-user-id';

    const course = await Course.findOne({ _id: id, userId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const now = new Date();
    course.checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    await course.save();

    res.json({ message: 'Check-in successful', checkInTime: course.checkInTime });
  } catch (error) {
    console.error('[Courses] Check-in error:', error);
    res.status(500).json({ error: 'Failed to check in' });
  }
});

router.post('/:id/confirm', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'mock-user-id';

    const course = await Course.findOne({ _id: id, userId });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.ownerConfirmed = true;
    course.settled = true;
    course.status = 'completed';
    await course.save();

    const user = await User.findById(userId);
    if (user) {
      user.totalCourses += 1;
      user.totalSpent += course.price;
      user.memberLevel = checkMemberLevel(user.totalCourses, user.totalSpent);
      user.memberUpgradeProgress = calculateUpgradeProgress(
        user.memberLevel,
        user.totalCourses,
        user.totalSpent
      );
      await user.save();
    }

    res.json({ message: 'Course confirmed and settled', course });
  } catch (error) {
    console.error('[Courses] Confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm course' });
  }
});

router.post('/:id/training-record', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, achievements, issues, nextGoals } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.trainingRecord = {
      id: Date.now().toString(),
      courseId: id,
      trainerId: course.trainerId,
      content,
      achievements: achievements || [],
      issues: issues || [],
      nextGoals: nextGoals || []
    };
    await course.save();

    res.json({ message: 'Training record submitted', trainingRecord: course.trainingRecord });
  } catch (error) {
    console.error('[Courses] Training record error:', error);
    res.status(500).json({ error: 'Failed to submit training record' });
  }
});

router.post('/:id/homework', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { tasks, deadline } = req.body;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    course.homework = {
      id: Date.now().toString(),
      courseId: id,
      tasks: tasks.map((t, i) => ({ ...t, id: (i + 1).toString() })),
      deadline,
      completed: false
    };
    await course.save();

    res.json({ message: 'Homework submitted', homework: course.homework });
  } catch (error) {
    console.error('[Courses] Homework error:', error);
    res.status(500).json({ error: 'Failed to submit homework' });
  }
});

module.exports = router;
