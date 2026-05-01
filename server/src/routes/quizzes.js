const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { createStore, createArrayStore } = require('../db');

// Persistent stores
const memQuizzes = createStore('quizzes');
const memQuizResults = createArrayStore('quiz_results');

// GET /api/quizzes?lessonId=xxx
router.get('/', auth, async (req, res) => {
  try {
    let list = memQuizzes.toArray();
    if (req.query.lessonId) list = list.filter(q => q.lessonId === req.query.lessonId);
    if (req.user.role === 'teacher') list = list.filter(q => q.teacherId === String(req.user._id));
    res.json(list);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/quizzes/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = memQuizzes.get(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    res.json(quiz);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/quizzes
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const id = String(Date.now());
    const questions = (req.body.questions || []).map((q, i) => ({
      ...q, _id: `q${id}_${i}`,
    }));
    const quiz = {
      _id: id, id,
      title: req.body.title || 'Untitled Quiz',
      lessonId: req.body.lessonId || null,
      teacherId: String(req.user._id),
      questions,
      createdAt: new Date().toISOString(),
    };
    memQuizzes.set(id, quiz);
    res.status(201).json(quiz);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/quizzes/:id
router.put('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const quiz = memQuizzes.get(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });
    const updated = { ...quiz, ...req.body };
    if (req.body.questions) {
      updated.questions = req.body.questions.map((q, i) => ({ ...q, _id: q._id || `q${req.params.id}_${i}` }));
    }
    memQuizzes.set(req.params.id, updated);
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/quizzes/:id
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    memQuizzes.delete(req.params.id);
    res.json({ message: 'Quiz deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/quizzes/:id/submit
router.post('/:id/submit', auth, requireRole('student'), async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = memQuizzes.get(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found.' });

    let correct = 0;
    const graded = (quiz.questions || []).map(q => {
      const sub = answers?.find(a => String(a.questionId) === String(q._id));
      const isCorrect = sub?.answer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
      if (isCorrect) correct++;
      return { questionId: q._id, answer: sub?.answer || '', isCorrect };
    });
    const score = quiz.questions.length > 0 ? Math.round((correct / quiz.questions.length) * 100) : 0;
    const result = {
      _id: String(Date.now() + Math.random().toString().slice(2, 6)),
      studentId: String(req.user._id), quizId: quiz._id,
      answers: graded, score, totalQuestions: quiz.questions.length,
      correctCount: correct, timeTaken: timeTaken || 0,
      completedAt: new Date().toISOString(),
    };
    memQuizResults.push(result);
    res.json({ result, score, correctCount: correct, totalQuestions: quiz.questions.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/quizzes/:id/results
router.get('/:id/results', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    res.json(memQuizResults.filter(r => r.quizId === req.params.id));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
module.exports.memQuizzes = memQuizzes;
