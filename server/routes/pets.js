const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const auth = require('../middleware/auth');
const { mockPets } = require('../data/mockData');

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';
    let pets = await Pet.find({ userId });

    if (pets.length === 0) {
      pets = mockPets.map(p => ({ ...p, userId, _id: p.id }));
    }

    res.json(pets);
  } catch (error) {
    console.error('[Pets] GET error:', error);
    res.status(500).json({ error: 'Failed to get pets' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'mock-user-id';

    let pet = await Pet.findOne({ _id: id, userId });

    if (!pet) {
      pet = mockPets.find(p => p.id === id);
    }

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('[Pets] GET by id error:', error);
    res.status(500).json({ error: 'Failed to get pet' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const userId = req.userId || 'mock-user-id';
    const petData = {
      ...req.body,
      userId
    };

    const pet = new Pet(petData);
    await pet.save();

    res.status(201).json(pet);
  } catch (error) {
    console.error('[Pets] POST error:', error);
    res.status(500).json({ error: 'Failed to create pet' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'mock-user-id';

    const pet = await Pet.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(pet);
  } catch (error) {
    console.error('[Pets] PUT error:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || 'mock-user-id';

    const pet = await Pet.findOneAndDelete({ _id: id, userId });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('[Pets] DELETE error:', error);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
});

module.exports = router;
