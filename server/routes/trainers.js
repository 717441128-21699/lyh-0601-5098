const express = require('express');
const router = express.Router();
const Trainer = require('../models/Trainer');
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');
const { calculateDistance } = require('../utils');
const { mockTrainers, mockReviews } = require('../data/mockData');

router.get('/', auth, async (req, res) => {
  try {
    const { specialty, mode, sortBy = 'rating' } = req.query;
    const userId = req.userId || 'mock-user-id';

    let trainers = await Trainer.find();

    if (trainers.length === 0) {
      trainers = mockTrainers.map(t => ({ ...t, _id: t.id }));
    }

    if (specialty && specialty !== 'all') {
      trainers = trainers.filter(t => t.specialties.includes(specialty));
    }

    if (mode && mode !== 'all') {
      if (mode === 'online') {
        trainers = trainers.filter(t => t.onlineAvailable);
      } else if (mode === 'offline') {
        trainers = trainers.filter(t => t.offlineAvailable);
      }
    }

    trainers = trainers.map(t => {
      const trainerObj = t.toObject ? t.toObject() : t;
      trainerObj.distance = Math.round(Math.random() * 10 + 1);
      return trainerObj;
    });

    if (sortBy === 'rating') {
      trainers.sort((a, b) => b.starRating - a.starRating);
    } else if (sortBy === 'distance') {
      trainers.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'price') {
      trainers.sort((a, b) => a.pricePerHour - b.pricePerHour);
    }

    res.json(trainers);
  } catch (error) {
    console.error('[Trainers] GET error:', error);
    res.status(500).json({ error: 'Failed to get trainers' });
  }
});

router.get('/recommended/:petId', auth, async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.userId || 'mock-user-id';

    let pet = await Pet.findById(petId);
    if (!pet) {
      pet = { ...require('../data/mockData').mockPets.find(p => p.id === petId) };
    }

    const petProblems = pet?.behaviorProblems?.map(bp => bp.type) || [];

    let trainers = await Trainer.find();
    if (trainers.length === 0) {
      trainers = mockTrainers.map(t => ({ ...t, _id: t.id }));
    }

    const scored = trainers.map((trainer) => {
      const trainerObj = trainer.toObject ? trainer.toObject() : trainer;
      const matchCount = trainerObj.specialties.filter(s =>
        petProblems.includes(s)
      ).length;
      const distance = Math.round(Math.random() * 10 + 1);
      return {
        ...trainerObj,
        distance,
        score: matchCount * 10 + trainerObj.starRating * 2 - distance
      };
    });

    scored.sort((a, b) => b.score - a.score);

    res.json(scored.slice(0, 5));
  } catch (error) {
    console.error('[Trainers] GET recommended error:', error);
    res.status(500).json({ error: 'Failed to get recommended trainers' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    let trainer = await Trainer.findById(id);

    if (!trainer) {
      trainer = mockTrainers.find(t => t.id === id);
    }

    if (!trainer) {
      return res.status(404).json({ error: 'Trainer not found' });
    }

    const trainerObj = trainer.toObject ? trainer.toObject() : trainer;
    trainerObj.distance = Math.round(Math.random() * 10 + 1);

    res.json(trainerObj);
  } catch (error) {
    console.error('[Trainers] GET by id error:', error);
    res.status(500).json({ error: 'Failed to get trainer' });
  }
});

router.get('/:id/reviews', auth, async (req, res) => {
  try {
    const { id } = req.params;

    let trainer = await Trainer.findById(id);
    let reviews = [];

    if (trainer && trainer.reviews && trainer.reviews.length > 0) {
      reviews = trainer.reviews;
    } else {
      reviews = mockReviews.filter(r => r.trainerId === id);
    }

    res.json(reviews);
  } catch (error) {
    console.error('[Trainers] GET reviews error:', error);
    res.status(500).json({ error: 'Failed to get trainer reviews' });
  }
});

module.exports = router;
