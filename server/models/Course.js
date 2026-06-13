const mongoose = require('mongoose');

const trainingRecordSchema = new mongoose.Schema({
  id: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },
  content: String,
  achievements: [String],
  issues: [String],
  nextGoals: [String],
  createdAt: { type: Date, default: Date.now }
});

const homeworkTaskSchema = new mongoose.Schema({
  id: String,
  description: String,
  frequency: String,
  duration: String,
  completed: { type: Boolean, default: false }
});

const homeworkSchema = new mongoose.Schema({
  id: String,
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  tasks: [homeworkTaskSchema],
  deadline: String,
  completed: { type: Boolean, default: false },
  completedAt: Date
});

const courseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },
  trainerName: String,
  trainerAvatar: String,
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  petName: String,
  type: {
    type: String,
    enum: ['one_on_one', 'small_group'],
    required: true
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'upcoming', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, default: 60 },
  price: { type: Number, required: true },
  location: String,
  meetingUrl: String,
  ticketCode: String,
  checkInTime: String,
  trainingRecord: trainingRecordSchema,
  homework: homeworkSchema,
  ownerConfirmed: { type: Boolean, default: false },
  settled: { type: Boolean, default: false },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

courseSchema.pre('save', function(next) {
  const now = new Date();
  const courseDate = new Date(`${this.date}T${this.startTime}`);
  const thirtyMinutesBefore = new Date(courseDate.getTime() - 30 * 60 * 1000);

  if (this.status === 'paid' && now >= thirtyMinutesBefore && now < courseDate) {
    this.status = 'upcoming';
  } else if (this.status === 'upcoming' && now >= courseDate) {
    this.status = 'in_progress';
  }

  next();
});

module.exports = mongoose.model('Course', courseSchema);
