import React, { useState, useRef } from 'react';
import MarkdownViewer from './MarkdownViewer';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

const NumberViewer = ({ question, answer, hint, explanation, tolerance = 0 }) => {
  const [value,  setValue]  = useState('');
  const [status, setStatus] = useState(null); // null | 'correct' | 'wrong'
  const inputRef = useRef(null);

  const check = () => {
    if (!value.trim()) return;
    const num = parseFloat(value.replace(',', '.'));
    if (isNaN(num)) { setStatus('wrong'); return; }
    setStatus(Math.abs(num - answer) <= tolerance ? 'correct' : 'wrong');
  };

  const reset = () => {
    setValue(''); setStatus(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="number-viewer">
      <div className="number-question">
        <MarkdownViewer content={question} />
      </div>

      {hint && status === null && (
        <div className="number-hint">💡 {hint}</div>
      )}

      <div className="number-input-row">
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          className={`number-input${status ? ` number-input--${status}` : ''}`}
          value={value}
          onChange={e => { setValue(e.target.value); if (status) setStatus(null); }}
          onKeyDown={e => e.key === 'Enter' && status === null && check()}
          placeholder="Votre réponse…"
          disabled={status !== null}
        />
        {status === null && (
          <button className="btn-primary number-check-btn" onClick={check} disabled={!value.trim()}>
            Vérifier
          </button>
        )}
        {status !== null && (
          <button className="btn-secondary number-check-btn" onClick={reset}>
            <FiRefreshCw size={14} /> Réessayer
          </button>
        )}
      </div>

      {status === 'correct' && (
        <div className="number-feedback number-feedback--correct">
          <FiCheck size={18} />
          <span>Correct !</span>
        </div>
      )}

      {status === 'wrong' && (
        <div className="number-feedback number-feedback--wrong">
          <FiX size={18} />
          <span>Incorrect — la bonne réponse est <strong>{answer}</strong>.</span>
        </div>
      )}

      {(status === 'correct' || status === 'wrong') && explanation && (
        <div className="number-explanation" style={status === 'wrong' ? { borderLeftColor: '#f44336' } : {}}>
          <MarkdownViewer content={explanation} />
        </div>
      )}
    </div>
  );
};

export default NumberViewer;
