import React, { useState } from 'react';
import MarkdownViewer from './MarkdownViewer';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

const TrueFalseViewer = ({ statement, answer, explanation }) => {
  const [chosen, setChosen] = useState(null); // null | true | false

  const choose = (val) => {
    if (chosen !== null) return;
    setChosen(val);
  };

  const correct = chosen === answer;

  const btnClass = (val) => {
    if (chosen === null) return '';
    if (answer === val) return 'tf-btn--correct';
    if (chosen === val) return 'tf-btn--wrong';
    return 'tf-btn--dim';
  };

  return (
    <div className="tf-viewer">
      <div className="tf-statement">
        <MarkdownViewer content={statement} />
      </div>

      <div className="tf-choices">
        <button
          className={`tf-btn tf-btn--true ${btnClass(true)}`}
          onClick={() => choose(true)}
          disabled={chosen !== null}
        >
          <span className="tf-icon">✓</span>
          <span className="tf-label">VRAI</span>
        </button>
        <button
          className={`tf-btn tf-btn--false ${btnClass(false)}`}
          onClick={() => choose(false)}
          disabled={chosen !== null}
        >
          <span className="tf-icon">✗</span>
          <span className="tf-label">FAUX</span>
        </button>
      </div>

      {chosen !== null && (
        <>
          <div className={`tf-result ${correct ? 'tf-result--correct' : 'tf-result--wrong'}`}>
            {correct ? <FiCheck size={18} /> : <FiX size={18} />}
            <span>
              {correct
                ? 'Correct !'
                : `Incorrect — la bonne réponse est ${answer ? 'VRAI' : 'FAUX'}`}
            </span>
          </div>

          {explanation && (
            <div className="tf-explanation">
              <MarkdownViewer content={explanation} />
            </div>
          )}

          <button className="btn-secondary tf-reset" onClick={() => setChosen(null)}>
            <FiRefreshCw size={14} /> Réessayer
          </button>
        </>
      )}
    </div>
  );
};

export default TrueFalseViewer;
