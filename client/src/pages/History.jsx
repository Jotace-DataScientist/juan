import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

function resultOf(a) {
  if (a.skipped) return 'skipped';
  return a.is_correct ? 'correct' : 'wrong';
}

function questionText(payload) {
  if (!payload) return '';
  if (payload.type === 'quantitative_comparison') return `QA: ${payload.quantity_a} vs QB: ${payload.quantity_b}`;
  return payload.question;
}

export default function History() {
  const { token } = useAuth();
  const [filter, setFilter] = useState('all');
  const [attempts, setAttempts] = useState([]);
  const [openId, setOpenId] = useState(null);

  const load = useCallback(() => {
    api.getHistory(token, { filter, limit: 100 }).then(data => setAttempts(data.attempts));
  }, [token, filter]);

  useEffect(() => { load(); }, [load]);

  async function clearHistory() {
    if (!confirm('Clear all history?')) return;
    await api.clearHistory(token);
    load();
  }

  return (
    <div id="screen-history" style={{ display: 'block' }}>
      <div className="hist-header">
        <h2>Error History</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="hist-filter">
            <div className={'chip' + (filter === 'all' ? ' active' : '')} onClick={() => setFilter('all')}>All</div>
            <div className={'chip' + (filter === 'wrong' ? ' active' : '')} onClick={() => setFilter('wrong')}>Wrong</div>
            <div className={'chip' + (filter === 'correct' ? ' active' : '')} onClick={() => setFilter('correct')}>Correct</div>
          </div>
          <button className="clear-btn" onClick={clearHistory}>Clear</button>
        </div>
      </div>
      <div>
        {!attempts.length && (
          <div className="hist-empty">No questions here yet.<br />Start practicing to build your history.</div>
        )}
        {attempts.map(a => {
          const result = resultOf(a);
          const open = openId === a.id;
          return (
            <div className="hist-item" key={a.id} onClick={() => setOpenId(open ? null : a.id)}>
              <div className="hist-item-top">
                <div className="hist-q">{questionText(a.question_payload)}</div>
                <div className="hist-badge">
                  <span className={'hist-result ' + result}>{result}</span>
                </div>
              </div>
              <div className="hist-meta">
                <span>{a.category}</span><span>·</span><span>{a.difficulty}</span>
                {result !== 'correct' && <><span>·</span><span>Correct: {a.correct_answer}</span></>}
              </div>
              <div className={'hist-explanation' + (open ? ' open' : '')}>{a.question_payload?.explanation || ''}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
