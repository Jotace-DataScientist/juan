import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/client.js';

const CATS = ['All', 'Arithmetic', 'Algebra', 'Geometry', 'Statistics'];

export default function Flashcards() {
  const { token } = useAuth();
  const [cards, setCards] = useState([]);
  const [filter, setFilter] = useState('All');
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    api.getFlashcards(token).then(data => setCards(data.flashcards));
  }, [token]);

  const filtered = useMemo(() => filter === 'All' ? cards : cards.filter(c => c.cat === filter), [cards, filter]);

  useEffect(() => { setIndex(0); setFlipped(false); }, [filter]);

  if (!filtered.length) {
    return (
      <div id="screen-flashcards" style={{ display: 'block' }}>
        <div className="fc-header"><h2>Formula Flashcards</h2></div>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    );
  }

  const f = filtered[index];

  function next() { setFlipped(false); setIndex((index + 1) % filtered.length); }
  function prev() { setFlipped(false); setIndex((index - 1 + filtered.length) % filtered.length); }

  return (
    <div id="screen-flashcards" style={{ display: 'block' }}>
      <div className="fc-header">
        <h2>Formula Flashcards</h2>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Click card to flip</span>
      </div>
      <div className="fc-cat-chips">
        {CATS.map(c => (
          <div key={c} className={'chip' + (filter === c ? ' active' : '')} onClick={() => setFilter(c)}>{c}</div>
        ))}
      </div>
      <div className="fc-scene">
        <div className={'fc-card' + (flipped ? ' flipped' : '')} onClick={() => setFlipped(!flipped)}>
          <div className="fc-face fc-front">
            <div className="fc-topic">{f.cat}</div>
            <div className="fc-term">{f.term}</div>
            <div className="fc-hint">Tap to see definition & formula</div>
          </div>
          <div className="fc-face fc-back">
            <div className="fc-topic">{f.cat}</div>
            <div className="fc-def" dangerouslySetInnerHTML={{ __html: f.def.replace(/\n/g, '<br>') }}></div>
          </div>
        </div>
      </div>
      <div className="fc-nav">
        <button className="fc-nav-btn" onClick={prev}>← Prev</button>
        <span className="fc-counter">{index + 1} / {filtered.length}</span>
        <button className="fc-nav-btn" onClick={next}>Next →</button>
      </div>
    </div>
  );
}
