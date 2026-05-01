const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { createStore } = require('../db');

// Persistent JSON file store: server/data/lessons.json
const memLessons = createStore('lessons');
let lessonIdCounter = memLessons.size + 1;

// ─── GET /api/lessons ────────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    let list = memLessons.toArray();
    if (req.user.role === 'teacher') list = list.filter(l => l.teacherId === req.user._id);
    const { search, subject, type } = req.query;
    if (subject) list = list.filter(l => l.subject === subject);
    if (type) list = list.filter(l => l.type === type);
    if (search) list = list.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET /api/lessons/:id ────────────────────────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = memLessons.get(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    lesson.viewCount = (lesson.viewCount || 0) + 1;
    memLessons.set(req.params.id, lesson);
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── POST /api/lessons — create ──────────────────────────────────────────────
router.post('/', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const id = String(lessonIdCounter++);
    const lesson = {
      _id: id, id,
      ...req.body,
      teacherId: req.user._id,
      teacherName: req.user.name,
      viewCount: 0,
      isPublished: true,
      createdAt: new Date().toISOString(),
      tags: req.body.tags
        ? (Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim()))
        : [],
    };
    memLessons.set(id, lesson);
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── PUT /api/lessons/:id ─────────────────────────────────────────────────────
router.put('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const lesson = memLessons.get(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    if (req.user.role === 'teacher' && String(lesson.teacherId) !== String(req.user._id))
      return res.status(403).json({ message: 'Not authorised.' });
    const updated = { ...lesson, ...req.body };
    memLessons.set(req.params.id, updated);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── DELETE /api/lessons/:id ──────────────────────────────────────────────────
router.delete('/:id', auth, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const lesson = memLessons.get(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found.' });
    if (req.user.role === 'teacher' && String(lesson.teacherId) !== String(req.user._id))
      return res.status(403).json({ message: 'Not authorised.' });
    memLessons.delete(req.params.id);
    res.json({ message: 'Lesson deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
module.exports.memLessons = memLessons;
