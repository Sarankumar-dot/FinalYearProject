const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  completedAt: { type: Date },
  timeSpent: { type: Number, default: 0 },   // seconds
  lastPosition: { type: Number, default: 0 }, // seconds into video
}, { _id: false });

const progressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  lessonsCompleted: [lessonProgressSchema],
  totalTimeSpent: { type: Number, default: 0 }, // seconds
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  quizResults: [{ type: mongoose.Schema.Types.ObjectId, ref: 'QuizResult' }],
  streakDays: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
