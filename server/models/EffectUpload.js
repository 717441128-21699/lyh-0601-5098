const mongoose = require('mongoose');

const effectUploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  beforeVideo: String,
  afterVideo: String,
  description: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  behaviorImproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

effectUploadSchema.post('save', async function(doc) {
  try {
    const Trainer = require('./Trainer');
    const trainer = await Trainer.findById(doc.trainerId);
    if (trainer) {
      const newReview = {
        userId: doc.userId,
        rating: doc.rating,
        content: doc.description,
        beforeVideo: doc.beforeVideo,
        afterVideo: doc.afterVideo,
        behaviorImproved: doc.behaviorImproved,
        courseType: 'one_on_one'
      };
      trainer.reviews.push(newReview);
      trainer.courseCount += 1;
      if (doc.behaviorImproved) {
        trainer.successRate = Math.round(((trainer.reviews.filter(r => r.behaviorImproved).length + 1) / (trainer.reviews.length + 1)) * 100);
      }
      await trainer.save();
    }

    const User = require('./User');
    const user = await User.findById(doc.userId);
    if (user) {
      user.memberPoints += doc.rating >= 4 ? 20 : 10;
      await user.save();
    }
  } catch (error) {
    console.error('EffectUpload post save error:', error);
  }
});

module.exports = mongoose.model('EffectUpload', effectUploadSchema);
