const mongoose = require('mongoose');

const behaviorProblemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['aggression', 'anxiety', 'barking', 'chewing', 'toilet_training', 'socialization', 'obedience', 'separation_anxiety'],
    required: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'moderate'
  },
  duration: String,
  description: String
});

const petSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  breed: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  age: { type: Number, required: true },
  ageUnit: { type: String, enum: ['year', 'month'], default: 'year' },
  weight: { type: Number, default: 0 },
  behaviorProblems: [behaviorProblemSchema],
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pet', petSchema);
