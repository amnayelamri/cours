import React, { useState } from 'react';
import MarkdownViewer from './MarkdownViewer';
import { FiChevronRight, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const StepsViewer = ({ title, intro, steps = [] }) => {
  const [revealed, setRevealed] = useState(0);
  const done = revealed >= steps.length;

  return (
    <div className="steps-viewer">
      {title && <h3 className="steps-title">{title}</h3>}

      {intro && (
        <div className="steps-intro">
          <MarkdownViewer content={intro} />
        </div>
      )}

      {/* Liste des étapes révélées */}
      <div className="steps-list">
        {steps.slice(0, revealed).map((step, i) => (
          <div
            key={i}
            className={`step-item${i === revealed - 1 ? ' step-item--new' : ''}`}
          >
            <div className="step-number">{i + 1}</div>
            <div className="step-content">
              {step.label && <div className="step-label">{step.label}</div>}
              <div className="step-body">
                <MarkdownViewer content={step.content} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Contrôles */}
      <div className="steps-controls">
        {!done ? (
          <button
            className="btn-primary steps-next-btn"
            onClick={() => setRevealed(r => r + 1)}
          >
            {revealed === 0 ? 'Commencer' : 'Étape suivante'}
            <FiChevronRight size={16} />
            <span className="steps-counter">{revealed}/{steps.length}</span>
          </button>
        ) : (
          <div className="steps-done">
            <div className="steps-done-msg">
              <FiCheckCircle size={18} /> Toutes les étapes révélées !
            </div>
            <button className="btn-secondary" onClick={() => setRevealed(0)}>
              <FiRefreshCw size={14} /> Recommencer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepsViewer;
