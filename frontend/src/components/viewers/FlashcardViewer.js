import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const Inline = ({ children }) => <>{children}</>;
const mdProps = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
  components: { p: Inline },
};

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
          <div className="flashcard-text">
            <ReactMarkdown {...mdProps}>{question || ''}</ReactMarkdown>
          </div>
          {hint && (
            <div className="flashcard-hint">
              💡 <ReactMarkdown {...mdProps}>{hint}</ReactMarkdown>
            </div>
          )}
          <span className="flashcard-tap">Cliquer pour voir la réponse ↩</span>
        </div>

        {/* Verso */}
        <div className="flashcard-face flashcard-back">
          <span className="flashcard-label">Réponse</span>
          <div className="flashcard-text">
            <ReactMarkdown {...mdProps}>{answer || ''}</ReactMarkdown>
          </div>
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
