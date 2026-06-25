const express = require('express');
const FLASHCARDS = require('../data/flashcards');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  res.json({ flashcards: FLASHCARDS });
});

module.exports = router;
