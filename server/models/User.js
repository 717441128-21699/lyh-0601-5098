const mongoose = require('mongoose');

const memberUpgradeProgressSchema = new mongoose.Schema({
  currentLevel: {
    type: String,
    enum: ['normal', 'silver', 'gold'],
    default: 'normal'
  },
  nextLevel: {
    type: String,
    enum: ['normal', 'silver', 'gold']
  },
  coursesNeeded: { type: Number, default: 10 },
  coursesCompleted: { type: Number, default: 0 },
  amountNeeded: { type: Number, default: 2000 },
  amountSpent: { type: Number, default: 0 },
  progressPercent: { type: Number, default: 0 }
});

const memberBenefitSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  icon: String,
  available: Boolean
});

const userSchema = new mongoose.Schema({
  nickname: { type: String, required: true },
  avatar: { type: String, default: '' },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  memberLevel: {
    type: String,
    enum: ['normal', 'silver', 'gold'],
    default: 'normal'
  },
  memberPoints: { type: Number, default: 0 },
  totalCourses: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  memberUpgradeProgress: memberUpgradeProgressSchema,
  benefits: [memberBenefitSchema],
  location: {
    city: String,
    district: String,
    latitude: Number,
    longitude: Number
  },
  openid: String,
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  if (!this.memberUpgradeProgress) {
    this.memberUpgradeProgress = {
      currentLevel: this.memberLevel,
      nextLevel: this.memberLevel === 'normal' ? 'silver' : this.memberLevel === 'silver' ? 'gold' : undefined,
      coursesNeeded: this.memberLevel === 'normal' ? 10 : 20,
      coursesCompleted: this.totalCourses,
      amountNeeded: this.memberLevel === 'normal' ? 2000 : 5000,
      amountSpent: this.totalSpent,
      progressPercent: 0
    };
  }

  const progress = this.memberUpgradeProgress;
  if (progress.nextLevel) {
    const courseProgress = Math.min(100, (progress.coursesCompleted / progress.coursesNeeded) * 100);
    const amountProgress = Math.min(100, (progress.amountSpent / progress.amountNeeded) * 100);
    progress.progressPercent = Math.round(Math.max(courseProgress, amountProgress));
  }

  next();
});

module.exports = mongoose.model('User', userSchema);
