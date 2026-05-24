import React, { useState } from 'react';
import { FiRefreshCw, FiCheckCircle } from 'react-icons/fi';

const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const MatchingViewer = ({ instruction, pairs = [] }) => {
  const makeRight = () => shuffle(pairs.map((p, i) => ({ ...p, originalIdx: i })));

  const [shuffledRight, setShuffledRight] = useState(makeRight);
  const [selectedLeft,  setSelectedLeft]  = useState(null); // index | null
  const [matched,  setMatched]  = useState({}); // { leftIdx: rightOriginalIdx }
  const [wrongIdx, setWrongIdx] = useState(null); // flashes red

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
      // ✅ Correct
      setMatched(m => ({ ...m, [selectedLeft]: item.originalIdx }));
      setSelectedLeft(null);
      setWrongIdx(null);
    } else {
      // ❌ Wrong — flash rouge
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
      {instruction && <p className="matching-instruction">{instruction}</p>}

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
                  {pair.left}
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
                  {item.right}
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
