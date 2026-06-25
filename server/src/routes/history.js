const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { filter = 'all', limit = 50, offset = 0 } = req.query;
  const params = [req.userId];
  let where = 'WHERE user_id = $1';
  if (filter === 'correct') {
    where += ' AND is_correct = true AND skipped = false';
  } else if (filter === 'wrong') {
    where += ' AND (is_correct = false OR skipped = true)';
  }
  params.push(Math.max(parseInt(limit, 10) || 50, 1));
  params.push(Math.max(parseInt(offset, 10) || 0, 0));
  try {
    const result = await pool.query(
      `SELECT * FROM attempts ${where} ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      params
    );
    res.json({ attempts: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not fetch history' });
  }
});

router.delete('/', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM attempts WHERE user_id = $1', [req.userId]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not clear history' });
  }
});

module.exports = router;
