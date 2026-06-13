import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const mdProps = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
};

const RevealViewer = ({ items = [] }) => {
  const [revealed, setRevealed] = useState({});

  const toggle = (i) =>
    setRevealed(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="reveal-viewer">
      {items.map((item, i) => (
        <div key={i} className="reveal-item">
          <div className="reveal-question">
            <ReactMarkdown {...mdProps}>{item.question || ''}</ReactMarkdown>
          </div>
          <button className="reveal-btn" onClick={() => toggle(i)}>
            {revealed[i]
              ? <><FiEyeOff size={14} /> Masquer</>
              : <><FiEye    size={14} /> Afficher la réponse</>}
          </button>
          {revealed[i] && (
            <div className="reveal-answer">
              <ReactMarkdown {...mdProps}>{item.answer || ''}</ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RevealViewer;
