const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const auth = require('../middleware/auth');

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const [projects] = await db.query(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  const { project_name, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO projects (user_id, project_name, description) VALUES (?,?,?)',
      [req.user.userId, project_name, description || null]
    );
    res.json({ project_id: result.insertId, project_name });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM projects WHERE project_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;