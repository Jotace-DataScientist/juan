const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { mode, category, difficulty, totalQuestions } = req.body || {};
  if (!mode || !category || !difficulty || !totalQuestions) {
    return res.status(400).json({ error: 'mode, category, difficulty, totalQuestions are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO sessions (user_id, mode, category, difficulty, total_questions)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, mode, category, difficulty, totalQuestions]
    );
    res.status(201).json({ session: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not create session' });
  }
});

router.post('/:id/attempts', requireAuth, async (req, res) => {
  const sessionId = req.params.id;
  const {
    questionType, category, difficulty, questionPayload,
    userAnswer, correctAnswer, isCorrect, skipped,
  } = req.body || {};
  if (!questionType || !category || !difficulty || !questionPayload) {
    return res.status(400).json({ error: 'Missing required attempt fields' });
  }
  try {
    const session = await pool.query('SELECT id FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, req.userId]);
    if (!session.rows.length) return res.status(404).json({ error: 'Session not found' });

    const result = await pool.query(
      `INSERT INTO attempts (user_id, session_id, question_type, category, difficulty, question_payload, user_answer, correct_answer, is_correct, skipped)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.userId, sessionId, questionType, category, difficulty, questionPayload, userAnswer || null, correctAnswer || null, !!isCorrect, !!skipped]
    );
    res.status(201).json({ attempt: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not log attempt' });
  }
});

router.patch('/:id', requireAuth, async (req, res) => {
  const sessionId = req.params.id;
  const { correctCount = 0, wrongCount = 0, skippedCount = 0 } = req.body || {};
  try {
    const result = await pool.query(
      `UPDATE sessions SET correct_count = $1, wrong_count = $2, skipped_count = $3, ended_at = now()
       WHERE id = $4 AND user_id = $5 RETURNING *`,
      [correctCount, wrongCount, skippedCount, sessionId, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Session not found' });
    res.json({ session: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Could not finalize session' });
  }
});

module.exports = router;
