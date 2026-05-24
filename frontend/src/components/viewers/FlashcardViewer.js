import React, { useState } from 'react';

const FlashcardViewer = ({ question, answer, hint }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flashcard-wrap">
      <div
        className={`flashcard-scene ${flipped ? 'is-flipped' : ''}`}
        onClick={() => setFlipped(f => !f)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setFlipped(f => !f)}
        aria-label="Retourner la carte"
      >
        {/* Recto */}
        <div className="flashcard-face flashcard-front">
          <span className="flashcard-label">Question</span>
          <div className="flashcard-text">{question}</div>
          {hint && <div className="flashcard-hint">💡 {hint}</div>}
          <span className="flashcard-tap">Cliquer pour voir la réponse ↩</span>
        </div>

        {/* Verso */}
        <div className="flashcard-face flashcard-back">
          <span className="flashcard-label">Réponse</span>
          <div className="flashcard-text">{answer}</div>
          <span className="flashcard-tap">↩ Cliquer pour retourner</span>
        </div>
      </div>

      <div className="flashcard-indicator">
        <span className={!flipped ? 'fc-dot fc-dot--active' : 'fc-dot'} />
        <span className={flipped  ? 'fc-dot fc-dot--active' : 'fc-dot'} />
      </div>
    </div>
  );
};

export default FlashcardViewer;
