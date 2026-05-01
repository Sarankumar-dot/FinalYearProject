const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');

// GET /api/users — list all users (admin only)
router.get('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { memUsers } = require('./auth');
    let users = memUsers.toArray().map(u => { const s = { ...u }; delete s.passwordHash; return s; });
    const { role, search } = req.query;
    if (role) users = users.filter(u => u.role === role);
    if (search) users = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/stats
router.get('/stats', auth, requireRole('admin'), async (req, res) => {
  try {
    const { memUsers } = require('./auth');
    const users = memUsers.toArray();
    res.json({
      total: users.length,
      students: users.filter(u => u.role === 'student').length,
      teachers: users.filter(u => u.role === 'teacher').length,
      admins: users.filter(u => u.role === 'admin').length,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/:id
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { memUsers } = require('./auth');
    for (const [email, u] of memUsers.entries()) {
      if (u._id === req.params.id) {
        const updated = { ...u, ...req.body };
        memUsers.set(email, updated);
        const safe = { ...updated }; delete safe.passwordHash;
        return res.json(safe);
      }
    }
    res.status(404).json({ message: 'User not found.' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/users/:id
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { memUsers } = require('./auth');
    for (const [email, u] of memUsers.entries()) {
      if (u._id === req.params.id) { memUsers.delete(email); break; }
    }
    res.json({ message: 'User deleted.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
