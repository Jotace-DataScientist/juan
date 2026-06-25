export default function NumericEntry({ value, onChange, disabled, showResult, isCorrect, correctDisplay, onEnter }) {
  let cls = 'numeric-input';
  if (showResult) cls += isCorrect ? ' correct' : ' wrong';
  return (
    <div className="numeric-wrap">
      <input
        type="text"
        className={cls}
        placeholder="Enter your answer"
        inputMode="decimal"
        value={value}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onEnter(); }}
      />
      {showResult && !isCorrect ? (
        <div className="numeric-hint">✗ Correct answer: {correctDisplay}</div>
      ) : (
        <div className="numeric-hint">Type a number and click Submit</div>
      )}
    </div>
  );
}
