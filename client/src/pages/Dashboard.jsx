import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

export default function Dashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getDashboard(token).then(setData);
  }, [token]);

  if (!data) {
    return (
      <div id="screen-dashboard" style={{ display: 'block' }}>
        <div className="dash-header"><h2>Your Progress</h2></div>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    );
  }

  const maxTrend = Math.max(1, ...data.trend.map(t => t.attempted));

  return (
    <div id="screen-dashboard" style={{ display: 'block' }}>
      <div className="dash-header"><h2>Your Progress</h2></div>

      <div className="dash-grid">
        <div className="dash-stat">
          <div className="dash-stat-val">{data.lifetime.attempted}</div>
          <div className="dash-stat-lbl">Questions Done</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-val" style={{ color: 'var(--teal)' }}>{data.lifetime.accuracy}%</div>
          <div className="dash-stat-lbl">Lifetime Accuracy</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-val" style={{ color: 'var(--muted)' }}>{data.lifetime.skipped}</div>
          <div className="dash-stat-lbl">Skipped</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-val" style={{ color: 'var(--orange)' }}>{data.streak}</div>
          <div className="dash-stat-lbl">Day Streak</div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Activity (last 30 days)</div>
        {data.trend.length ? (
          <div className="trend-bars">
            {data.trend.map((t, i) => (
              <div key={i} className="trend-bar" title={`${t.correct}/${t.attempted} correct`}
                style={{ height: `${Math.max(4, (t.attempted / maxTrend) * 90)}px` }}>
              </div>
            ))}
          </div>
        ) : <div className="trend-empty">No activity yet.</div>}
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Accuracy by Topic</div>
        {data.byCategory.length ? data.byCategory.map(c => (
          <div className="cat-row" key={c.category}>
            <div className="cat-name">{c.category}</div>
            <div className="cat-bar-bg"><div className="cat-bar-fill" style={{ width: c.accuracy + '%', background: c.accuracy >= 80 ? 'var(--teal)' : c.accuracy >= 60 ? 'var(--blue)' : 'var(--red)' }}></div></div>
            <div className="cat-pct">{c.accuracy}%</div>
          </div>
        )) : <div className="trend-empty">No data yet.</div>}
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Accuracy by Difficulty</div>
        {data.byDifficulty.length ? data.byDifficulty.map(d => (
          <div className="cat-row" key={d.difficulty}>
            <div className="cat-name">{d.difficulty}</div>
            <div className="cat-bar-bg"><div className="cat-bar-fill" style={{ width: d.accuracy + '%', background: d.accuracy >= 80 ? 'var(--teal)' : d.accuracy >= 60 ? 'var(--blue)' : 'var(--red)' }}></div></div>
            <div className="cat-pct">{d.accuracy}%</div>
          </div>
        )) : <div className="trend-empty">No data yet.</div>}
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Recent Sessions</div>
        <div className="sessions-list">
          {data.recentSessions.length ? data.recentSessions.map(s => (
            <div className="hist-item" key={s.id}>
              <div className="hist-item-top">
                <div className="hist-q">{s.mode} · {s.category} · {s.difficulty}</div>
                <div className="hist-badge">
                  <span className="hist-result correct">{s.correct_count}/{s.total_questions}</span>
                </div>
              </div>
              <div className="hist-meta">
                <span>{new Date(s.started_at).toLocaleDateString()}</span>
              </div>
            </div>
          )) : <div className="trend-empty">No sessions yet.</div>}
        </div>
      </div>
    </div>
  );
}
