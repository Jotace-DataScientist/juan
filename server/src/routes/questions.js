const express = require('express');
const QUESTION_BANK = require('../data/questionBank');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickFromBank(category, difficulty) {
  let pool = QUESTION_BANK;
  if (category && category !== 'Mixed') pool = pool.filter(q => q.category === category);
  if (difficulty && difficulty !== 'Mixed') pool = pool.filter(q => q.difficulty === difficulty);
  if (!pool.length) pool = QUESTION_BANK;
  return shuffle(pool)[0];
}

const PROMPT_BUILDERS = {
  multiple_choice: (cat, diff) => `Generate a Multiple Choice GRE Math question. Return ONLY JSON:
{"type":"multiple_choice","category":"${cat}","difficulty":"${diff}","premise":"","question":"...","options":["(A) ...","(B) ...","(C) ...","(D) ...","(E) ..."],"correct":"A","explanation":"..."}`,
  quantitative_comparison: (cat, diff) => `Generate a Quantitative Comparison GRE Math question. Return ONLY JSON:
{"type":"quantitative_comparison","category":"${cat}","difficulty":"${diff}","premise":"...","quantity_a":"...","quantity_b":"...","correct":"A","explanation":"..."}
correct must be A(QA greater), B(QB greater), C(equal), or D(cannot determine).`,
  numeric_entry: (cat, diff) => `Generate a Numeric Entry GRE Math question. Return ONLY JSON:
{"type":"numeric_entry","category":"${cat}","difficulty":"${diff}","premise":"","question":"...","answer":"42","answer_display":"42","explanation":"..."}`,
};

async function generateWithAnthropic(category, difficulty, type) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('No API key configured');

  const cat = category === 'Mixed'
    ? ['Arithmetic', 'Algebra', 'Geometry', 'Statistics', 'Word Problems'][Math.floor(Math.random() * 5)]
    : category;
  const diff = difficulty === 'Mixed'
    ? ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)]
    : difficulty;
  const qType = type || ['multiple_choice', 'quantitative_comparison', 'numeric_entry'][Math.floor(Math.random() * 3)];

  const prompt = `You are a GRE Math question generator at the level of Manhattan Prep 4th Edition.
Generate ONE original, mathematically correct GRE Quantitative question.

${PROMPT_BUILDERS[qType](cat, diff)}

Rules:
- ${diff} difficulty: Easy=direct 1-step, Medium=2-step insight, Hard=multi-step or trap
- All numbers must work out cleanly
- Return ONLY the JSON, nothing else`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
    const data = await res.json();
    const raw = data.content[0].text.trim().replace(/```json|```/g, '').trim();
    return JSON.parse(raw);
  } finally {
    clearTimeout(timeout);
  }
}

router.post('/generate', requireAuth, async (req, res) => {
  const { category = 'Mixed', difficulty = 'Mixed', type } = req.body || {};
  try {
    const question = await generateWithAnthropic(category, difficulty, type);
    return res.json({ question, source: 'ai' });
  } catch (e) {
    const question = pickFromBank(category, difficulty);
    return res.json({ question, source: 'bank' });
  }
});

router.get('/bank', requireAuth, (req, res) => {
  const { category = 'Mixed', difficulty = 'Mixed', count = 10 } = req.query;
  let pool = QUESTION_BANK;
  if (category !== 'Mixed') pool = pool.filter(q => q.category === category);
  if (difficulty !== 'Mixed') pool = pool.filter(q => q.difficulty === difficulty);
  if (!pool.length) pool = QUESTION_BANK;
  let shuffled = shuffle(pool);
  const n = Math.max(parseInt(count, 10) || 10, 1);
  while (shuffled.length < n) shuffled = [...shuffled, ...shuffle(QUESTION_BANK)];
  res.json({ questions: shuffled.slice(0, n) });
});

module.exports = router;
