const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const { createStore } = require('../db');

// Persistent sign language store with pre-seeded demo data
const memSignLang = createStore('signlang');

// Seed default entries if store is empty
if (memSignLang.size === 0) {
  const defaults = [
    { _id: 'sl1', keyword: 'photosynthesis', videoUrl: 'https://www.youtube.com/embed/UPBMG5EYydo', description: 'Sign for photosynthesis', subject: 'Biology', addedBy: 'system' },
    { _id: 'sl2', keyword: 'water cycle', videoUrl: 'https://www.youtube.com/embed/al-do-HGuIk', description: 'Sign for water cycle', subject: 'Geography', addedBy: 'system' },
    { _id: 'sl3', keyword: 'algebra', videoUrl: 'https://www.youtube.com/embed/MlMozefMezA', description: 'Sign for algebra', subject: 'Mathematics', addedBy: 'system' },
    { _id: 'sl4', keyword: 'gravity', videoUrl: 'https://www.youtube.com/embed/E43-CfukEgs', description: 'Sign for gravity', subject: 'Physics', addedBy: 'system' },
    { _id: 'sl5', keyword: 'cells', videoUrl: 'https://www.youtube.com/embed/8IlzKri08kk', description: 'Sign for biological cells', subject: 'Biology', addedBy: 'system' },
  ];
  defaults.forEach(d => memSignLang.set(d.keyword, d));
}

// GET /api/signlang
router.get('/', auth, async (req, res) => {
  try {
    const { keyword, keywords } = req.query;
    if (keywords) {
      const kwList = keywords.split(',').map(k => k.trim().toLowerCase());
      const results = kwList.map(k => memSignLang.get(k)).filter(Boolean);
      return res.json(results);
    }
    if (keyword) {
      const v = memSignLang.get(keyword.toLowerCase().trim());
      return res.json(v ? [v] : []);
    }
    res.json(memSignLang.toArray());
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/signlang
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const id = String(Date.now());
    const entry = { _id: id, ...req.body, addedBy: req.user._id };
    memSignLang.set(req.body.keyword?.toLowerCase(), entry);
    res.status(201).json(entry);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/signlang/:id
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    for (const [k, v] of memSignLang.entries()) {
      if (v._id === req.params.id) {
        const updated = { ...v, ...req.body };
        memSignLang.set(k, updated);
        return res.json(updated);
      }
    }
    res.status(404).json({ message: 'Not found.' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/signlang/:id
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    for (const [k, v] of memSignLang.entries()) {
      if (v._id === req.params.id) { memSignLang.delete(k); break; }
    }
    res.json({ message: 'Deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
