import React, { useState } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

const QuizViewer = ({ question, choices = [], explanation }) => {
  const [selected, setSelected] = useState(null); // id du choix cliqué
  const answered = selected !== null;

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
      <div className="quiz-question">{question}</div>

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
              <span className="choice-text">{choice.text}</span>
              {answered && state === 'correct' && <FiCheckCircle className="choice-icon" size={18} />}
              {answered && state === 'wrong'   && <FiXCircle    className="choice-icon" size={18} />}
            </button>
          );
        })}
      </div>

      {answered && explanation && (
        <div className="quiz-explanation">
          <strong>Explication :</strong> {explanation}
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
