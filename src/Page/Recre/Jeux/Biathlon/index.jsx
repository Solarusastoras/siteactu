import React, { useState, useEffect } from "react";
import "./biathlon.scss";

function Biathlon() {
  const [movementDiceValue, setMovementDiceValue] = useState(0);
  const [shootingDiceValue, setShootingDiceValue] = useState(null || ""); // Peut être null, "blanc", ou "noir"
  const [playerPosition, setPlayerPosition] = useState(0);
  const [player2Position, setPlayer2Position] = useState(0); // Position du deuxième joueur
  const [shootingAttempts, setShootingAttempts] = useState(0);
  const [misses, setMisses] = useState(0);
  const [missesPlayer2, setMissesPlayer2] = useState(0); // Tirs ratés par le joueur 2
  const [missesCurrentSession, setMissesCurrentSession] = useState(0);
  const [isAtShootingRange, setIsAtShootingRange] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [message, setMessage] = useState(
    "Lancez le dé pour commencer la course!"
  );
  const [isRollingMovementDice, setIsRollingMovementDice] = useState(false);
  const [isRollingShootingDice, setIsRollingShootingDice] = useState(false);
  const [visitedShootingRanges, setVisitedShootingRanges] = useState([]);
  const [visitedShootingRangesP2, setVisitedShootingRangesP2] = useState([]); // Champs visités par joueur 2
  const [gameMode, setGameMode] = useState("solo"); // "solo", "pvp" ou "pvc"
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 pour joueur 1, 2 pour joueur 2 ou ordi
  const [winner, setWinner] = useState(0); // 0 = pas de gagnant, 1 = joueur 1, 2 = joueur 2/ordinateur
  const [playerToken, setPlayerToken] = useState("🎿");
  const [player2Token, setPlayer2Token] = useState("👟");
  const [computerToken, setComputerToken] = useState("🤖");

  // Tableau des jetons disponibles
  const availableTokens = [
    "🎿",
    "👟",
    "🏂",
    "⛷️",
    "🏄",
    "🚴",
    "🏃",
    "🤖",
    "🐧",
    "🦊",
    "🐺",
    "🦄",
    "🐎",
  ];

  // Configuration du parcours
  const trackLength = 50; // Longueur de la piste
  const shootingRanges = [10, 20, 30, 40]; // Positions des champs de tir
  const shotsPerRange = 5; // Nombre de tirs par champ

  // Définition des cases de gel (bonus qui font reculer)
  const iceCells = [5, 15, 25, 35, 45]; // Cases qui font reculer d'une case

  // Timer du jeu
  useEffect(() => {
    let timer;
    if ((playerPosition > 0 || player2Position > 0) && !gameOver) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [playerPosition, player2Position, gameOver]);

  // Fonction pour lancer le dé de mouvement
  const rollMovementDice = () => {
    if (isAtShootingRange || isRollingMovementDice || gameOver) return;

    setIsRollingMovementDice(true);
    setMessage("Le dé tourne...");

    // Animation du dé
    const diceRolling = setInterval(() => {
      setMovementDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    // Arrêter l'animation après 1 seconde
    setTimeout(() => {
      clearInterval(diceRolling);
      const result = Math.floor(Math.random() * 6) + 1;
      setMovementDiceValue(result);
      movePlayer(result);
      setIsRollingMovementDice(false);
    }, 1000);
  };

  // Fonction pour déplacer le joueur actuel
  const movePlayer = (steps) => {
    // Calculer la nouvelle position potentielle selon le joueur actuel
    const currentPos = currentPlayer === 1 ? playerPosition : player2Position;
    let newPosition = currentPos + steps;

    // Vérifier si le joueur va dépasser un champ de tir
    for (const range of shootingRanges) {
      // Vérifier si ce champ de tir a déjà été visité par le joueur actuel
      const visitedRanges =
        currentPlayer === 1 ? visitedShootingRanges : visitedShootingRangesP2;
      // Si on est avant cette position de tir et qu'on la dépasse après le mouvement
      // et que ce champ n'a pas été visité
      if (
        currentPos < range &&
        newPosition >= range &&
        !visitedRanges.includes(range)
      ) {
        // On s'arrête obligatoirement sur la position de tir
        newPosition = range;
        setMessage(
          `Vous devez vous arrêter au champ de tir à la position ${range}!`
        );
        break;
      }
    }

    // Ne pas dépasser la fin du parcours
    newPosition = Math.min(newPosition, trackLength);

    // Mise à jour de la position selon le joueur actuel
    if (currentPlayer === 1) {
      setPlayerPosition(newPosition);
    } else {
      setPlayer2Position(newPosition);
    }

    // Vérifier si on atterrit sur une case de gel
    if (iceCells.includes(newPosition)) {
      setTimeout(() => {
        setMessage("❄️ GEL! Vous reculez d'une case!");
        const newPos = Math.max(newPosition - 1, 0);

        // Mise à jour de la position selon le joueur actuel
        if (currentPlayer === 1) {
          setPlayerPosition(newPos);
        } else {
          setPlayer2Position(newPos);
        }

        // Vérifier si la case après le recul est spéciale
        setTimeout(() => {
          checkSpecialPositions(newPos);
        }, 1000);
      }, 1500);
      return;
    }

    // Vérifier directement les positions spéciales (arrivée, champ de tir)
    checkSpecialPositions(newPosition);
  };

  // Fonction pour vérifier les positions spéciales
  const checkSpecialPositions = (position) => {
    if (position === trackLength) {
      setGameOver(true);
      setWinner(currentPlayer);

      if (gameMode === "solo") {
        setMessage(
          `Course terminée! Temps: ${formatTime(time)}. Pénalités: ${
            misses * 30
          } secondes.`
        );
      } else {
        setMessage(
          `Joueur ${currentPlayer} remporte la partie! Temps: ${formatTime(
            time
          )}.`
        );
      }
    } else if (
      shootingRanges.includes(position) &&
      !(
        currentPlayer === 1 ? visitedShootingRanges : visitedShootingRangesP2
      ).includes(position)
    ) {
      setIsAtShootingRange(true);
      setShootingAttempts(0);
      setMissesCurrentSession(0); // Réinitialiser les tirs ratés de la session
      setMessage(
        `Joueur ${currentPlayer} est arrivé à un champ de tir! Lancez le dé de tir.`
      );
    } else {
      if (gameMode !== "solo") {
        // En mode multiplayer, on change de joueur après chaque mouvement
        const nextPlayer = currentPlayer === 1 ? 2 : 1;
        setMessage(`Tour du joueur ${nextPlayer}. Lancez le dé.`);
        setCurrentPlayer(nextPlayer);
      } else {
        setMessage(
          `Vous avancez à la case ${position}. Lancez à nouveau le dé.`
        );
      }
    }
  };

  // Fonction pour lancer le dé de tir
  const rollShootingDice = () => {
    if (!isAtShootingRange || isRollingShootingDice || gameOver) return;

    setIsRollingShootingDice(true);
    setMessage("Tir en cours...");

    // Animation du dé
    const diceRolling = setInterval(() => {
      setShootingDiceValue(Math.random() < 0.5 ? "blanc" : "noir");
    }, 100);

    // Arrêter l'animation après 1 seconde
    setTimeout(() => {
      clearInterval(diceRolling);
      const result = Math.random() < 0.6 ? "blanc" : "noir"; // 60% de chance de réussite
      setShootingDiceValue(result);
      handleShooting(result);
      setIsRollingShootingDice(false);
    }, 1000);
  };

  // Fonction pour gérer le résultat du tir
  const handleShooting = (result) => {
    const newAttempts = shootingAttempts + 1;
    setShootingAttempts(newAttempts);

    if (result === "noir") {
      // Mise à jour des tirs ratés selon le joueur actuel
      if (currentPlayer === 1) {
        setMisses((prevMisses) => prevMisses + 1);
      } else {
        setMissesPlayer2((prevMisses) => prevMisses + 1);
      }

      setMissesCurrentSession((prev) => prev + 1); // Incrémenter les tirs ratés de la session
      setMessage("Raté! Tir suivant.");
    } else {
      setMessage("Cible touchée! Tir suivant.");
    }

    // Vérifier si tous les tirs ont été effectués
    if (newAttempts >= shotsPerRange) {
      // Ajouter cette position aux champs de tir visités du joueur actuel
      if (currentPlayer === 1) {
        const newVisitedRanges = Array.from(visitedShootingRanges);
        newVisitedRanges.push(playerPosition);
        setVisitedShootingRanges(newVisitedRanges);
      } else {
        const newVisitedRangesP2 = Array.from(visitedShootingRangesP2);
        newVisitedRangesP2.push(player2Position);
        setVisitedShootingRangesP2(newVisitedRangesP2);
      }

      if (missesCurrentSession > 0) {
        setMessage(
          `Vous reculez de ${missesCurrentSession} case(s) pour vos tirs ratés!`
        );

        // Calculer la nouvelle position après recul selon le joueur actuel
        const currentPos =
          currentPlayer === 1 ? playerPosition : player2Position;
        const newPosition = Math.max(0, currentPos - missesCurrentSession);

        // Appliquer le recul avec un délai pour que le joueur voie le message
        setTimeout(() => {
          if (currentPlayer === 1) {
            setPlayerPosition(newPosition);
          } else {
            setPlayer2Position(newPosition);
          }

          setIsAtShootingRange(false);

          setTimeout(() => {
            if (gameMode !== "solo") {
              // En mode multiplayer, changer de joueur
              const nextPlayer = currentPlayer === 1 ? 2 : 1;
              setMessage(
                `Session de tir terminée! Tour du joueur ${nextPlayer}.`
              );
              setCurrentPlayer(nextPlayer);
            } else {
              setMessage(
                "Session de tir terminée! Lancez le dé pour continuer."
              );
            }
          }, 1000);
        }, 2000);
      } else {
        setIsAtShootingRange(false);

        if (gameMode !== "solo") {
          // En mode multiplayer, changer de joueur
          const nextPlayer = currentPlayer === 1 ? 2 : 1;
          setMessage(
            `Session de tir terminée! Tous les tirs réussis! Tour du joueur ${nextPlayer}.`
          );
          setCurrentPlayer(nextPlayer);
        } else {
          setMessage(
            "Session de tir terminée! Tous les tirs réussis! Lancez le dé pour continuer."
          );
        }
      }
    }
  };

  // Fonction pour simuler un tour de l'ordinateur
  const computerTurn = () => {
    if (
      gameMode !== "pvc" ||
      currentPlayer !== 2 ||
      gameOver ||
      isAtShootingRange
    )
      return;

    // Attendre un peu pour simuler la "réflexion" de l'ordinateur
    setTimeout(() => {
      // Lancer le dé de mouvement
      rollMovementDiceComputer();
    }, 1500);
  };

  // Lancer automatiquement le dé pour l'ordinateur
  const rollMovementDiceComputer = () => {
    if (isRollingMovementDice) return;

    setIsRollingMovementDice(true);
    setMessage("L'ordinateur lance le dé...");

    const diceRolling = setInterval(() => {
      setMovementDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
      clearInterval(diceRolling);
      const result = Math.floor(Math.random() * 6) + 1;
      setMovementDiceValue(result);
      movePlayer(result);
      setIsRollingMovementDice(false);
    }, 1000);
  };

  // Lancer automatiquement le dé de tir pour l'ordinateur
  const rollShootingDiceComputer = () => {
    if (isRollingShootingDice) return;

    setIsRollingShootingDice(true);
    setMessage("L'ordinateur tire...");

    const diceRolling = setInterval(() => {
      setShootingDiceValue(Math.random() < 0.5 ? "blanc" : "noir");
    }, 100);

    setTimeout(() => {
      clearInterval(diceRolling);
      // Donner à l'ordinateur 70% de chance de réussite (légèrement meilleur que le joueur)
      const result = Math.random() < 0.7 ? "blanc" : "noir";
      setShootingDiceValue(result);
      handleShooting(result);
      setIsRollingShootingDice(false);
    }, 1000);
  };

  // Déclencher le tour de l'ordinateur quand c'est son tour
  useEffect(() => {
    if (gameMode === "pvc" && currentPlayer === 2 && !gameOver) {
      if (isAtShootingRange) {
        // Si on est sur un champ de tir, l'ordinateur tire après un court délai
        setTimeout(() => {
          rollShootingDiceComputer();
        }, 1500);
      } else {
        // Sinon, l'ordinateur lance le dé de mouvement
        computerTurn();
      }
    }
  }, [currentPlayer, isAtShootingRange, gameMode, gameOver]);

  // Formater le temps
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Calculer le temps total avec pénalités
  const getTotalTime = () => {
    const penaltyTime = misses * 30; // 30 secondes par tir raté
    return time + penaltyTime;
  };

  // Changer de mode de jeu
  const changeGameMode = (mode) => {
    setGameMode(mode);
    restartGame();
  };

  // Redémarrer le jeu
  const restartGame = () => {
    setPlayerPosition(0);
    setPlayer2Position(0);
    setMovementDiceValue(0);
    setShootingDiceValue(null);
    setIsAtShootingRange(false);
    setShootingAttempts(0);
    setMisses(0);
    setMissesPlayer2(0);
    setMissesCurrentSession(0);
    setVisitedShootingRanges([]);
    setVisitedShootingRangesP2([]);
    setGameOver(false);
    setTime(0);
    setCurrentPlayer(1);
    setWinner(0); // Réinitialiser à 0 au lieu de null
    setMessage("Lancez le dé pour commencer la course!");
  };

  // Rendu du plateau
  const renderTrack = () => {
    const track = [];

    for (let i = 0; i <= trackLength; i++) {
      const isShootingRange = shootingRanges.includes(i);
      const hasPlayer1 = playerPosition === i;
      const hasPlayer2 = player2Position === i;
      const isFinishLine = i === trackLength;
      const isIceCell = iceCells.includes(i);

      track.push(
        <div
          key={i}
          className={`track-cell ${isShootingRange ? "shooting-range" : ""} ${
            hasPlayer1 ? "has-player1" : ""
          } ${hasPlayer2 ? "has-player2" : ""} ${
            isFinishLine ? "finish-line" : ""
          } ${isIceCell ? "ice-cell" : ""}`}
        >
          {isShootingRange && <div className="range-icon">🎯</div>}
          {isFinishLine && <div className="finish-icon">🏁</div>}
          {isIceCell && <div className="ice-icon">❄️</div>}

          {/* Afficher les pions des joueurs avec leurs jetons personnalisés */}
          {hasPlayer1 && <div className="player player1">{playerToken}</div>}
          {hasPlayer2 && (
            <div className="player player2">
              {gameMode === "pvc" ? computerToken : player2Token}
            </div>
          )}

          <div className="cell-number">{i}</div>
        </div>
      );
    }

    return <div className="biathlon-track">{track}</div>;
  };

  // Rendu du dé de tir
  const renderShootingDice = () => {
    return (
      <div
        className={`shooting-dice ${isRollingShootingDice ? "rolling" : ""}`}
      >
        {shootingDiceValue === "blanc" && (
          <div className="dice-result white">⚪</div>
        )}
        {shootingDiceValue === "noir" && (
          <div className="dice-result black">⚫</div>
        )}
        {shootingDiceValue === null && (
          <div className="dice-placeholder">?</div>
        )}
      </div>
    );
  };

  return (
    <div className={`biathlon-game `}>
      <h2 className="game-title">Biathlon</h2>

      <div className="mode-selector">
        <button
          className={`mode-button ${gameMode === "solo" ? "active" : ""}`}
          onClick={() => changeGameMode("solo")}
        >
          Solo
        </button>
        <button
          className={`mode-button ${gameMode === "pvp" ? "active" : ""}`}
          onClick={() => changeGameMode("pvp")}
        >
          Joueur vs Joueur
        </button>
        <button
          className={`mode-button ${gameMode === "pvc" ? "active" : ""}`}
          onClick={() => changeGameMode("pvc")}
        >
          Joueur vs Ordinateur
        </button>
      </div>

      {/* Ajout de la sélection de jetons */}
      <div className="token-selector">
        <div className="token-section">
          <h3>Jeton Joueur 1</h3>
          <div className="token-options">
            {availableTokens.map((token) => (
              <button
                key={token}
                onClick={() => setPlayerToken(token)}
                className={playerToken === token ? "selected" : ""}
                disabled={
                  (gameMode !== "solo" && player2Token === token) ||
                  (gameMode === "pvc" && computerToken === token)
                }
              >
                {token}
              </button>
            ))}
          </div>
        </div>

        {gameMode === "pvp" && (
          <div className="token-section">
            <h3>Jeton Joueur 2</h3>
            <div className="token-options">
              {availableTokens.map((token) => (
                <button
                  key={token}
                  onClick={() => setPlayer2Token(token)}
                  className={player2Token === token ? "selected" : ""}
                  disabled={playerToken === token}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameMode === "pvc" && (
          <div className="token-section">
            <h3>Jeton Ordinateur</h3>
            <div className="token-options">
              {availableTokens.map((token) => (
                <button
                  key={token}
                  onClick={() => setComputerToken(token)}
                  className={computerToken === token ? "selected" : ""}
                  disabled={playerToken === token}
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="game-info">
        <div className="info-item">
          <span className="info-label">Tour:</span>
          {gameMode === "solo"
            ? "Joueur"
            : gameMode === "pvp"
            ? `Joueur ${currentPlayer}`
            : currentPlayer === 1
            ? "Joueur"
            : "Ordinateur"}
        </div>
        <div className="info-item">
          <span className="info-label">Joueur 1:</span> {playerPosition}/
          {trackLength}
        </div>
        {gameMode !== "solo" && (
          <div className="info-item">
            <span className="info-label">
              {gameMode === "pvp" ? "Joueur 2" : "Ordinateur"}:
            </span>{" "}
            {player2Position}/{trackLength}
          </div>
        )}
        <div className="info-item">
          <span className="info-label">Temps:</span> {formatTime(time)}
        </div>

        {/* Statistiques du Joueur 1 */}
        <div className="info-item">
          <span className="info-label">Pénalités J1:</span> {misses * 30}s (
          {misses} tirs ratés)
        </div>

        {/* Statistiques du Joueur 2 ou de l'ordinateur */}
        {gameMode !== "solo" && (
          <div className="info-item">
            <span className="info-label">
              Pénalités {gameMode === "pvp" ? "J2" : "Ordi"}:
            </span>{" "}
            {missesPlayer2 * 30}s ({missesPlayer2} tirs ratés)
          </div>
        )}
      </div>

      <div className="game-message">{message}</div>

      <div className="game-content">
        {renderTrack()}

        <div className="game-controls">
          <div className="dice-section">
            <h3>Dé de mouvement</h3>
            <div
              className={`movement-dice ${
                isRollingMovementDice ? "rolling" : ""
              }`}
            >
              {movementDiceValue > 0 ? movementDiceValue : "?"}
            </div>
            <button
              onClick={rollMovementDice}
              disabled={isAtShootingRange || isRollingMovementDice || gameOver}
            >
              Lancer le dé de mouvement
            </button>
          </div>

          <div className="dice-section">
            <h3>Dé de tir</h3>
            {renderShootingDice()}
            <button
              onClick={rollShootingDice}
              disabled={!isAtShootingRange || isRollingShootingDice || gameOver}
            >
              Lancer le dé de tir
              {isAtShootingRange && ` (${shootingAttempts}/${shotsPerRange})`}
            </button>
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h3>Course terminée!</h3>
          {gameMode === "solo" ? (
            <p>Temps final: {formatTime(getTotalTime())}</p>
          ) : (
            <p>Le Joueur {winner} remporte la partie!</p>
          )}
          <button onClick={restartGame} className="restart-button">
            Recommencer
          </button>
        </div>
      )}

      <div className="game-rules">
        <h3>Règles du jeu</h3>
        <p>1. Lancez le dé pour avancer sur la piste.</p>
        <p>
          2. Vous devez obligatoirement vous arrêter aux champs de tir (🎯).
        </p>
        <p>3. À chaque champ de tir, effectuez 5 tirs.</p>
        <p>
          4. Après les 5 tirs, vous reculez d'autant de cases que de tirs ratés.
        </p>
        <p>5. Les cases de gel (❄️) vous font reculer d'une case.</p>
        <p>6. Atteignez l'arrivée le plus rapidement possible!</p>
        {gameMode !== "solo" && (
          <p>7. En mode multijoueur, le premier à atteindre l'arrivée gagne!</p>
        )}
      </div>
    </div>
  );
}

export default Biathlon;
