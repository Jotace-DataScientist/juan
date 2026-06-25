import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';
import MultipleChoice from '../components/QuestionRenderer/MultipleChoice.jsx';
import QuantitativeComparison from '../components/QuestionRenderer/QuantitativeComparison.jsx';
import NumericEntry from '../components/QuestionRenderer/NumericEntry.jsx';

const PER_Q_SECONDS = { Easy: 90, Medium: 120, Hard: 150 };
const EXAM_SECTION_SECONDS = 35 * 60;
const TIMER_CIRC = 138;

function getCorrectKeyOrDisplay(q) {
  if (q.type === 'quantitative_comparison' || q.type === 'multiple_choice') return q.correct;
  return q.answer_display || q.answer;
}

function getCorrectDisplay(q) {
  if (q.type === 'quantitative_comparison') {
    return { A: 'Quantity A is greater', B: 'Quantity B is greater', C: 'The two quantities are equal', D: 'Cannot be determined' }[q.correct] || q.correct;
  }
  if (q.type === 'multiple_choice') {
    const idx = q.correct.charCodeAt(0) - 65;
    return `(${q.correct}) ${(q.options[idx] || '').replace(/^\([A-E]\)\s*/, '')}`;
  }
  return q.answer_display || q.answer;
}

export default function Session() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const config = state || { mode: 'practice', category: 'Mixed', difficulty: 'Mixed', total: 10, forceOffline: false };

  const [sessionId, setSessionId] = useState(null);
  const [reviewQueue, setReviewQueue] = useState(null); // null until loaded if review mode
  const [phase, setPhase] = useState('loading'); // loading | question | done
  const [current, setCurrent] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [numericValue, setNumericValue] = useState('');
  const [stats, setStats] = useState({ correct: 0, wrong: 0, skipped: 0, catStats: {} });
  const [perQSecondsLeft, setPerQSecondsLeft] = useState(0);
  const [sectionSecondsLeft, setSectionSecondsLeft] = useState(EXAM_SECTION_SECONDS);
  const [feedback, setFeedback] = useState(null); // { isCorrect, skipped, timedOut }

  const statsRef = useRef(stats);
  statsRef.current = stats;

  const perQTimerRef = useRef(null);
  const sectionTimerRef = useRef(null);
  const sectionStartedRef = useRef(false);
  const totalRef = useRef(config.total);
  const offlineQueueRef = useRef([]);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (config.mode === 'review') {
        const data = await api.getHistory(token, { filter: 'wrong', limit: 200 });
        const queue = data.attempts.map(a => a.question_payload).filter(Boolean);
        if (cancelled) return;
        if (!queue.length) {
          alert('No errors in your history yet! Practice some questions first.');
          navigate('/');
          return;
        }
        totalRef.current = queue.length;
        setReviewQueue(queue);
      }
      const session = await api.createSession(token, {
        mode: config.mode,
        category: config.category,
        difficulty: config.difficulty,
        totalQuestions: totalRef.current,
      });
      if (cancelled) return;
      setSessionId(session.session.id);
    }
    init();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadQuestion = useCallback(async (index) => {
    setPhase('loading');
    setFeedback(null);
    setSelected(null);
    setNumericValue('');
    setAnswered(false);

    let q;
    if (config.mode === 'review') {
      q = reviewQueue[index];
    } else if (config.forceOffline) {
      const bank = await api.getBank(token, { category: config.category, difficulty: config.difficulty, count: 1 });
      q = bank.questions[0];
    } else {
      try {
        const result = await api.generateQuestion(token, { category: config.category, difficulty: config.difficulty });
        q = result.question;
      } catch (e) {
        const bank = await api.getBank(token, { category: config.category, difficulty: config.difficulty, count: 1 });
        q = bank.questions[0];
      }
    }
    setCurrentQ(q);
    setPhase('question');

    if (config.mode === 'exam') {
      if (!sectionStartedRef.current) {
        sectionStartedRef.current = true;
        startSectionTimer();
      }
    } else {
      startPerQTimer(PER_Q_SECONDS[q.difficulty] || 90);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.mode, config.category, config.difficulty, config.forceOffline, reviewQueue, token]);

  useEffect(() => {
    if (config.mode === 'review' && reviewQueue === null) return; // wait for queue
    if (!sessionId) return;
    loadQuestion(current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, reviewQueue]);

  function startPerQTimer(secs) {
    clearInterval(perQTimerRef.current);
    let left = secs;
    setPerQSecondsLeft(left);
    perQTimerRef.current = setInterval(() => {
      left -= 1;
      setPerQSecondsLeft(left);
      if (left <= 0) {
        clearInterval(perQTimerRef.current);
        handleTimeout();
      }
    }, 1000);
  }

  function startSectionTimer() {
    clearInterval(sectionTimerRef.current);
    let left = EXAM_SECTION_SECONDS;
    setSectionSecondsLeft(left);
    sectionTimerRef.current = setInterval(() => {
      left -= 1;
      setSectionSecondsLeft(left);
      if (left <= 0) {
        clearInterval(sectionTimerRef.current);
        finishSession(true);
      }
    }, 1000);
  }

  useEffect(() => () => {
    clearInterval(perQTimerRef.current);
    clearInterval(sectionTimerRef.current);
  }, []);

  function recordCatStat(category, isCorrect) {
    setStats(prev => {
      const cs = { ...prev.catStats };
      if (!cs[category]) cs[category] = { correct: 0, total: 0 };
      cs[category] = { correct: cs[category].correct + (isCorrect ? 1 : 0), total: cs[category].total + 1 };
      return { ...prev, catStats: cs };
    });
  }

  async function logAttempt(q, userAnswer, correctAnswer, isCorrect, skipped) {
    try {
      await api.logAttempt(token, sessionId, {
        questionType: q.type,
        category: q.category,
        difficulty: q.difficulty,
        questionPayload: q,
        userAnswer: userAnswer != null ? String(userAnswer) : null,
        correctAnswer: correctAnswer != null ? String(correctAnswer) : null,
        isCorrect: !!isCorrect,
        skipped: !!skipped,
      });
    } catch (e) {
      console.error('Failed to log attempt', e);
    }
  }

  function handleTimeout() {
    if (answered) return;
    setAnswered(true);
    const q = currentQ;
    recordCatStat(q.category, false);
    setStats(prev => ({ ...prev, wrong: prev.wrong + 1 }));
    logAttempt(q, null, getCorrectKeyOrDisplay(q), false, false);
    if (config.mode === 'exam') {
      advance();
    } else {
      setFeedback({ isCorrect: false, skipped: false, timedOut: true });
    }
  }

  function handleSubmit() {
    if (answered || !currentQ) return;
    const q = currentQ;
    let userAnswer = null, isCorrect = false;
    if (q.type === 'quantitative_comparison' || q.type === 'multiple_choice') {
      userAnswer = selected;
      isCorrect = userAnswer === q.correct;
    } else {
      userAnswer = numericValue.trim();
      isCorrect = Math.abs(parseFloat(userAnswer) - parseFloat(q.answer)) < 0.01;
    }
    setAnswered(true);
    clearInterval(perQTimerRef.current);
    recordCatStat(q.category, isCorrect);
    setStats(prev => ({ ...prev, [isCorrect ? 'correct' : 'wrong']: prev[isCorrect ? 'correct' : 'wrong'] + 1 }));
    logAttempt(q, userAnswer, getCorrectKeyOrDisplay(q), isCorrect, false);

    if (config.mode === 'exam') {
      setTimeout(() => advance(), 600);
    } else {
      setFeedback({ isCorrect, skipped: false, timedOut: false });
    }
  }

  function handleSkip() {
    if (answered || !currentQ) return;
    const q = currentQ;
    setAnswered(true);
    clearInterval(perQTimerRef.current);
    setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    logAttempt(q, null, getCorrectKeyOrDisplay(q), false, true);
    if (config.mode === 'exam') {
      advance();
    } else {
      setFeedback({ isCorrect: false, skipped: true, timedOut: false });
    }
  }

  function advance() {
    const next = current + 1;
    if (next >= totalRef.current) {
      finishSession(false);
      return;
    }
    setCurrent(next);
    loadQuestion(next);
  }

  async function finishSession() {
    clearInterval(perQTimerRef.current);
    clearInterval(sectionTimerRef.current);
    const finalStats = statsRef.current;
    api.finalizeSession(token, sessionId, {
      correctCount: finalStats.correct,
      wrongCount: finalStats.wrong,
      skippedCount: finalStats.skipped,
    }).catch(() => {});
    navigate('/results', { state: { stats: finalStats, total: totalRef.current } });
  }

  if (phase === 'loading' || !currentQ) {
    return (
      <div id="screen-loading" style={{ display: 'block' }}>
        <div className="loading-spinner"></div>
        <div className="loading-text">{config.mode === 'review' ? 'Loading error to review...' : 'Generating your question...'}</div>
      </div>
    );
  }

  const q = currentQ;
  const correctKey = (q.type === 'multiple_choice' || q.type === 'quantitative_comparison') ? q.correct : null;
  const pct = (current / totalRef.current) * 100;
  const timerArcOffset = TIMER_CIRC * (1 - perQSecondsLeft / (PER_Q_SECONDS[q.difficulty] || 90));
  const sectionMin = Math.floor(sectionSecondsLeft / 60);
  const sectionSec = sectionSecondsLeft % 60;

  return (
    <div id="screen-question" style={{ display: 'block' }}>
      {config.mode === 'exam' && (
        <div className="exam-section-bar" style={{ display: 'flex' }}>
          <div><div className="esb-label">Section Timer</div></div>
          <div className={'esb-time' + (sectionSecondsLeft <= 120 ? ' urgent' : '')}>{sectionMin}:{String(sectionSec).padStart(2, '0')}</div>
          <div className="esb-progress">Question {current + 1} of {totalRef.current}</div>
        </div>
      )}

      <div className="progress-bar-wrap">
        <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: pct + '%' }}></div></div>
        <div className="progress-label"><span>Question {current + 1} of {totalRef.current}</span><span>{stats.correct} correct</span></div>
      </div>

      <div className="q-top">
        <div className="q-meta">
          <span className={'q-badge badge-' + q.difficulty.toLowerCase()}>{q.difficulty}</span>
          <span className="q-category">{q.category}</span>
        </div>
        {config.mode !== 'exam' && (
          <div className="timer-wrap">
            <svg className="timer-svg" width="52" height="52" viewBox="0 0 52 52">
              <circle className="timer-track" cx="26" cy="26" r="22" />
              <circle className={'timer-arc' + (perQSecondsLeft <= 10 ? ' urgent' : '')} cx="26" cy="26" r="22"
                style={{ strokeDasharray: TIMER_CIRC, strokeDashoffset: timerArcOffset }} />
            </svg>
            <div className="timer-text">{perQSecondsLeft}</div>
          </div>
        )}
      </div>

      <div className="q-type-label">
        {{ multiple_choice: 'Multiple Choice', quantitative_comparison: 'Quantitative Comparison', numeric_entry: 'Numeric Entry' }[q.type] || q.type}
      </div>
      {q.premise && q.premise.trim() && <div className="q-premise">{q.premise}</div>}
      {q.type !== 'quantitative_comparison' && <div className="q-text">{q.question}</div>}

      <div>
        {q.type === 'quantitative_comparison' && (
          <QuantitativeComparison question={q} selected={selected} onSelect={k => { setSelected(k); }} disabled={answered} correctKey={correctKey} showResult={answered} />
        )}
        {q.type === 'multiple_choice' && (
          <MultipleChoice question={q} selected={selected} onSelect={k => { setSelected(k); }} disabled={answered} correctKey={correctKey} showResult={answered} />
        )}
        {q.type === 'numeric_entry' && (
          <NumericEntry value={numericValue} onChange={setNumericValue} disabled={answered}
            showResult={answered} isCorrect={feedback ? feedback.isCorrect : false}
            correctDisplay={q.answer_display || q.answer} onEnter={handleSubmit} />
        )}
      </div>

      {!answered && (
        <div className="q-actions">
          <button className="btn-submit" disabled={q.type === 'numeric_entry' ? !numericValue.trim() : !selected} onClick={handleSubmit}>Submit Answer</button>
          <button className="btn-skip" onClick={handleSkip}>Skip →</button>
        </div>
      )}

      {feedback && (
        <div className="feedback-card" style={{ display: 'block' }}>
          <div className="feedback-header">
            <div className="feedback-icon">{feedback.timedOut ? '⏱' : feedback.skipped ? '⏭' : feedback.isCorrect ? '✓' : '✗'}</div>
            <div className={'feedback-verdict' + (feedback.isCorrect ? ' correct' : feedback.skipped ? '' : ' wrong')}
              style={feedback.skipped ? { color: 'var(--muted)' } : undefined}>
              {feedback.timedOut ? "Time's up!" : feedback.skipped ? 'Skipped' : feedback.isCorrect ? 'Correct!' : 'Incorrect'}
            </div>
          </div>
          <div className="feedback-body">
            {!feedback.isCorrect && !feedback.skipped && (
              <p><strong>Correct answer:</strong> {getCorrectDisplay(q)}</p>
            )}
            <p>{q.explanation || 'See solution.'}</p>
          </div>
          <button className="btn-next" onClick={advance}>Next question →</button>
        </div>
      )}
    </div>
  );
}
