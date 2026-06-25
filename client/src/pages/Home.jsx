import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Mixed', 'Arithmetic', 'Algebra', 'Geometry', 'Statistics', 'Word Problems'];
const DIFFICULTIES = ['Mixed', 'Easy', 'Medium', 'Hard'];
const LENGTHS = ['5', '10', '20'];

export default function Home() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('practice');
  const [category, setCategory] = useState('Mixed');
  const [difficulty, setDifficulty] = useState('Mixed');
  const [total, setTotal] = useState('10');
  const [forceOffline, setForceOffline] = useState(false);

  function startSession() {
    if (mode === 'exam') {
      navigate('/session', { state: { mode, category: 'Mixed', difficulty: 'Mixed', total: 20, forceOffline } });
    } else {
      navigate('/session', { state: { mode, category, difficulty, total: parseInt(total, 10), forceOffline } });
    }
  }

  return (
    <div id="screen-home">
      <div className="home-eyebrow">Manhattan Prep · Math Section</div>
      <h1 className="home-title">Practice like it's<br /><em>the real thing</em></h1>
      <p className="home-sub">Timed questions, three GRE formats, AI explanations. Track your weak spots and fix them.</p>

      <div className="mode-grid">
        <div className={'mode-card' + (mode === 'practice' ? ' active' : '')} onClick={() => setMode('practice')}>
          <div className="mode-icon">🎯</div>
          <div className="mode-name">Practice</div>
          <div className="mode-desc">Timed questions with instant feedback</div>
        </div>
        <div className={'mode-card' + (mode === 'exam' ? ' active' : '')} onClick={() => setMode('exam')}>
          <div className="mode-icon">📋</div>
          <div className="mode-name">Exam Sim</div>
          <div className="mode-desc">20 questions, section timer, no feedback</div>
        </div>
        <div className={'mode-card' + (mode === 'review' ? ' active' : '')} onClick={() => setMode('review')}>
          <div className="mode-icon">🔁</div>
          <div className="mode-name">Review Errors</div>
          <div className="mode-desc">Retry questions you got wrong</div>
        </div>
      </div>

      <div className="config-card" style={{ maxWidth: 620, marginTop: 12 }}>
        {mode === 'exam' && (
          <div className="exam-info" style={{ display: 'block' }}>
            ⏱ Exam Simulation: 20 questions · 35 minute section timer · No per-question feedback. Results shown at the end.
          </div>
        )}
        {mode !== 'exam' && mode !== 'review' && (
          <div id="practice-config">
            <div className="config-label">Topic</div>
            <div className="chip-group">
              {CATEGORIES.map(c => (
                <div key={c} className={'chip' + (category === c ? ' active' : '')} onClick={() => setCategory(c)}>{c}</div>
              ))}
            </div>
            <div className="config-label">Difficulty</div>
            <div className="chip-group">
              {DIFFICULTIES.map(d => (
                <div key={d} className={'chip' + (difficulty === d ? ' active' : '')} onClick={() => setDifficulty(d)}>{d}</div>
              ))}
            </div>
            <div className="config-label">Session length</div>
            <div className="chip-group">
              {LENGTHS.map(l => (
                <div key={l} className={'chip' + (total === l ? ' active' : '')} onClick={() => setTotal(l)}>{l} questions</div>
              ))}
            </div>
          </div>
        )}
        {mode === 'review' && (
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 20 }}>
            We'll pull every question you got wrong or skipped from your saved history.
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.8rem', color: 'var(--muted)' }}>
            <input type="checkbox" checked={forceOffline} onChange={e => setForceOffline(e.target.checked)} style={{ accentColor: 'var(--blue)', width: 15, height: 15 }} />
            Force offline mode (use question bank)
          </label>
        </div>
        <button className="btn-primary" onClick={startSession}>
          {mode === 'review' ? 'Review Errors →' : 'Start →'}
        </button>
      </div>
    </div>
  );
}
