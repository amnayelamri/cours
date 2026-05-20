import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

// Rendu inline : supprime le <p> englobant pour que le LaTeX reste inline
const Inline = ({ children }) => <>{children}</>;
const mdProps = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
  components: { p: Inline },
};

const QuizViewer = ({ question, choices = [], explanation }) => {
  const [selected, setSelected] = useState(null); // id du choix cliqué
  const answered = selected !== null;

  // Remet le quiz à zéro quand on change de question (navigation entre slides)
  useEffect(() => { setSelected(null); }, [question]);

  const handleChoice = (choice) => {
    if (answered) return; // on ne peut répondre qu'une fois
    setSelected(choice.id);
  };

  const getState = (choice) => {
    if (!answered) return 'idle';
    if (choice.correct) return 'correct';
    if (choice.id === selected) return 'wrong';
    return 'idle';
  };

  return (
    <div className="quiz-viewer">
      <div className="quiz-question">
        <ReactMarkdown {...mdProps}>{question || ''}</ReactMarkdown>
      </div>

      <div className="quiz-choices">
        {choices.map((choice) => {
          const state = getState(choice);
          return (
            <button
              key={choice.id}
              className={`quiz-choice quiz-choice--${state}`}
              onClick={() => handleChoice(choice)}
              disabled={answered}
            >
              <span className="choice-label">{choice.id.toUpperCase()}</span>
              <span className="choice-text">
                <ReactMarkdown {...mdProps}>{choice.text || ''}</ReactMarkdown>
              </span>
              {answered && state === 'correct' && <FiCheckCircle className="choice-icon" size={18} />}
              {answered && state === 'wrong'   && <FiXCircle    className="choice-icon" size={18} />}
            </button>
          );
        })}
      </div>

      {answered && explanation && (
        <div className="quiz-explanation">
          <strong>Explication :</strong>{' '}
          <ReactMarkdown {...mdProps}>{explanation}</ReactMarkdown>
        </div>
      )}

      {answered && (
        <button
          className="quiz-reset"
          onClick={() => setSelected(null)}
        >
          Réessayer
        </button>
      )}
    </div>
  );
};

export default QuizViewer;
