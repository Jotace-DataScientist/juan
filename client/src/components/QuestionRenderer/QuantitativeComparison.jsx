const OPTIONS = [
  ['A', 'Quantity A is greater'],
  ['B', 'Quantity B is greater'],
  ['C', 'The two quantities are equal'],
  ['D', 'The relationship cannot be determined from the information given'],
];

export default function QuantitativeComparison({ question, selected, onSelect, disabled, correctKey, showResult }) {
  return (
    <>
      <div className="qc-columns">
        <div className="qc-col"><h4>Quantity A</h4><div className="qc-val">{question.quantity_a}</div></div>
        <div className="qc-divider"></div>
        <div className="qc-col"><h4>Quantity B</h4><div className="qc-val">{question.quantity_b}</div></div>
      </div>
      <div className="qc-choices">
        {OPTIONS.map(([key, text]) => {
          let cls = 'qc-opt';
          if (selected === key) cls += ' selected';
          if (disabled) cls += ' disabled';
          if (showResult) {
            if (key === correctKey) cls += ' correct';
            else if (key === selected) cls += ' wrong';
          }
          return (
            <div key={key} className={cls} onClick={() => !disabled && onSelect(key)}>
              <div className="opt-key">{key}</div>
              <span>{text}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}
