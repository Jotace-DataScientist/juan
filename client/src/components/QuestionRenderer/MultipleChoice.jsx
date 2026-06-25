export default function MultipleChoice({ question, selected, onSelect, disabled, correctKey, showResult }) {
  return (
    <div className="mc-choices">
      {question.options.map((opt, i) => {
        const key = String.fromCharCode(65 + i);
        let cls = 'mc-opt';
        if (selected === key) cls += ' selected';
        if (disabled) cls += ' disabled';
        if (showResult) {
          if (key === correctKey) cls += ' correct';
          else if (key === selected) cls += ' wrong';
        }
        return (
          <div key={key} className={cls} onClick={() => !disabled && onSelect(key)}>
            <div className="opt-key">{key}</div>
            <span>{opt.replace(/^\([A-E]\)\s*/, '')}</span>
          </div>
        );
      })}
    </div>
  );
}
