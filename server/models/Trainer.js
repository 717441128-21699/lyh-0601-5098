const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  id: String,
  startTime: String,
  endTime: String,
  available: { type: Boolean, default: true },
  courseType: {
    type: String,
    enum: ['one_on_one', 'small_group']
  }
});

const trainerScheduleSchema = new mongoose.Schema({
  id: String,
  date: String,
  timeSlots: [timeSlotSchema]
});

const trainerReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  userAvatar: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: String,
  beforeVideo: String,
  afterVideo: String,
  createdAt: { type: Date, default: Date.now },
  courseType: String,
  behaviorImproved: Boolean
});

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  title: { type: String, required: true },
  starRating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  experienceYears: { type: Number, required: true },
  specialties: [{
    type: String,
    enum: ['aggression', 'anxiety', 'barking', 'chewing', 'toilet_training', 'socialization', 'obedience', 'separation_anxiety']
  }],
  certifications: [String],
  introduction: String,
  location: {
    city: String,
    district: String,
    address: String,
    latitude: Number,
    longitude: Number
  },
  distance: Number,
  pricePerHour: { type: Number, required: true },
  onlineAvailable: { type: Boolean, default: false },
  offlineAvailable: { type: Boolean, default: true },
  schedule: [trainerScheduleSchema],
  courseCount: { type: Number, default: 0 },
  successRate: { type: Number, default: 0, min: 0, max: 100 },
  satisfactionRate: { type: Number, default: 0, min: 0, max: 100 },
  reviews: [trainerReviewSchema],
  createdAt: { type: Date, default: Date.now }
});

trainerSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.starRating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.reviewCount = this.reviews.length;
    this.satisfactionRate = Math.round((this.reviews.filter(r => r.rating >= 4).length / this.reviews.length) * 100);
  }
  next();
});

module.exports = mongoose.model('Trainer', trainerSchema);
