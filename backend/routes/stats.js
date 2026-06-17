const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?',
      [req.user.userId]
    );
    const [[{ done }]] = await db.query(
      'SELECT COUNT(*) as done FROM tasks WHERE user_id = ? AND status = "done"',
      [req.user.userId]
    );
    const [[user]] = await db.query(
      'SELECT xp FROM users WHERE user_id = ?',
      [req.user.userId]
    );
    res.json({ total, done, xp: user.xp });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;