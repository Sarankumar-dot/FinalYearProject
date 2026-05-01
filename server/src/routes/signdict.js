const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createStore } = require('../db');

// Load seed data and persistent store
const seedData = require('../data/signDictionaryData');
const signDict = createStore('signdict');

// Seed dictionary if empty
if (signDict.size === 0) {
  for (const [word, data] of Object.entries(seedData)) {
    signDict.set(word, data);
  }
  console.log(`🤟 Sign dictionary seeded with ${Object.keys(seedData).length} words`);
}

// Simple text cache for computed timelines
const timelineCache = createStore('signdict-cache');

// ── GET /api/signdict/word/:word — single word animation ────────────────────
router.get('/word/:word', auth, (req, res) => {
  try {
    const word = req.params.word.toLowerCase().trim();
    const entry = signDict.get(word);

    if (entry) {
      return res.json({ word, frames: entry.frames, gloss: entry.gloss, found: true });
    }

    // Word not in dictionary — return empty (client will fingerspell)
    res.json({ word, frames: [], found: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/signdict/text?text=... — full text timeline ────────────────────
router.get('/text', auth, (req, res) => {
  try {
    const text = (req.query.text || '').trim();
    if (!text) return res.json({ words: [], totalFrames: 0 });

    // Check cache
    const cacheKey = text.substring(0, 200).toLowerCase();
    const cached = timelineCache.get(cacheKey);
    if (cached) return res.json(cached);

    // Build timeline
    const rawWords = text
      .replace(/[^a-zA-Z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 0)
      .slice(0, 200);

    const words = rawWords.map(w => {
      const key = w.toLowerCase();
      const entry = signDict.get(key);
      return {
        word: key,
        found: !!entry,
        gloss: entry?.gloss || key.toUpperCase(),
        frames: entry?.frames || [],
      };
    });

    const totalFrames = words.reduce((sum, w) => sum + (w.found ? w.frames.length : w.word.length * 2), 0);
    const result = { words, totalFrames };

    // Cache the result
    timelineCache.set(cacheKey, result);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/signdict/stats — dictionary statistics ─────────────────────────
router.get('/stats', auth, (req, res) => {
  try {
    const words = signDict.toArray();
    res.json({
      totalWords: words.length,
      totalFrames: words.reduce((s, w) => s + (w.frames?.length || 0), 0),
      words: [...signDict.keys()],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
