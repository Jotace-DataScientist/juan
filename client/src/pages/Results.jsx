import { useLocation, useNavigate } from 'react-router-dom';

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/');
    return null;
  }

  const { stats, total } = state;
  const attempted = stats.correct + stats.wrong;
  const pct = attempted > 0 ? Math.round((stats.correct / attempted) * 100) : 0;
  const circ = 408;
  const offset = circ * (1 - pct / 100);
  const ringColor = pct >= 80 ? 'var(--teal)' : pct >= 60 ? 'var(--blue)' : 'var(--red)';

  const [title, sub] = pct >= 90 ? ['Excellent!', "Near perfect — you're ready."]
    : pct >= 70 ? ['Strong session.', 'Keep building on this.']
    : pct >= 50 ? ['Getting there.', 'Focus on the topics below.']
    : ['Room to grow.', 'Review the explanations carefully.'];

  const cats = Object.entries(stats.catStats || {}).sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total));

  return (
    <div id="screen-results" style={{ display: 'block' }}>
      <div className="score-ring">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle className="ring-bg" cx="65" cy="65" r="65" />
          <circle className="ring-fill" cx="65" cy="65" r="65" style={{ strokeDasharray: circ, strokeDashoffset: offset, stroke: ringColor }} />
        </svg>
        <div className="score-center">
          <div className="score-pct">{pct}%</div>
          <div className="score-lbl">ACCURACY</div>
        </div>
      </div>
      <h2 className="results-title">{title}</h2>
      <p className="results-sub">{sub}</p>
      <div className="breakdown-grid">
        <div className="breakdown-cell"><div className="breakdown-num green">{stats.correct}</div><div className="breakdown-txt">Correct</div></div>
        <div className="breakdown-cell"><div className="breakdown-num red">{stats.wrong}</div><div className="breakdown-txt">Wrong</div></div>
        <div className="breakdown-cell"><div className="breakdown-num muted">{stats.skipped}</div><div className="breakdown-txt">Skipped</div></div>
      </div>
      {cats.length > 1 && (
        <div className="cat-perf" style={{ display: 'block' }}>
          <div className="section-title">Performance by topic</div>
          <div>
            {cats.map(([cat, s]) => {
              const p = Math.round((s.correct / s.total) * 100);
              const color = p >= 80 ? 'var(--teal)' : p >= 60 ? 'var(--blue)' : 'var(--red)';
              return (
                <div className="cat-row" key={cat}>
                  <div className="cat-name">{cat}</div>
                  <div className="cat-bar-bg"><div className="cat-bar-fill" style={{ width: p + '%', background: color }}></div></div>
                  <div className="cat-pct" style={{ color }}>{p}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="results-actions">
        <button className="btn-outline" onClick={() => navigate('/')}>Practice Again</button>
        <button className="btn-primary" style={{ flex: 0, padding: '11px 24px' }} onClick={() => navigate('/')}>Change Settings</button>
      </div>
    </div>
  );
}
