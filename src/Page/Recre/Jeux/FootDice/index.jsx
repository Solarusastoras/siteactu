import React, { useState, useEffect, useCallback } from "react";
import "./footdice.scss";

function FootDice () {


  // États du jeu
  const [gameMode, setGameMode] = useState("menu");
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [currentDefender, setCurrentDefender] = useState(2); // L'adversaire du tireur
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(5);

  // États des dés
  const [shooterDice, setShooterDice] = useState(0); // 1 dé spécial (1-6)
  const [keeperDice, setKeeperDice] = useState([0, 0]); // 2D6
  const [keeperScore, setKeeperScore] = useState(0); // Score total du gardien
  const [isRolling, setIsRolling] = useState(false);
  const [isWaitingForShot, setIsWaitingForShot] = useState(false);
  const [isWaitingForKeeperRoll, setIsWaitingForKeeperRoll] = useState(false); // Attente du lancer du gardien
  const [blockedZones, setBlockedZones] = useState(
    /** @type {number[]} */ ([])
  ); // Zones bloquées par le gardien
  const [aiChosenZone, setAiChosenZone] = useState(
    /** @type {number | null} */ (null)
  ); // Zone choisie par l'IA (cachée)

  // États des scores
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [lastResult, setLastResult] = useState("");
  const [showResult, setShowResult] = useState(false);

  // États pour la cage (8 zones)
  const [selectedZone, setSelectedZone] = useState(
    /** @type {number | null} */ (null)
  );
  const goalZones = React.useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8], []); // 8 zones dans la cage

  // États pour l'IA et les séquences de tir
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [shootSequence, setShootSequence] = useState([1, 2, 2, 1, 1, 2]);
  const [shootIndex, setShootIndex] = useState(0);

  // Mode Championnat
  const [currentMatchday, setCurrentMatchday] = useState(1);
  const [currentOpponent, setCurrentOpponent] = useState("");
  const [championshipTeams, setChampionshipTeams] = useState([
    {
      id: 1,
      name: "Paris",
      originalName: "Paris Saint-Germain",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    },
    {
      id: 2,
      name: "Nice",
      originalName: "OGC Nice",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    },
    {
      id: 3,
      name: "Lyon",
      originalName: "Olympique Lyonnais",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    },
    {
      id: 4,
      name: "Barcelona",
      originalName: "FC Barcelona",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    },
    {
      id: 5,
      name: "Madrid",
      originalName: "Real Madrid",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    },
    {
      id: 6,
      name: "Juventus",
      originalName: "Juventus FC",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    },
    {
      id: 7,
      name: "Milan",
      originalName: "AC Milan",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    },
  ]);

  const [championshipFixtures, setChampionshipFixtures] = useState([
    {
      matchday: 1,
      homeTeam: "",
      awayTeam: "",
      played: false,
      homeScore: 0,
      awayScore: 0,
    },
  ]);

  // Fonctions utilitaires
  const rollD6 = () => Math.floor(Math.random() * 6) + 1;

  // Dé spécial tireur : 1-4 = ballon (⚽), 5-6 = raté (❌)
  const rollShooterDice = () => {
    const result = rollD6();
    return result <= 4 ? 1 : 0; // 1 = ballon, 0 = raté
  };

  // Fonction pour sélectionner aléatoirement les zones bloquées
  const getBlockedZones = useCallback(
    (/** @type {number} */ count) => {
      if (count <= 0) return [];
      if (count >= 8) return [...goalZones];

      const shuffled = [...goalZones].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    },
    [goalZones]
  ); // Fonction pour générer la séquence de tirs personnalisée
  const getShootSequence = (
    /** @type {boolean} */ isPlayerHome,
    /** @type {number} */ rounds = 5
  ) => {
    if (isPlayerHome) {
      // Joueur à domicile : J1, Ordi, Ordi, J1, J1, Ordi
      return [1, 2, 2, 1, 1, 2];
    } else {
      // Ordi à domicile : Ordi, J1, J1, Ordi, Ordi, J1
      return [2, 1, 1, 2, 2, 1];
    }
  };

  // Fonction pour déterminer le tireur actuel selon la séquence
  const getCurrentShooter = useCallback(() => {
    if (shootSequence.length === 0) return 1;
    return shootSequence[shootIndex] || 1;
  }, [shootSequence, shootIndex]);

  // Fonction pour passer au tour suivant selon la séquence
  const nextTurn = useCallback(() => {
    if (shootIndex < shootSequence.length - 1) {
      setShootIndex(shootIndex + 1);
      const nextShooter = shootSequence[shootIndex + 1];
      setCurrentPlayer(nextShooter);
      // Mettre à jour le défenseur pour le prochain tour
      setCurrentDefender(nextShooter === 1 ? 2 : 1);
      // Activer/désactiver isAIPlaying selon qui tire
      if (nextShooter === 2) {
        setIsAIPlaying(true);
      } else {
        setIsAIPlaying(false);
      }
    } else {
      // Fin de la partie
      setGameMode("gameOver");
    }
  }, [shootIndex, shootSequence]);

  // Fonction de gestion du tir avec la nouvelle mécanique
  const handleShoot = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);
    setLastResult("");
    setShowResult(false);
    setSelectedZone(null);
    setAiChosenZone(null);

    // Déterminer qui tire selon la séquence
    const shooter = getCurrentShooter();
    const defender = shooter === 1 ? 2 : 1; // L'adversaire du tireur
    setCurrentDefender(defender);

    // Si c'est l'IA qui tire, elle choisit sa zone maintenant (en secret)
    if (shooter === 2) {
      setIsAIPlaying(true);
    }

    // Phase 1 : Lancer le dé spécial du tireur (1 seul dé)
    const startTime = Date.now();
    const animationDuration = 1000;

    const animateShooterDice = () => {
      if (Date.now() - startTime < animationDuration) {
        setShooterDice(rollD6());
        requestAnimationFrame(animateShooterDice);
      } else {
        // Finaliser le résultat du tireur
        const finalShooterDice = rollShooterDice();
        setShooterDice(finalShooterDice);

        // Si raté (0), tir raté automatiquement
        if (finalShooterDice === 0) {
          setIsRolling(false);
          setLastResult("TIR RATÉ ! ❌");
          setShowResult(true);

          setTimeout(() => {
            setIsAIPlaying(false);
            setIsWaitingForShot(false);
            setIsWaitingForKeeperRoll(false);
            setBlockedZones([]);
            setSelectedZone(null);
            setAiChosenZone(null);
            if (round < maxRounds) {
              setRound((prev) => prev + 1);
              nextTurn();
            } else {
              setGameMode("gameOver");
            }
          }, 2000);
          return;
        }

        setIsRolling(false);
        // Le défenseur lance les dés du gardien
        // Si l'IA défend, elle lance automatiquement
        // Si le joueur défend, on attend qu'il appuie sur le bouton
        if (defender === 2) {
          // L'IA défend, elle lance automatiquement
          setTimeout(() => handleKeeperRoll(), 1500);
        } else {
          // Le joueur défend, attendre qu'il clique
          setIsWaitingForKeeperRoll(true);
        }
      }
    };

    animateShooterDice();
  }, [
    round,
    maxRounds,
    isRolling,
    getCurrentShooter,
    nextTurn,
    rollShooterDice,
  ]);

  // Nouvelle fonction pour lancer les dés du gardien
  const handleKeeperRoll = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);
    setIsWaitingForKeeperRoll(false);

    const currentShooter = getCurrentShooter();
    const animationDuration = 1000;
    const startTimeKeeper = Date.now();

    const animateKeeperDiceLoop = () => {
      if (Date.now() - startTimeKeeper < animationDuration) {
        setKeeperDice([rollD6(), rollD6()]);
        requestAnimationFrame(animateKeeperDiceLoop);
      } else {
        // Finaliser les dés du gardien
        const finalKeeperDice = [rollD6(), rollD6()];
        setKeeperDice(finalKeeperDice);
        const totalKeeperScore = finalKeeperDice[0] + finalKeeperDice[1];
        setKeeperScore(totalKeeperScore);

        // Déterminer les zones bloquées selon le score
        let blockedCount = 0;
        if (totalKeeperScore >= 11) {
          blockedCount = 7;
        } else if (totalKeeperScore >= 9) {
          blockedCount = 6;
        } else if (totalKeeperScore >= 6) {
          blockedCount = 4;
        } else if (totalKeeperScore >= 3) {
          blockedCount = 2;
        } else {
          blockedCount = 1;
        }
        const blocked = getBlockedZones(blockedCount);
        setBlockedZones(blocked);

        setIsRolling(false);
        setIsWaitingForShot(true);

        // Si c'est l'IA qui TIRE (pas qui défend), elle choisit sa zone en secret
        if (currentShooter === 2) {
          const availableZones = goalZones.filter((z) => !blocked.includes(z));
          const chosenZone =
            availableZones.length > 0
              ? availableZones[
                  Math.floor(Math.random() * availableZones.length)
                ]
              : goalZones[Math.floor(Math.random() * goalZones.length)];
          setAiChosenZone(chosenZone);
          // L'IA cliquera automatiquement via le useEffect
        }
      }
    };

    animateKeeperDiceLoop();
  }, [isRolling, getCurrentShooter, getBlockedZones, goalZones]);

  // Fonction pour choisir une zone de tir
  const handleZoneClick = useCallback(
    (/** @type {number} */ zone) => {
      if (!isWaitingForShot || isRolling || selectedZone !== null) return;

      const shooter = getCurrentShooter();

      // Si c'est l'IA, on révèle son choix
      if (shooter === 2 && aiChosenZone !== null) {
        setSelectedZone(aiChosenZone);
        zone = aiChosenZone;
      } else {
        setSelectedZone(zone);
      }

      // Vérifier si la zone est bloquée
      const isBlocked = blockedZones.includes(zone);

      setTimeout(() => {
        if (isBlocked) {
          setLastResult("ARRÊT DU GARDIEN ! 🧤");
        } else {
          setLastResult("BUT ! ⚽");
          // Mettre à jour les scores
          if (shooter === 1) {
            setPlayer1Score((prev) => prev + 1);
          } else {
            setPlayer2Score((prev) => prev + 1);
          }
        }

        setShowResult(true);
        setIsWaitingForShot(false);

        // Passer au tour suivant après 2 secondes
        setTimeout(() => {
          setIsAIPlaying(false);
          setSelectedZone(null);
          setBlockedZones([]);
          setAiChosenZone(null);
          if (round < maxRounds) {
            setRound((prev) => prev + 1);
            nextTurn();
          } else {
            setGameMode("gameOver");
          }
        }, 2000);
      }, 500);
    },
    [
      isWaitingForShot,
      isRolling,
      selectedZone,
      blockedZones,
      getCurrentShooter,
      aiChosenZone,
      round,
      maxRounds,
      nextTurn,
    ]
  );

  // Fonction pour démarrer une nouvelle partie
  const startNewGame = (vsAI = false) => {
    setCurrentPlayer(1);
    setCurrentDefender(2);
    setRound(1);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setShooterDice(0);
    setKeeperDice([0, 0]);
    setKeeperScore(0);
    setIsRolling(false);
    setIsWaitingForShot(false);
    setIsWaitingForKeeperRoll(false);
    setLastResult("");
    setShowResult(false);
    setIsAIPlaying(false);
    setBlockedZones([]);
    setSelectedZone(null);
    setAiChosenZone(null);

    // Définir l'adversaire selon le mode
    if (vsAI && !currentOpponent) {
      setCurrentOpponent("IA"); // Mode Joueur vs IA
    }

    setGameMode("playing");

    // Initialiser la séquence de tirs
    let isPlayerHome = true;
    if (gameMode === "championship" && currentOpponent) {
      const fixture = championshipFixtures.find(
        (f) =>
          !f.played &&
          ((f.homeTeam === "player" && f.awayTeam === currentOpponent) ||
            (f.homeTeam === currentOpponent && f.awayTeam === "player"))
      );
      if (fixture) {
        isPlayerHome = fixture.homeTeam === "player";
      }
    }

    const sequence = getShootSequence(isPlayerHome, maxRounds);
    setShootSequence(sequence);
    setShootIndex(0);

    // Si le premier tireur est l'IA (joueur 2), activer isAIPlaying
    if (sequence[0] === 2) {
      setIsAIPlaying(true);
    }
  };

  // Générer les calendriers de championnat
  const generateChampionshipFixtures = () => {
    const fixtures = [];
    const teams = ["player", ...championshipTeams.map((t) => t.name)];

    for (let matchday = 1; matchday <= 7; matchday++) {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          if (matchday % 2 === 1) {
            fixtures.push({
              matchday,
              homeTeam: teams[i],
              awayTeam: teams[j],
              played: false,
              homeScore: 0,
              awayScore: 0,
            });
          } else {
            fixtures.push({
              matchday,
              homeTeam: teams[j],
              awayTeam: teams[i],
              played: false,
              homeScore: 0,
              awayScore: 0,
            });
          }
        }
      }
    }

    return fixtures.slice(0, 21); // 7 équipes = 21 matches
  };

  // Fonction pour démarrer le championnat
  const startChampionship = () => {
    const fixtures = generateChampionshipFixtures();
    setChampionshipFixtures(fixtures);
    setCurrentMatchday(1);
    setGameMode("championship");

    // Trouver le premier adversaire
    const firstFixture = fixtures.find(
      (f) =>
        f.matchday === 1 && (f.homeTeam === "player" || f.awayTeam === "player")
    );
    if (firstFixture) {
      setCurrentOpponent(
        firstFixture.homeTeam === "player"
          ? firstFixture.awayTeam
          : firstFixture.homeTeam
      );
    }
  };

  // Fonction pour revenir au menu
  const backToMenu = () => {
    setGameMode("menu");
    setCurrentPlayer(1);
    setCurrentDefender(2);
    setRound(1);
    setPlayer1Score(0);
    setPlayer2Score(0);
    setShooterDice(0);
    setKeeperDice([0, 0]);
    setKeeperScore(0);
    setIsRolling(false);
    setIsWaitingForShot(false);
    setIsWaitingForKeeperRoll(false);
    setLastResult("");
    setShowResult(false);
    setIsAIPlaying(false);
    setCurrentOpponent("");
    setShootSequence([]);
    setShootIndex(0);
    setBlockedZones([]);
    setSelectedZone(null);
    setAiChosenZone(null);
  };

  // Effet pour l'IA qui tire automatiquement
  useEffect(() => {
    if (
      isAIPlaying &&
      gameMode === "playing" &&
      !isRolling &&
      !isWaitingForShot &&
      !isWaitingForKeeperRoll
    ) {
      const timer = setTimeout(() => {
        handleShoot();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [
    isAIPlaying,
    gameMode,
    isRolling,
    isWaitingForShot,
    isWaitingForKeeperRoll,
    handleShoot,
  ]);

  // Effet pour l'IA qui révèle son choix automatiquement après un délai
  useEffect(() => {
    if (
      isAIPlaying &&
      isWaitingForShot &&
      selectedZone === null &&
      aiChosenZone !== null
    ) {
      const timer = setTimeout(() => {
        // L'IA révèle son choix (déjà fait dans handleShoot)
        handleZoneClick(aiChosenZone);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [
    isAIPlaying,
    isWaitingForShot,
    selectedZone,
    aiChosenZone,
    handleZoneClick,
  ]);

  // Rendu du composant
  return (
    <div className="foot-dice">
      <div className="game-container">
        <h1>FootDice ⚽</h1>

        {gameMode === "menu" && (
          <div className="menu">
            <h2>Choisissez votre mode de jeu</h2>
            <div className="menu-buttons">
              <button onClick={() => startNewGame(false)} className="menu-btn">
                Joueur vs Joueur
              </button>
              <button onClick={() => startNewGame(true)} className="menu-btn">
                Joueur vs IA
              </button>
              <button onClick={startChampionship} className="menu-btn">
                Championnat
              </button>
            </div>
          </div>
        )}

        {gameMode === "playing" && (
          <div className="game-area">
            <div className="game-header">
              <div className="score-board">
                <div className="score-item">
                  <span className="player-name">Joueur</span>
                  <span className="score">{player1Score}</span>
                </div>
                <div className="score-display">
                  <div className="score-big">
                    {player1Score} - {player2Score}
                  </div>
                  <div className="round-info">
                    Tir {round}/{maxRounds}
                  </div>
                </div>
                <div className="score-item">
                  <span className="player-name">
                    {currentOpponent || "Joueur 2"}
                  </span>
                  <span className="score">{player2Score}</span>
                </div>
              </div>
            </div>

            <div className="current-player">
              <h3>
                <span className="player-indicator">
                  Tireur : {getCurrentShooter() === 1 ? "Joueur" : "IA"}
                </span>
                {" | "}
                <span className="goalkeeper-indicator">
                  Gardien : {currentDefender === 1 ? "Joueur" : "IA"}
                </span>
              </h3>
            </div>

            <div className="dice-section">
              <div className="dice-container">
                <div className="dice-group">
                  <h4>Dé Tireur (4 faces ⚽, 2 faces ❌)</h4>
                  <div className="dice-pair">
                    <div
                      className={`dice special shooter-dice ${
                        isRolling ? "rolling" : ""
                      }`}
                    >
                      {shooterDice === 1
                        ? "⚽"
                        : shooterDice === 0
                        ? "❌"
                        : "?"}
                    </div>
                  </div>
                  <div className="dice-info">
                    {shooterDice === 1
                      ? "Ballon ! ⚽"
                      : shooterDice === 0
                      ? "Raté ! ❌"
                      : "En attente..."}
                  </div>
                </div>

                <div className="vs">VS</div>

                <div className="dice-group">
                  <h4>Dés Gardien (2D6)</h4>
                  <div className="dice-pair">
                    {keeperDice.map((die, index) => (
                      <div
                        key={index}
                        className={`dice keeper-dice ${
                          isRolling ? "rolling" : ""
                        }`}
                      >
                        {die || "?"}
                      </div>
                    ))}
                  </div>
                  <div className="dice-info">
                    Total: {keeperScore} →{" "}
                    {keeperScore >= 11
                      ? 7
                      : keeperScore >= 9
                      ? 6
                      : keeperScore >= 6
                      ? 4
                      : keeperScore >= 3
                      ? 2
                      : 1}{" "}
                    zones bloquées
                  </div>
                </div>
              </div>

              {/* Cage avec 8 zones */}
              {isWaitingForShot && (
                <div className="goal-cage">
                  <h4>
                    {isAIPlaying
                      ? "L'IA choisit sa zone de tir..."
                      : "Choisissez votre zone de tir :"}
                  </h4>
                  <div className="cage-zones">
                    {goalZones.map((zone) => {
                      const isBlocked = blockedZones.includes(zone);
                      const isSelected = selectedZone === zone;
                      return (
                        <div
                          key={zone}
                          className={`zone ${isBlocked ? "blocked" : "free"} ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => !isAIPlaying && handleZoneClick(zone)}
                        >
                          <span className="zone-number">{zone}</span>
                          {isBlocked && <span className="keeper-icon">🧤</span>}
                          {isSelected && !isBlocked && (
                            <span className="ball-icon">⚽</span>
                          )}
                          {isSelected && isBlocked && (
                            <span className="save-icon">✋</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {showResult && lastResult && (
                <div
                  className={`result ${
                    lastResult.includes("BUT") ? "goal" : "save"
                  }`}
                >
                  {lastResult}
                </div>
              )}
            </div>

            <div className="controls">
              {/* Bouton pour le tireur - s'affiche quand le joueur tire */}
              {!isRolling &&
                !isWaitingForShot &&
                !isAIPlaying &&
                !isWaitingForKeeperRoll &&
                getCurrentShooter() === 1 && (
                  <button onClick={handleShoot} className="shoot-btn">
                    Lancer le dé du tireur ! 🎲
                  </button>
                )}

              {/* Bouton gardien - s'affiche quand le joueur DÉFEND (l'IA tire) */}
              {isWaitingForKeeperRoll && currentDefender === 1 && (
                <button
                  onClick={() => handleKeeperRoll()}
                  className="keeper-btn"
                >
                  Lancer les dés du gardien ! 🧤
                </button>
              )}

              {isRolling && <div className="status">Lancement des dés...</div>}

              {/* Message quand le joueur doit choisir une zone (il tire) */}
              {isWaitingForShot &&
                !isAIPlaying &&
                getCurrentShooter() === 1 && (
                  <div className="status">Choisissez une zone de tir !</div>
                )}

              {/* Message quand l'IA a choisi sa zone */}
              {isAIPlaying && isWaitingForShot && (
                <div className="status">L'IA a choisi sa zone... 🤔</div>
              )}

              {/* Message quand l'IA prépare son tir */}
              {isAIPlaying && !isWaitingForShot && !isRolling && (
                <div className="status">L'IA prépare son tir...</div>
              )}

              {/* Message quand l'IA défend et le joueur doit tirer */}
              {isWaitingForKeeperRoll && currentDefender === 2 && (
                <div className="status">L'IA lance les dés du gardien...</div>
              )}
            </div>

            <button onClick={backToMenu} className="back-btn">
              Retour au menu
            </button>
          </div>
        )}

        {gameMode === "gameOver" && (
          <div className="game-over">
            <h2>Fin de la partie !</h2>
            <div className="final-score">
              <div className="final-score-item">
                <span>Joueur</span>
                <span className="final-score-value">{player1Score}</span>
              </div>
              <div className="final-score-divider">-</div>
              <div className="final-score-item">
                <span>{currentOpponent || "Joueur 2"}</span>
                <span className="final-score-value">{player2Score}</span>
              </div>
            </div>

            <div className="winner">
              {player1Score > player2Score
                ? "Joueur a gagné !"
                : player2Score > player1Score
                ? `${currentOpponent || "Joueur 2"} a gagné !`
                : "Match nul !"}
            </div>

            <div className="game-over-buttons">
              <button
                onClick={() => startNewGame(currentOpponent !== null)}
                className="menu-btn"
              >
                Rejouer
              </button>
              <button onClick={backToMenu} className="menu-btn">
                Menu principal
              </button>
            </div>
          </div>
        )}

        {gameMode === "championship" && (
          <div className="championship">
            <h2>Mode Championnat</h2>
            <div className="championship-info">
              <p>Journée {currentMatchday}/7</p>
              {currentOpponent && <p>Prochain adversaire: {currentOpponent}</p>}
            </div>

            <div className="championship-buttons">
              <button onClick={() => startNewGame(true)} className="menu-btn">
                Jouer le match
              </button>
              <button onClick={backToMenu} className="menu-btn">
                Retour au menu
              </button>
            </div>

            <div className="championship-table">
              <h3>Classement</h3>
              <table>
                <thead>
                  <tr>
                    <th>Équipe</th>
                    <th>J</th>
                    <th>G</th>
                    <th>N</th>
                    <th>P</th>
                    <th>BP</th>
                    <th>BC</th>
                    <th>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {championshipTeams
                    .sort((a, b) => b.points - a.points)
                    .map((team) => (
                      <tr key={team.id}>
                        <td>{team.name}</td>
                        <td>{team.played}</td>
                        <td>{team.won}</td>
                        <td>{team.drawn}</td>
                        <td>{team.lost}</td>
                        <td>{team.goalsFor}</td>
                        <td>{team.goalsAgainst}</td>
                        <td>{team.points}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FootDice;
