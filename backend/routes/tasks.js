const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const auth = require('../middleware/auth');

// Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC',
      [req.user.userId]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get today's tasks
router.get('/today', auth, async (req, res) => {
  try {
    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? AND due_date = CURDATE() AND status != "done"',
      [req.user.userId]
    );
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  const { task_name, priority, due_date, project_id } = req.body;
  const xpRewards = { easy: 10, medium: 25, hard: 50 };
  const xp_reward = xpRewards[priority] || 25;
  try {
    const [result] = await db.query(
      'INSERT INTO tasks (user_id, project_id, task_name, priority, due_date, xp_reward) VALUES (?,?,?,?,?,?)',
      [req.user.userId, project_id || null, task_name, priority, due_date || null, xp_reward]
    );
    res.json({ task_id: result.insertId, task_name, priority, xp_reward });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task status
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  const completedAt = status === 'done' ? new Date() : null;
  try {
    await db.query(
      'UPDATE tasks SET status = ?, completed_at = ? WHERE task_id = ? AND user_id = ?',
      [status, completedAt, req.params.id, req.user.userId]
    );

    let newXp = null;
    if (status === 'done') {
      const [[task]] = await db.query(
        'SELECT xp_reward FROM tasks WHERE task_id = ?', [req.params.id]
      );
      await db.query(
        'UPDATE users SET xp = xp + ? WHERE user_id = ?',
        [task.xp_reward, req.user.userId]
      );
      await checkAchievements(req.user.userId);
      const [[user]] = await db.query(
        'SELECT xp FROM users WHERE user_id = ?', [req.user.userId]
      );
      newXp = user.xp;
    }
    res.json({ success: true, newXp });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM tasks WHERE task_id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Check achievements
async function checkAchievements(userId) {
  const [[{ total }]] = await db.query(
    'SELECT COUNT(*) as total FROM tasks WHERE user_id = ? AND status = "done"', [userId]
  );
  const [[{ daily }]] = await db.query(
    'SELECT COUNT(*) as daily FROM tasks WHERE user_id = ? AND status = "done" AND DATE(completed_at) = CURDATE()', [userId]
  );
  const [achievements] = await db.query(
    'SELECT * FROM achievements WHERE condition_type IN ("tasks_completed","daily_tasks")'
  );
  for (const a of achievements) {
    const met = (a.condition_type === 'tasks_completed' && total >= a.condition_value)
              || (a.condition_type === 'daily_tasks' && daily >= a.condition_value);
    if (met) {
      await db.query(
        'INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?,?)',
        [userId, a.achievement_id]
      );
    }
  }
}

module.exports = router;