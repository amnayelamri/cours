import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const Inline = ({ children }) => <>{children}</>;
const mdProps = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
  components: { p: Inline },
};

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const MatchingViewer = ({ instruction, pairs = [] }) => {
  const makeRight = () => shuffle(pairs.map((p, i) => ({ ...p, originalIdx: i })));

  const [shuffledRight, setShuffledRight] = useState(makeRight);
  const [selectedLeft,  setSelectedLeft]  = useState(null);
  const [matched,  setMatched]  = useState({});
  const [wrongIdx, setWrongIdx] = useState(null);

  const matchedLeft    = Object.keys(matched).map(Number);
  const matchedRight   = Object.values(matched);
  const done           = matchedLeft.length === pairs.length;

  const handleLeft = (idx) => {
    if (matchedLeft.includes(idx)) return;
    setSelectedLeft(prev => prev === idx ? null : idx);
    setWrongIdx(null);
  };

  const handleRight = (item) => {
    if (matchedRight.includes(item.originalIdx)) return;
    if (selectedLeft === null) return;

    if (item.originalIdx === selectedLeft) {
      setMatched(m => ({ ...m, [selectedLeft]: item.originalIdx }));
      setSelectedLeft(null);
      setWrongIdx(null);
    } else {
      setWrongIdx(item.originalIdx);
      setTimeout(() => setWrongIdx(null), 700);
    }
  };

  const reset = () => {
    setMatched({});
    setSelectedLeft(null);
    setWrongIdx(null);
    setShuffledRight(makeRight());
  };

  const leftClass = (idx) => {
    if (matchedLeft.includes(idx))  return 'matching-item--matched';
    if (selectedLeft === idx)       return 'matching-item--selected';
    return '';
  };

  const rightClass = (item) => {
    if (matchedRight.includes(item.originalIdx)) return 'matching-item--matched';
    if (wrongIdx === item.originalIdx)            return 'matching-item--wrong';
    return '';
  };

  return (
    <div className="matching-viewer">
      {instruction && (
        <p className="matching-instruction">
          <ReactMarkdown {...mdProps}>{instruction}</ReactMarkdown>
        </p>
      )}

      {done ? (
        <div className="matching-done">
          <FiCheckCircle size={36} />
          <p>Toutes les paires trouvées !</p>
          <button className="btn-secondary" onClick={reset}>
            <FiRefreshCw size={14} /> Réessayer
          </button>
        </div>
      ) : (
        <>
          <p className="matching-hint-text">
            Sélectionnez un élément à gauche, puis son correspondant à droite.
          </p>
          <div className="matching-grid">
            {/* Colonne gauche */}
            <div className="matching-col">
              {pairs.map((pair, idx) => (
                <button
                  key={idx}
                  className={`matching-item matching-item--left ${leftClass(idx)}`}
                  onClick={() => handleLeft(idx)}
                  disabled={matchedLeft.includes(idx)}
                >
                  {matchedLeft.includes(idx) && <span className="matching-check">✓</span>}
                  <ReactMarkdown {...mdProps}>{pair.left || ''}</ReactMarkdown>
                </button>
              ))}
            </div>

            {/* Colonne droite */}
            <div className="matching-col">
              {shuffledRight.map((item, idx) => (
                <button
                  key={idx}
                  className={`matching-item matching-item--right ${rightClass(item)}`}
                  onClick={() => handleRight(item)}
                  disabled={matchedRight.includes(item.originalIdx)}
                >
                  {matchedRight.includes(item.originalIdx) && <span className="matching-check">✓</span>}
                  <ReactMarkdown {...mdProps}>{item.right || ''}</ReactMarkdown>
                </button>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="matching-score">
            <div
              className="matching-score-bar"
              style={{ width: `${(matchedLeft.length / pairs.length) * 100}%` }}
            />
            <span className="matching-score-text">
              {matchedLeft.length} / {pairs.length} paires
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default MatchingViewer;
