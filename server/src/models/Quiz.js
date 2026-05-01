const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['multiple-choice', 'true-false', 'short-answer'], required: true },
  options: [{ type: String }],       // for multiple-choice
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  questions: [questionSchema],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeLimit: { type: Number, default: 0 },  // minutes, 0 = no limit
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
