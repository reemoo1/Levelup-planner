const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [all] = await db.query('SELECT * FROM achievements');
    const [unlocked] = await db.query(
      'SELECT achievement_id FROM user_achievements WHERE user_id = ?',
      [req.user.userId]
    );
    res.json({ all, unlocked });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;