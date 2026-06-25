const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const lifetime = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE skipped = false) AS attempted,
         COUNT(*) FILTER (WHERE is_correct = true) AS correct,
         COUNT(*) FILTER (WHERE skipped = true) AS skipped
       FROM attempts WHERE user_id = $1`,
      [req.userId]
    );

    const byCategory = await pool.query(
      `SELECT category,
         COUNT(*) FILTER (WHERE skipped = false) AS attempted,
         COUNT(*) FILTER (WHERE is_correct = true) AS correct
       FROM attempts WHERE user_id = $1
       GROUP BY category ORDER BY category`,
      [req.userId]
    );

    const byDifficulty = await pool.query(
      `SELECT difficulty,
         COUNT(*) FILTER (WHERE skipped = false) AS attempted,
         COUNT(*) FILTER (WHERE is_correct = true) AS correct
       FROM attempts WHERE user_id = $1
       GROUP BY difficulty ORDER BY difficulty`,
      [req.userId]
    );

    const trend = await pool.query(
      `SELECT date_trunc('day', created_at) AS day,
         COUNT(*) FILTER (WHERE skipped = false) AS attempted,
         COUNT(*) FILTER (WHERE is_correct = true) AS correct
       FROM attempts WHERE user_id = $1
       GROUP BY day ORDER BY day DESC LIMIT 30`,
      [req.userId]
    );

    const recentSessions = await pool.query(
      `SELECT * FROM sessions WHERE user_id = $1 ORDER BY started_at DESC LIMIT 10`,
      [req.userId]
    );

    // current streak: consecutive days (ending today or yesterday) with at least one attempt
    const dayRows = await pool.query(
      `SELECT DISTINCT date_trunc('day', created_at) AS day FROM attempts WHERE user_id = $1 ORDER BY day DESC`,
      [req.userId]
    );
    let streak = 0;
    if (dayRows.rows.length) {
      const days = dayRows.rows.map(r => new Date(r.day).getTime());
      const oneDay = 24 * 60 * 60 * 1000;
      let cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      let cursorTime = cursor.getTime();
      const daySet = new Set(days);
      // allow streak to start from today or yesterday
      if (!daySet.has(cursorTime)) cursorTime -= oneDay;
      while (daySet.has(cursorTime)) {
        streak++;
        cursorTime -= oneDay;
      }
    }

    const lt = lifetime.rows[0];
    res.json({
      lifetime: {
        attempted: Number(lt.attempted),
        correct: Number(lt.correct),
        skipped: Number(lt.skipped),
        accuracy: Number(lt.attempted) > 0 ? Math.round((Number(lt.correct) / Number(lt.attempted)) * 100) : 0,
      },
      byCategory: byCategory.rows.map(r => ({
        category: r.category,
        attempted: Number(r.attempted),
        correct: Number(r.correct),
        accuracy: Number(r.attempted) > 0 ? Math.round((Number(r.correct) / Number(r.attempted)) * 100) : 0,
      })),
      byDifficulty: byDifficulty.rows.map(r => ({
        difficulty: r.difficulty,
        attempted: Number(r.attempted),
        correct: Number(r.correct),
        accuracy: Number(r.attempted) > 0 ? Math.round((Number(r.correct) / Number(r.attempted)) * 100) : 0,
      })),
      trend: trend.rows.map(r => ({
        day: r.day,
        attempted: Number(r.attempted),
        correct: Number(r.correct),
      })).reverse(),
      recentSessions: recentSessions.rows,
      streak,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not load dashboard' });
  }
});

module.exports = router;
