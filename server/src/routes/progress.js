const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { createStore, createArrayStore } = require('../db');

// Persistent stores
const memProgress = createStore('progress');
const memQuizResults = createArrayStore('quiz_results');

function getOrCreateProgress(studentId) {
  if (!memProgress.has(studentId)) {
    memProgress.set(studentId, {
      studentId, lessonsCompleted: [], bookmarks: [],
      totalTimeSpent: 0, lastActive: new Date().toISOString(),
    });
  }
  return memProgress.get(studentId);
}

// GET /api/progress
router.get('/', auth, requireRole('student'), async (req, res) => {
  try {
    const progress = getOrCreateProgress(String(req.user._id));
    const quizResults = memQuizResults.filter(r => r.studentId === String(req.user._id));
    res.json({ progress, quizResults });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/progress/lesson-complete
router.post('/lesson-complete', auth, requireRole('student'), async (req, res) => {
  try {
    const sid = String(req.user._id);
    const progress = getOrCreateProgress(sid);
    if (!progress.lessonsCompleted.find(l => l.lessonId === req.body.lessonId)) {
      progress.lessonsCompleted.push({ lessonId: req.body.lessonId, completedAt: new Date().toISOString() });
    }
    progress.totalTimeSpent += req.body.timeSpent || 0;
    progress.lastActive = new Date().toISOString();
    memProgress.set(sid, progress);
    res.json(progress);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/progress/bookmark
router.post('/bookmark', auth, requireRole('student'), async (req, res) => {
  try {
    const sid = String(req.user._id);
    const progress = getOrCreateProgress(sid);
    if (req.body.action === 'add') {
      if (!progress.bookmarks.includes(req.body.lessonId)) progress.bookmarks.push(req.body.lessonId);
    } else {
      progress.bookmarks = progress.bookmarks.filter(b => b !== req.body.lessonId);
    }
    memProgress.set(sid, progress);
    res.json(progress);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/progress/teacher-stats
router.get('/teacher-stats', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    res.json([]);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
module.exports.memProgress = memProgress;
module.exports.memQuizResults = memQuizResults;
