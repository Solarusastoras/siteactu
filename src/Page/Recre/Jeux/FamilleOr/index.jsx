import React, { useState } from "react";
import "./familleor.scss";
import DataFamilleOr from "../../../../Data/DataJeux/DataFamilleOr.json";

function FamilleOr() {
  // États du jeu
  const [gameMode, setGameMode] = useState(""); // '', 'solo', 'versus'
  const [gameState, setGameState] = useState("menu"); // 'menu', 'playing', 'gameOver'
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    reponses: [
      // Provide a sample answer structure to help TypeScript infer the type
      { reponse: "", points: 0 },
    ],
    id: 0, // id can be number
  });
  const [revealedAnswers, setRevealedAnswers] = useState([false]);
  const [userInput, setUserInput] = useState("");
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [questionsUsed, setQuestionsUsed] = useState([0]);
  const [wrongAnswerEffect, setWrongAnswerEffect] = useState(false);

  // Constantes du jeu
  const MAX_WRONG_ANSWERS = 3;
  const QUESTIONS_PER_GAME = 5;

  // Initialiser une nouvelle question
  const initializeQuestion = () => {
    const availableQuestions = DataFamilleOr.filter(
      (question, index) => !questionsUsed.includes(index)
    );

    if (
      availableQuestions.length === 0 ||
      questionsUsed.length >= QUESTIONS_PER_GAME
    ) {
      endGame();
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selectedQuestion = availableQuestions[randomIndex];
    const originalIndex = DataFamilleOr.findIndex(
      (q) => q.id === selectedQuestion.id
    );

    setCurrentQuestion(selectedQuestion);
    setRevealedAnswers(new Array(selectedQuestion.reponses.length).fill(false));
    setQuestionsUsed((prev) => [...prev, originalIndex]);
    setRoundScore(0);
    setWrongAnswers(0);
    setWrongAnswerEffect(false);
  };

  // Démarrer le jeu
  const startGame = (mode) => {
    setGameMode(mode);
    setGameState("playing");
    setScores({ player1: 0, player2: 0 });
    setCurrentPlayer(1);
    setQuestionsUsed([]);
    setTimeout(() => {
      initializeQuestion();
    }, 100);
  };

  // Soumettre une réponse
  const submitAnswer = () => {
    if (!userInput.trim() || !currentQuestion.reponses) return;

    const normalizedInput = userInput.toLowerCase().trim();
    const answerIndex = currentQuestion.reponses.findIndex(
      (answer, index) =>
        !revealedAnswers[index] &&
        answer.reponse.toLowerCase().includes(normalizedInput)
    );

    if (answerIndex !== -1) {
      // Bonne réponse
      const newRevealedAnswers = [...revealedAnswers];
      newRevealedAnswers[answerIndex] = true;
      setRevealedAnswers(newRevealedAnswers);

      const points = currentQuestion.reponses[answerIndex].points;
      setRoundScore((prev) => prev + points);

      // Vérifier si toutes les réponses sont trouvées
      if (newRevealedAnswers.every((revealed) => revealed)) {
        setTimeout(() => {
          completeRound();
        }, 1000);
      }
    } else {
      // Mauvaise réponse
      const newWrongAnswers = wrongAnswers + 1;
      setWrongAnswers(newWrongAnswers);

      // Effet visuel de mauvaise réponse
      setWrongAnswerEffect(true);
      setTimeout(() => {
        setWrongAnswerEffect(false);
      }, 500);

      if (newWrongAnswers >= MAX_WRONG_ANSWERS) {
        setTimeout(() => {
          if (gameMode === "versus") {
            switchPlayer();
          } else {
            completeRound();
          }
        }, 1000);
      }
    }

    setUserInput("");
  };

  // Compléter une manche
  const completeRound = () => {
    const newScores = { ...scores };

    if (gameMode === "solo") {
      newScores.player1 += roundScore;
    } else {
      newScores[`player${currentPlayer}`] += roundScore;
    }

    setScores(newScores);

    // Passer à la question suivante ou terminer le jeu
    setTimeout(() => {
      if (questionsUsed.length >= QUESTIONS_PER_GAME) {
        endGame();
      } else {
        initializeQuestion();
        if (gameMode === "versus") {
          setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
        }
      }
    }, 1500);
  };

  // Changer de joueur (mode versus)
  const switchPlayer = () => {
    const newScores = { ...scores };
    newScores[`player${currentPlayer}`] += roundScore;
    setScores(newScores);

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setWrongAnswers(0);
    setRoundScore(0);
    setWrongAnswerEffect(false);
  };

  // Terminer le jeu
  const endGame = () => {
    setGameState("gameOver");
  };

  // Passer la question
  const passQuestion = () => {
    if (gameMode === "versus") {
      switchPlayer();
    } else {
      completeRound();
    }
  };

  // Redémarrer le jeu
  const restartGame = () => {
    setGameMode("");
    setGameState("menu");
    setCurrentQuestion({
      question: "",
      reponses: [{ reponse: "", points: 0 }],
      id: 0,
    });
    setRevealedAnswers([false]);
    setUserInput("");
    setScores({ player1: 0, player2: 0 });
    setCurrentPlayer(1);
    setWrongAnswers(0);
    setRoundScore(0);
    setQuestionsUsed([0]);
    setWrongAnswerEffect(false);
  };

  // Gestion de la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  };

  // Rendu du menu principal
  if (gameState === "menu") {
    return (
      <div className="famille-or-page">
        <div className="header">
          <h1>Le sais-tu ?</h1>
          <p className="subtitle">Connais-tu les habitudes des Français ?</p>
        </div>

        <div className="game-modes">
          <div className="mode-card" onClick={() => startGame("solo")}>
            <div className="mode-icon">👤</div>
            <div className="mode-title">1 Joueur</div>
            <div className="mode-description">
              Joue seul et accumule un maximum de points en trouvant toutes les
              réponses !
            </div>
          </div>

          <div className="mode-card" onClick={() => startGame("versus")}>
            <div className="mode-icon">👥</div>
            <div className="mode-title">1 vs 1</div>
            <div className="mode-description">
              Défiez un ami ! Chacun votre tour, tentez de trouver les bonnes
              réponses.
            </div>
          </div>
        </div>

        <div className="game-rules">
          <h3>📋 Règles du jeu</h3>
          <ul className="rules-list">
            <li>Trouvez les réponses les plus populaires à chaque question</li>
            <li>Plus la réponse est populaire, plus vous gagnez de points</li>
            <li>Vous avez droit à 3 erreurs maximum par manche</li>
            <li>En mode 1 vs 1, les joueurs alternent à chaque manche</li>
            <li>Le jeu se compose de {QUESTIONS_PER_GAME} questions</li>
            <li>
              Tapez votre réponse et appuyez sur Entrée ou cliquez sur "Valider"
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Rendu du jeu en cours
  if (gameState === "playing") {
    return (
      <div className="famille-or-page">
        <div className="game-container">
          <div className="game-header">
            <div className="question-counter">
              Question {questionsUsed.length} / {QUESTIONS_PER_GAME}
            </div>
            <div className="current-question">
              {currentQuestion.question || "Chargement..."}
            </div>
          </div>

          <div className="score-section">
            {gameMode === "solo" ? (
              <div className="score-card">
                <div className="score-label">Score Total</div>
                <div className="score-value">{scores.player1}</div>
              </div>
            ) : (
              <>
                <div
                  className={`score-card player-score ${
                    currentPlayer === 1 ? "active" : ""
                  }`}
                >
                  <div className="score-label">Joueur 1</div>
                  <div className="score-value">{scores.player1}</div>
                </div>
                <div
                  className={`score-card player-score ${
                    currentPlayer === 2 ? "active" : ""
                  }`}
                >
                  <div className="score-label">Joueur 2</div>
                  <div className="score-value">{scores.player2}</div>
                </div>
              </>
            )}
            <div className="score-card">
              <div className="score-label">Score Manche</div>
              <div className="score-value">{roundScore}</div>
            </div>
          </div>

          <div className="game-board">
            <div className="answers-board">
              {currentQuestion.reponses &&
                currentQuestion.reponses.map((answer, index) => (
                  <div
                    key={index}
                    className={`answer-card ${
                      revealedAnswers[index] ? "revealed" : ""
                    }`}
                  >
                    <div className="answer-number">{index + 1}</div>
                    <div className="answer-text">
                      {revealedAnswers[index] ? answer.reponse : "???"}
                    </div>
                    <div className="answer-points">
                      {revealedAnswers[index] ? answer.points : "?"}
                    </div>
                  </div>
                ))}
            </div>

            <div className="wrong-indicator">
              {Array.from({ length: MAX_WRONG_ANSWERS }, (_, index) => (
                <div
                  key={index}
                  className={`wrong-x ${index < wrongAnswers ? "active" : ""}`}
                >
                  ❌
                </div>
              ))}
            </div>

            <div className="input-section">
              <input
                type="text"
                className={`answer-input ${
                  wrongAnswerEffect ? "wrong-answer" : ""
                }`}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`${
                  gameMode === "versus" ? `Joueur ${currentPlayer}` : "Votre"
                } réponse...`}
                disabled={wrongAnswers >= MAX_WRONG_ANSWERS}
              />
              <br />
              <button
                className="submit-btn"
                onClick={submitAnswer}
                disabled={
                  !userInput.trim() || wrongAnswers >= MAX_WRONG_ANSWERS
                }
              >
                ✅ Valider
              </button>
              <button className="submit-btn pass-btn" onClick={passQuestion}>
                ⏭️ Passer
              </button>
            </div>
          </div>

          <div className="game-controls">
            <button className="control-btn restart" onClick={restartGame}>
              🔄 Recommencer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rendu de fin de jeu
  if (gameState === "gameOver") {
    const winner =
      gameMode === "solo"
        ? null
        : scores.player1 > scores.player2
        ? "Joueur 1"
        : scores.player1 < scores.player2
        ? "Joueur 2"
        : "Égalité";

    return (
      <div className="famille-or-page">
        <div className="game-over">
          <div className="winner-announcement">
            {gameMode === "solo"
              ? "🎉 Partie terminée !"
              : winner === "Égalité"
              ? "🤝 Égalité !"
              : `🏆 ${winner} gagne !`}
          </div>

          <div className="final-scores">
            {gameMode === "solo" ? (
              <div>Score final : {scores.player1} points</div>
            ) : (
              <div>
                <div>Joueur 1 : {scores.player1} points</div>
                <div>Joueur 2 : {scores.player2} points</div>
              </div>
            )}
          </div>

          <button className="play-again-btn" onClick={restartGame}>
            🎮 Rejouer
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default FamilleOr;
