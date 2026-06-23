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

const makeShuffled = (orderItems) =>
  shuffle(orderItems.map((text, i) => ({ text, correctIdx: i })));

const OrderingViewer = ({ instruction, orderItems = [] }) => {
  const [shuffled,  setShuffled]  = useState(() => makeShuffled(orderItems));
  const [selected,  setSelected]  = useState([]); // indices into shuffled, in click order
  const [wrongIdx,  setWrongIdx]  = useState(null);

  const done = selected.length === orderItems.length;

  const handleClick = (shuffledIdx) => {
    if (selected.includes(shuffledIdx) || done) return;
    const clickedItem = shuffled[shuffledIdx];
    if (clickedItem.correctIdx === selected.length) {
      setSelected(prev => [...prev, shuffledIdx]);
      setWrongIdx(null);
    } else {
      setWrongIdx(shuffledIdx);
      setTimeout(() => setWrongIdx(null), 600);
    }
  };

  const reset = () => {
    setSelected([]);
    setWrongIdx(null);
    setShuffled(makeShuffled(orderItems));
  };

  const itemClass = (idx) => {
    if (selected.includes(idx)) return 'ordering-item--done';
    if (wrongIdx === idx)       return 'ordering-item--wrong';
    return '';
  };

  const itemRank = (idx) => {
    const pos = selected.indexOf(idx);
    return pos === -1 ? null : pos + 1;
  };

  return (
    <div className="ordering-viewer">
      {instruction && (
        <p className="ordering-instruction">
          <ReactMarkdown {...mdProps}>{instruction}</ReactMarkdown>
        </p>
      )}

      {!done && (
        <p className="ordering-hint">Cliquez sur les éléments dans le bon ordre.</p>
      )}

      <div className="ordering-items">
        {shuffled.map((item, idx) => (
          <button
            key={idx}
            className={`ordering-item ${itemClass(idx)}`}
            onClick={() => handleClick(idx)}
            disabled={selected.includes(idx) || done}
          >
            {itemRank(idx) !== null && (
              <span className="ordering-num">{itemRank(idx)}</span>
            )}
            <span className="ordering-text">
              <ReactMarkdown {...mdProps}>{item.text || ''}</ReactMarkdown>
            </span>
          </button>
        ))}
      </div>

      <div className="ordering-footer">
        <div className="matching-score">
          <div
            className="matching-score-bar"
            style={{ width: `${(selected.length / orderItems.length) * 100}%` }}
          />
        </div>
        <span className="matching-score-text">{selected.length} / {orderItems.length}</span>
      </div>

      {done && (
        <div className="ordering-done">
          <FiCheckCircle size={22} />
          <span>Bravo ! Ordre correct.</span>
          <button className="btn-secondary" onClick={reset}>
            <FiRefreshCw size={14} /> Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderingViewer;
