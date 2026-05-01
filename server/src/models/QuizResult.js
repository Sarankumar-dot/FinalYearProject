const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId },
  answer: { type: String, default: '' },
  isCorrect: { type: Boolean },
}, { _id: false });

const quizResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  answers: [answerSchema],
  score: { type: Number, required: true },       // percentage 0-100
  totalQuestions: { type: Number },
  correctCount: { type: Number },
  timeTaken: { type: Number, default: 0 },       // seconds
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);
