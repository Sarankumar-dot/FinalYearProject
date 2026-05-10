/**
 * conversations.js
 *
 * Backend route for saving / retrieving sign language conversation history.
 * Uses the existing persistent JSON store pattern (createStore from db.js).
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createStore } = require('../db');

// Persistent conversation history store
const memConversations = createStore('conversations');

// GET /api/conversations — returns all conversations for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const all = memConversations.toArray
      ? memConversations.toArray()
      : [...memConversations.values()];
    const userConversations = all.filter((c) => c.userId === userId);
    // Sort newest first
    userConversations.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    res.json(userConversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/conversations — save a new conversation
router.post('/', auth, async (req, res) => {
  try {
    const { messages, savedAt } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'No messages to save.' });
    }
    const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry = {
      _id: id,
      userId: req.user._id,
      userName: req.user.name,
      messages,
      savedAt: savedAt || new Date().toISOString(),
      messageCount: messages.length,
    };
    memConversations.set(id, entry);
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/conversations/:id — delete a saved conversation
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = memConversations.get(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    // Only allow the owner to delete
    if (entry.userId !== req.user._id) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    memConversations.delete(req.params.id);
    res.json({ message: 'Conversation deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
