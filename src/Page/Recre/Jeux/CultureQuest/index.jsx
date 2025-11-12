import React, { useState, useEffect } from "react";
import "./_culturequest.scss";
import dataGeek from "../../../../Data/DataJeux/CultureQuest/geek.json";
import dataGeographie from "../../../../Data/DataJeux/CultureQuest/geographie.json";
import dataHistoire from "../../../../Data/DataJeux/CultureQuest/histoire.json";
import dataScience from "../../../../Data/DataJeux/CultureQuest/science.json";
import dataSports from "../../../../Data/DataJeux/CultureQuest/sports.json";
import dataPrimaire from "../../../../Data/DataJeux/CultureQuest/primaire.json";
import dataEgypt from "../../../../Data/DataJeux/CultureQuest/egypt.json";
import dataDivertissement from "../../../../Data/DataJeux/CultureQuest/divertissement.json";
import dataAppreciation from "../../../../Data/DataAppreciation/DataApreciation.json";

function CultureQuest() {
  const [gameState, setGameState] = useState("playing");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentGainIndex, setCurrentGainIndex] = useState(0);
  const [isFinalQuestion, setIsFinalQuestion] = useState(false);
  const [answerStatus, setAnswerStatus] = useState(null);

  const currentAppreciationData = dataAppreciation["theme-egypt"] || [];

  useEffect(() => {
    // Charger toutes les questions au démarrage
    const allData = [
      ...dataGeek,
      ...dataGeographie,
      ...dataHistoire,
      ...dataScience,
      ...dataSports,
      ...dataEgypt,
      ...dataPrimaire,
      ...dataDivertissement,
    ];

    const shuffled = [...allData]
      .map((q) => ({
        ...q,
        correctAnswer: q.answer || 0,
      }))
      .sort(() => 0.5 - Math.random());

    setQuestions(shuffled.slice(0, Math.min(50, shuffled.length)));
  }, []);

  const handleAnswerSelection = (answerIndex) => {
    if (answerStatus !== null || selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);

    const currentQuestion = questions[currentQuestionIndex];
    // Vérifier si l'objet question a bien la propriété correctAnswer
    const isCorrect =
      currentQuestion &&
      "correctAnswer" in currentQuestion &&
      answerIndex === currentQuestion.correctAnswer;

    setTimeout(() => {
      setAnswerStatus(isCorrect ? "correct" : "incorrect");

      setTimeout(() => {
        if (isCorrect) {
          if (isFinalQuestion) {
            setGameState("result");
          } else {
            const newGainIndex = Math.min(
              currentGainIndex + 1,
              currentAppreciationData.length - 1
            );
            setCurrentGainIndex(newGainIndex);

            if (newGainIndex === currentAppreciationData.length - 1) {
              setIsFinalQuestion(true);
            }
          }
        } else {
          if (isFinalQuestion) {
            const newGainIndex = Math.max(currentGainIndex - 3, 0);
            setCurrentGainIndex(newGainIndex);
            setIsFinalQuestion(false);
          } else {
            const newGainIndex = Math.max(currentGainIndex - 1, 0);
            setCurrentGainIndex(newGainIndex);
          }
        }

        if (!isFinalQuestion || (isFinalQuestion && !isCorrect)) {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          } else {
            setGameState("result");
          }
        }

        setSelectedAnswer(null);
        setAnswerStatus(null);
      }, 2000);
    }, 3000);
  };

  const restartGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsFinalQuestion(false);
    setCurrentGainIndex(0);
    setAnswerStatus(null);
    
    // Remélanger les questions
    const allData = [
      ...dataGeek,
      ...dataGeographie,
      ...dataHistoire,
      ...dataScience,
      ...dataSports,
      ...dataEgypt,
      ...dataPrimaire,
      ...dataDivertissement,
    ];

    const shuffled = [...allData]
      .map((q) => ({
        ...q,
        correctAnswer: q.answer || 0,
      }))
      .sort(() => 0.5 - Math.random());

    setQuestions(shuffled.slice(0, Math.min(50, shuffled.length)));
    setGameState("playing");
  };

  const renderAnswerButton = (index, letter, answer) => {
    const isSelected = selectedAnswer === index;
    const isCorrect =
      answerStatus !== null &&
      index === questions[currentQuestionIndex].correctAnswer;
    const isIncorrect = answerStatus !== null && isSelected && !isCorrect;

    let className = "answer-btn";
    if (isSelected) className += " selected";
    if (isCorrect) className += " correct";
    if (isIncorrect) className += " incorrect";

    return (
      <button
        className={className}
        onClick={() => handleAnswerSelection(index)}
        disabled={answerStatus !== null}
      >
        <span className="letter">{letter}</span> {answer}
      </button>
    );
  };

  const renderGame = () => {
    if (!questions.length) return <div>Chargement des questions...</div>;

    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="game-container">
        <div className="header">
          <div className="score">
            Niveau actuel:{" "}
            {currentAppreciationData[currentGainIndex]?.label || ""}
          </div>
          <div className="question-number">
            {isFinalQuestion ? (
              <span className="final-question">Question Finale!</span>
            ) : (
              `Question ${currentQuestionIndex + 1}/${questions.length}`
            )}
          </div>
        </div>

        <div className="question-container">
          {isFinalQuestion && (
            <div className="final-question-alert">
              Attention! Répondez correctement pour confirmer votre victoire.
              Une erreur vous fera perdre 3 niveaux!
            </div>
          )}
          <div className="question">
            <span>{currentQuestion.question}</span>
          </div>

          <div className="answers-grid">
            {renderAnswerButton(0, "A", currentQuestion.options[0])}
            {renderAnswerButton(1, "B", currentQuestion.options[1])}
            {renderAnswerButton(2, "C", currentQuestion.options[2])}
            {renderAnswerButton(3, "D", currentQuestion.options[3])}
          </div>
        </div>

        <div className="money-ladder">
          {[...currentAppreciationData].reverse().map((item, index) => {
            const originalIndex = currentAppreciationData.length - 1 - index;
            let className = "money-step";
            if (originalIndex === currentGainIndex) className += " current";

            return (
              <div key={originalIndex} className={className}>
                <span className="level">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderResult = () => (
    <div className="result-container">
      <h1>
        {currentGainIndex === currentAppreciationData.length - 1
          ? "Félicitations ! Vous avez atteint et confirmé le sommet!"
          : "Partie terminée"}
      </h1>
      <h2>
        Votre niveau : {currentAppreciationData[currentGainIndex]?.label || ""}
      </h2>
      <h3>
        Vous avez répondu à {currentQuestionIndex + 1} questions sur{" "}
        {questions.length}
      </h3>
      <button className="restart-btn" onClick={restartGame}>
        Jouer à nouveau
      </button>
    </div>
  );

  return (
    <div className="culturequest-container">
      {gameState === "playing" && renderGame()}
      {gameState === "result" && renderResult()}
    </div>
  );
}

export default CultureQuest;
