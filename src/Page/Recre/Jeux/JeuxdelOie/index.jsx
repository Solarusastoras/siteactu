import React, { useState, useEffect, useCallback } from "react";
import "./_jeuxoie.scss";
import DataJeuxOie from "../../../../Data/DataJeux/DataJeuxOie.json";

const tokenChoices = ["🧙", "🦊", "🦁", "🐧", "🦄", "🦈", "🐴", "⚽"];

function JeuDeLOie () {
  const [diceValues, setDiceValues] = useState([1, 1]);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [computerPosition, setComputerPosition] = useState(0);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState(
    "Lancez le dé pour commencer la partie !"
  );
  const [gameOver, setGameOver] = useState(false);
  const [canRoll, setCanRoll] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentTurn, setCurrentTurn] = useState("player"); // player ou computer
  const [computerThinking, setComputerThinking] = useState(false);
  const [selectedToken, setSelectedToken] = useState(tokenChoices[0]);
  const [animatingMove, setAnimatingMove] = useState(false);
  const [moveSteps, setMoveSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedPlayer, setAnimatedPlayer] = useState(null); // 'player' ou 'computer'

  // Nouveaux états pour la règle n°2
  const [playerTokens, setPlayerTokens] = useState(5); // Jetons du joueur
  const [computerTokens, setComputerTokens] = useState(5); // Jetons de l'ordinateur
  const [commonTokenPool, setCommonTokenPool] = useState(0); // Pool commun de jetons
  const [playerTrapped, setPlayerTrapped] = useState(false); // Si le joueur est piégé (puits ou prison)
  const [computerTrapped, setComputerTrapped] = useState(false); // Si l'ordinateur est piégé
  const [trapCase, setTrapCase] = useState(null); // La case où un joueur est piégé
  const [playerSkipTurns, setPlayerSkipTurns] = useState(0); // Tours à sauter pour le joueur
  const [computerSkipTurns, setComputerSkipTurns] = useState(0); // Tours à sauter pour l'ordinateur
  const [firstTurn, setFirstTurn] = useState(true); // Premier tour de jeu pour les règles spéciales de début

  // Nombre total de cases sur le plateau
  const totalCases = 63;

  // Utilisation des cases spéciales depuis le fichier JSON
  const specialCases = React.useMemo(() => DataJeuxOie.specialCases, []);

  // Fonction pour lancer les dés (joueur)
  const rollDice = () => {
    if (
      !canRoll ||
      gameOver ||
      currentTurn !== "player" ||
      (playerTrapped && trapCase !== computerPosition) ||
      playerSkipTurns > 0
    )
      return;

    setIsRolling(true);
    setCanRoll(false);

    // Simuler le roulement des dés
    const rollInterval = setInterval(() => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      setDiceValues([dice1, dice2]);
    }, 100);

    // Arrêter après 1 seconde et calculer le mouvement
    setTimeout(() => {
      clearInterval(rollInterval);
      const newDiceValues = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      setDiceValues(newDiceValues);

      // Vérifier les règles spéciales de début de partie
      const dice1 = newDiceValues[0];
      const dice2 = newDiceValues[1];
      const totalValue = dice1 + dice2;

      if (firstTurn) {
        // Règles du premier lancer
        if ((dice1 === 3 && dice2 === 6) || (dice1 === 6 && dice2 === 3)) {
          setMessage(
            "Vous avez fait 3 et 6 ! Vous avancez directement à la case 26."
          );
          setPlayerPosition(26);
          addToHistory(0, 26, "règle spéciale", "player");
          setFirstTurn(false);
          setCanRoll(true);
          return;
        } else if (
          (dice1 === 4 && dice2 === 5) ||
          (dice1 === 5 && dice2 === 4)
        ) {
          setMessage(
            "Vous avez fait 4 et 5 ! Vous avancez directement à la case 53."
          );
          setPlayerPosition(53);
          addToHistory(0, 53, "règle spéciale", "player");
          setFirstTurn(false);
          setCanRoll(true);
          return;
        }
        setFirstTurn(false);
      }

      // Vérifier si l'ordinateur est piégé et si on peut le sauver
      if (computerTrapped && computerPosition === playerPosition + totalValue) {
        setMessage(`Vous avez sauvé l'ordinateur! Il vous donne 1 jeton.`);
        setComputerTrapped(false);
        setTrapCase(null);

        // L'ordinateur paie 1 jeton pour être sauvé
        if (computerTokens > 0) {
          setComputerTokens((prev) => prev - 1);
          setPlayerTokens((prev) => prev + 1);
          addToHistory(
            playerPosition,
            playerPosition + totalValue,
            "sauvetage",
            "player"
          );
        }

        // Le joueur continue sa route, l'ordinateur va où le joueur était
        movePlayer(totalValue);
        setComputerPosition(playerPosition);
        return;
      }

      movePlayer(totalValue);
      setIsRolling(false);
    }, 1000);
  };

  // Fonction pour gérer les paiements en jetons
  const handleTokenPayment = (amount, playerType) => {
    if (playerType === "player") {
      if (playerTokens >= amount) {
        setPlayerTokens((prev) => prev - amount);
        setCommonTokenPool((prev) => prev + amount);
        return true;
      }
      return false;
    } else {
      if (computerTokens >= amount) {
        setComputerTokens((prev) => prev - amount);
        setCommonTokenPool((prev) => prev + amount);
        return true;
      }
      return false;
    }
  };

  // Fonction pour déplacer le joueur humain
  const movePlayer = (spaces) => {
    // Si le joueur doit sauter des tours
    if (playerSkipTurns > 0) {
      setPlayerSkipTurns((prev) => prev - 1);
      setMessage(
        `Vous passez votre tour. Il vous reste ${
          playerSkipTurns - 1
        } tour(s) à passer.`
      );
      setCurrentTurn("computer");
      setCanRoll(true);
      return;
    }

    // Si le joueur est piégé
    if (playerTrapped) {
      setMessage("Vous êtes piégé! Attendez qu'un autre joueur vous sauve.");
      setCurrentTurn("computer");
      setCanRoll(true);
      return;
    }

    const oldPosition = playerPosition;
    let newPosition = playerPosition + spaces;

    // Créer un tableau des positions intermédiaires pour l'animation
    const steps = [];
    for (let i = 1; i <= spaces; i++) {
      steps.push(oldPosition + i);
    }

    // Si le joueur dépasse la dernière case
    if (newPosition > totalCases) {
      newPosition = totalCases - (newPosition - totalCases);
      const reboundPosition = totalCases;

      // Ajouter les étapes jusqu'à la dernière case, puis le rebond
      const stepsToEnd = totalCases - oldPosition;
      const stepsBack = spaces - stepsToEnd;

      const finalSteps = [];
      for (let i = 1; i <= stepsToEnd; i++) {
        finalSteps.push(oldPosition + i);
      }

      for (let i = 1; i <= stepsBack; i++) {
        finalSteps.push(totalCases - i);
      }

      setMoveSteps(finalSteps);
      setMessage(
        `Vous avez dépassé la case ${totalCases}. Reculez à la case ${newPosition}.`
      );
    } else if (newPosition === totalCases) {
      setMoveSteps(steps);
      setMessage(
        "Félicitations ! Vous avez gagné ! Vous récupérez tous les jetons."
      );

      // Le joueur gagne tous les jetons du pool commun
      setPlayerTokens((prev) => prev + commonTokenPool);
      setCommonTokenPool(0);
    } else {
      setMoveSteps(steps);
      setMessage(`Vous avancez de ${spaces} cases.`);
    }

    // Démarrer l'animation
    setAnimatingMove(true);
    setCurrentStep(0);
    setAnimatedPlayer("player");
    setCanRoll(false);
  };

  // Ajouter une entrée au journal d'historique
  const addToHistory = useCallback((from, to, action, playerType) => {
    setHistory((prevHistory) => [
      { from, to, action, playerType, time: new Date().toLocaleTimeString() },
      ...prevHistory,
    ]);
  }, []);

  // Vérifier si la case est spéciale et appliquer l'effet
  const checkSpecialCase = useCallback(
    (newPosition, diceRoll, playerType) => {
      const specialCase = specialCases[newPosition];
      const setPosition =
        playerType === "player" ? setPlayerPosition : setComputerPosition;
      const setTokens =
        playerType === "player" ? setPlayerTokens : setComputerTokens;
      const tokens = playerType === "player" ? playerTokens : computerTokens;
      const setTrapped =
        playerType === "player" ? setPlayerTrapped : setComputerTrapped;
      const setSkipTurns =
        playerType === "player" ? setPlayerSkipTurns : setComputerSkipTurns;

      if (specialCase) {
        setTimeout(() => {
          const playerName = playerType === "player" ? "Vous" : "L'ordinateur";
          const message = specialCase.message.replace("Vous", playerName);
          setMessage(message);

          switch (specialCase.action) {
            case "payToJump":
              // Vérifier si le joueur a assez de jetons
              if (handleTokenPayment(specialCase.tokenCost, playerType)) {
                setPosition(specialCase.value);
                addToHistory(
                  newPosition,
                  specialCase.value,
                  "saut (coût: 1 jeton)",
                  playerType
                );
              } else {
                // Pas assez de jetons, le joueur reste sur place
                setMessage(
                  `${playerName} n'a pas assez de jetons pour avancer.`
                );
              }
              break;
            case "gobackAndPay":
              // Payer pour retourner à une case antérieure
              handleTokenPayment(specialCase.tokenCost, playerType);
              setPosition(specialCase.value);
              addToHistory(
                newPosition,
                specialCase.value,
                "recul (coût: 1 jeton)",
                playerType
              );
              break;
            case "skipAndPay":
              // Payer et sauter des tours
              handleTokenPayment(specialCase.tokenCost, playerType);
              setSkipTurns(specialCase.value);
              addToHistory(
                newPosition,
                newPosition,
                `passe ${specialCase.value} tours (coût: 1 jeton)`,
                playerType
              );
              break;
            case "trapped":
              // Piégé jusqu'à ce qu'un autre joueur arrive
              setTrapped(true);
              setTrapCase(newPosition);
              addToHistory(newPosition, newPosition, "piégé", playerType);
              break;
            case "restart":
              setPosition(0);
              addToHistory(newPosition, 0, "restart", playerType);
              break;
            case "double":
              const doubleMove = newPosition + diceRoll;
              setPosition(doubleMove);
              addToHistory(newPosition, doubleMove, "oie", playerType);
              break;
            default:
              // Aucun effet particulier
              break;
          }

          // On peut à nouveau lancer le dé (sauf si jeu terminé)
          setTimeout(() => {
            if (!gameOver) {
              if (playerType === "player") {
                if (!playerTrapped && playerSkipTurns === 0) {
                  setCurrentTurn("computer");
                } else if (playerSkipTurns > 0) {
                  setPlayerSkipTurns((prev) => prev - 1);
                  setCurrentTurn("computer");
                }
              } else {
                if (!computerTrapped && computerSkipTurns === 0) {
                  setCurrentTurn("player");
                  setCanRoll(true);
                } else if (computerSkipTurns > 0) {
                  setComputerSkipTurns((prev) => prev - 1);
                  setCurrentTurn("player");
                  setCanRoll(true);
                }
              }
            }
          }, 1000);
        }, 1000);
      } else {
        setTimeout(() => {
          if (!gameOver) {
            setCurrentTurn(playerType === "player" ? "computer" : "player");
            if (playerType === "computer") {
              setCanRoll(true);
            }
          }
        }, 1000);
      }
    },
    [
      specialCases,
      setPlayerPosition,
      setComputerPosition,
      addToHistory,
      setMessage,
      setCurrentTurn,
      setCanRoll,
      gameOver,
      playerTokens,
      computerTokens,
    ]
  );

  // Fonction pour déplacer l'ordinateur
  const moveComputer = useCallback(
    (spaces) => {
      // Si l'ordinateur doit sauter des tours
      if (computerSkipTurns > 0) {
        setComputerSkipTurns((prev) => prev - 1);
        setMessage(
          `L'ordinateur passe son tour. Il lui reste ${
            computerSkipTurns - 1
          } tour(s) à passer.`
        );
        setCurrentTurn("player");
        setCanRoll(true);
        return;
      }

      // Si l'ordinateur est piégé
      if (computerTrapped) {
        setMessage("L'ordinateur est piégé et attend d'être sauvé.");
        setCurrentTurn("player");
        setCanRoll(true);
        return;
      }

      // Vérifier si le joueur est piégé et si l'ordinateur peut le sauver
      if (playerTrapped && playerPosition === computerPosition + spaces) {
        setMessage(`L'ordinateur vous a sauvé! Il vous donne 1 jeton.`);
        setPlayerTrapped(false);
        setTrapCase(null);

        // L'ordinateur paie 1 jeton pour sauver le joueur
        if (computerTokens > 0) {
          setComputerTokens((prev) => prev - 1);
          setPlayerTokens((prev) => prev + 1);
          addToHistory(
            computerPosition,
            computerPosition + spaces,
            "sauvetage",
            "computer"
          );
        }

        // L'ordinateur continue sa route, le joueur va où l'ordinateur était
        const oldPosition = computerPosition;
        setComputerPosition(oldPosition + spaces);
        setPlayerPosition(oldPosition);
        return;
      }

      // Générer deux valeurs de dés aléatoires
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      setDiceValues([dice1, dice2]);

      // Calculer la nouvelle position
      const oldPosition = computerPosition;
      let newPosition = computerPosition + spaces;

      // Créer un tableau des positions intermédiaires pour l'animation
      const steps = [];
      for (let i = 1; i <= spaces; i++) {
        steps.push(oldPosition + i);
      }

      // Vérifier si l'ordinateur dépasse la dernière case
      if (newPosition > totalCases) {
        newPosition = totalCases - (newPosition - totalCases);
        const stepsToEnd = totalCases - oldPosition;
        const stepsBack = spaces - stepsToEnd;

        const finalSteps = [];
        for (let i = 1; i <= stepsToEnd; i++) {
          finalSteps.push(oldPosition + i);
        }

        for (let i = 1; i <= stepsBack; i++) {
          finalSteps.push(totalCases - i);
        }

        setMoveSteps(finalSteps);
        setMessage(
          `L'ordinateur a dépassé la case ${totalCases}. Il recule à la case ${newPosition}.`
        );
      } else if (newPosition === totalCases) {
        setMoveSteps(steps);
        setMessage(
          "Dommage ! L'ordinateur a gagné et récupère tous les jetons."
        );

        // L'ordinateur gagne tous les jetons du pool commun
        setComputerTokens((prev) => prev + commonTokenPool);
        setCommonTokenPool(0);
      } else {
        setMoveSteps(steps);
        setMessage(`L'ordinateur avance de ${spaces} cases.`);
      }

      // Démarrer l'animation
      setAnimatingMove(true);
      setCurrentStep(0);
      setAnimatedPlayer("computer");
      setCanRoll(false);
    },
    [
      computerPosition,
      totalCases,
      computerSkipTurns,
      computerTrapped,
      playerTrapped,
      playerPosition,
      addToHistory,
    ]
  );

  // Tour de l'ordinateur
  useEffect(() => {
    if (currentTurn === "computer" && !gameOver) {
      setComputerThinking(true);

      // Délai pour simuler la réflexion de l'ordinateur
      const thinkingTime = 1500 + Math.random() * 1000;

      const computerTurnTimeout = setTimeout(() => {
        setIsRolling(true);

        // Simuler le roulement des dés
        const rollInterval = setInterval(() => {
          setDiceValues([
            Math.floor(Math.random() * 6) + 1,
            Math.floor(Math.random() * 6) + 1,
          ]);
        }, 100);

        setTimeout(() => {
          clearInterval(rollInterval);
          const dice1 = Math.floor(Math.random() * 6) + 1;
          const dice2 = Math.floor(Math.random() * 6) + 1;
          const totalValue = dice1 + dice2;
          setDiceValues([dice1, dice2]);
          setIsRolling(false);
          setComputerThinking(false);

          // Vérifier les règles spéciales de début de partie
          if (firstTurn) {
            // Règles du premier lancer
            if ((dice1 === 3 && dice2 === 6) || (dice1 === 6 && dice2 === 3)) {
              setMessage(
                "L'ordinateur a fait 3 et 6 ! Il avance directement à la case 26."
              );
              setComputerPosition(26);
              addToHistory(0, 26, "règle spéciale", "computer");
              setFirstTurn(false);
              setCurrentTurn("player");
              setCanRoll(true);
              return;
            } else if (
              (dice1 === 4 && dice2 === 5) ||
              (dice1 === 5 && dice2 === 4)
            ) {
              setMessage(
                "L'ordinateur a fait 4 et 5 ! Il avance directement à la case 53."
              );
              setComputerPosition(53);
              addToHistory(0, 53, "règle spéciale", "computer");
              setFirstTurn(false);
              setCurrentTurn("player");
              setCanRoll(true);
              return;
            }
            setFirstTurn(false);
          }

          // Déplacer l'ordinateur après un court délai
          setTimeout(() => {
            moveComputer(totalValue);
          }, 300);
        }, 1000);
      }, thinkingTime);

      return () => {
        clearTimeout(computerTurnTimeout);
      };
    }
  }, [currentTurn, gameOver, moveComputer, addToHistory]);

  // Ajouter un effet pour gérer l'animation
  useEffect(() => {
    if (animatingMove && moveSteps.length > 0) {
      if (currentStep < moveSteps.length) {
        const timer = setTimeout(() => {
          // Mettre à jour la position du joueur animé
          if (animatedPlayer === "player") {
            setPlayerPosition(moveSteps[currentStep]);
          } else {
            setComputerPosition(moveSteps[currentStep]);
          }
          setCurrentStep((prev) => prev + 1);
        }, 300); // Délai de 300ms entre chaque étape

        return () => clearTimeout(timer);
      } else {
        // Animation terminée
        setAnimatingMove(false);

        // Position finale après l'animation
        const finalPosition = moveSteps[moveSteps.length - 1];

        // Vérifier si la position finale est une case spéciale
        if (animatedPlayer === "player") {
          checkSpecialCase(
            finalPosition,
            diceValues[0] + diceValues[1],
            "player"
          );
        } else {
          checkSpecialCase(
            finalPosition,
            diceValues[0] + diceValues[1],
            "computer"
          );
        }

        // Vérifier si c'est une victoire
        if (finalPosition === totalCases) {
          setGameOver(true);
          if (animatedPlayer === "player") {
            setMessage(
              "Félicitations ! Vous avez gagné et récupérez tous les jetons!"
            );
            // Le joueur récupère tous les jetons
            setPlayerTokens((prev) => prev + commonTokenPool);
            setCommonTokenPool(0);
          } else {
            setMessage(
              "Dommage ! L'ordinateur a gagné et récupère tous les jetons."
            );
            // L'ordinateur récupère tous les jetons
            setComputerTokens((prev) => prev + commonTokenPool);
            setCommonTokenPool(0);
          }
        }
      }
    }
  }, [
    animatingMove,
    moveSteps,
    currentStep,
    animatedPlayer,
    checkSpecialCase,
    diceValues,
  ]);

  // Redémarrer le jeu
  const restartGame = () => {
    setPlayerPosition(0);
    setComputerPosition(0);
    setDiceValues([1, 1]);
    setMessage("Lancez le dé pour commencer la partie !");
    setGameOver(false);
    setCanRoll(true);
    setHistory([]);
    setCurrentTurn("player");
    setPlayerTokens(5);
    setComputerTokens(5);
    setCommonTokenPool(0);
    setPlayerTrapped(false);
    setComputerTrapped(false);
    setTrapCase(null);
    setPlayerSkipTurns(0);
    setComputerSkipTurns(0);
    setFirstTurn(true);
  };

  // Fonction pour obtenir l'emoji du pion joueur selon le thème ou la sélection
  const getPlayerToken = () => selectedToken;

  // Fonction pour obtenir l'emoji du pion ordinateur selon le thème
  const getComputerToken = () => {
    switch (selectedToken) {
      default:
        return "🤖";
    }
  };

  // Générer les cases du plateau
  const renderBoard = () => {
    // Création d'un vrai plateau de jeu en forme de spirale
    const cells = [];
    const totalCases = 63;

    // Créer un tableau de positions X, Y pour chaque case en forme de spirale
    const spiral = generateSpiralCoordinates(totalCases + 1);

    for (let i = 0; i <= totalCases; i++) {
      const isSpecial = specialCases[i];
      const hasPlayer = playerPosition === i;
      const hasComputer = computerPosition === i;
      const isFinalCase = i === totalCases; // Case 63
      const { x, y, isCenter } = spiral[i];

      cells.push(
        <div
          key={i}
          className={`game-cell ${
            isSpecial ? `special-case ${specialCases[i].type}` : ""
          } 
                               ${isFinalCase ? "final-case" : ""} ${
            isCenter ? "center-case" : ""
          } ${trapCase === i ? "trap-case" : ""}`}
          style={{
            gridColumn: x + 1,
            gridRow: y + 1,
            gridColumnEnd: isFinalCase ? `span 1` : undefined,
            gridRowEnd: isFinalCase ? `span 1` : undefined,
          }}
          title={
            isSpecial
              ? specialCases[i].message
              : isFinalCase
              ? "Case finale - Victoire !"
              : `Case ${i}`
          }
        >
          <span className="cell-number">{i}</span>
          {isSpecial && (
            <span className="cell-icon">
              {getSpecialIcon(specialCases[i].type)}
            </span>
          )}
          {isFinalCase && <span className="victory-icon"></span>}

          {hasPlayer && (
            <div className="player-token player-human">{getPlayerToken()}</div>
          )}
          {hasComputer && (
            <div className="player-token player-computer">
              {getComputerToken()}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`game-spiral-board game-board ${
          currentTurn === "player" ? "player-turn" : "computer-turn"
        }`}
      >
        {cells}

        {/* Dé D12 sur mobile */}
        <div className="dice-container-mobile">
          <div
            className={`d12-dice ${isRolling ? "rolling" : ""}`}
            onClick={
              canRoll &&
              !gameOver &&
              currentTurn === "player" &&
              !playerTrapped &&
              playerSkipTurns === 0
                ? rollDice
                : undefined
            }
            style={{
              opacity:
                canRoll &&
                !gameOver &&
                currentTurn === "player" &&
                !playerTrapped &&
                playerSkipTurns === 0
                  ? 1
                  : 0.6,
              cursor:
                canRoll &&
                !gameOver &&
                currentTurn === "player" &&
                !playerTrapped &&
                playerSkipTurns === 0
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            {diceValues[0] + diceValues[1]}
          </div>
          <span className="dice-label"></span>
        </div>
      </div>
    );
  };

  // Fonction pour obtenir une icône selon le type de case spéciale
  const getSpecialIcon = (type) => {
    switch (type) {
      case "pont":
        return "🌉";
      case "hotel":
        return "🏨";
      case "puits":
        return "🕳️";
      case "labyrinthe":
        return "🌀";
      case "prison":
        return "🚔";
      case "mort":
        return "💀";
      case "oie":
        return "🦆";
      default:
        return "⭐";
    }
  };

  // Correction de la génération de la spirale pour éviter les bugs et les boucles infinies
  const generateSpiralCoordinates = (totalCells) => {
    const coordinates = [];
    const size = Math.ceil(Math.sqrt(totalCells));
    const adjustedSize = size % 2 === 0 ? size + 1 : size;

    // Initialiser la grille à null
    const grid = Array.from({ length: adjustedSize }, () =>
      Array(adjustedSize).fill(null)
    );

    // Commencer en bas à gauche
    let x = 0;
    let y = adjustedSize - 1;
    let direction = 0; // 0: droite, 1: haut, 2: gauche, 3: bas
    const dx = [1, 0, -1, 0];
    const dy = [0, -1, 0, 1];

    for (let n = 0; n < totalCells; n++) {
      grid[y][x] = n;
      coordinates[n] = { x, y, isCenter: false };

      // Calculer la prochaine position
      let nx = x + dx[direction];
      let ny = y + dy[direction];

      // Si la prochaine case sort de la grille ou est déjà prise, tourner
      if (
        nx < 0 ||
        nx >= adjustedSize ||
        ny < 0 ||
        ny >= adjustedSize ||
        grid[ny][nx] !== null
      ) {
        direction = (direction + 1) % 4;
        nx = x + dx[direction];
        ny = y + dy[direction];
      }

      x = nx;
      y = ny;
    }

    // Placer la case 63 au centre (si totalCells = 64)
    if (totalCells > 1) {
      const center = Math.floor(adjustedSize / 2);
      coordinates[63] = { x: center, y: center, isCenter: true };
    }

    return coordinates;
  };

  return (
    <div
      className={`jeu-de-loie  ${
        animatingMove ? "animating" : ""
      }`}
    >
      <h3 className="game-title">Jeu de l'Oie</h3>
      {/* Sélection du jeton */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ fontWeight: "bold", marginRight: 10 }}>
          Choisissez votre jeton :
        </span>
        {tokenChoices.map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => setSelectedToken(token)}
            style={{
              fontSize: 28,
              margin: "0 8px",
              padding: "6px 12px",
              borderRadius: "50%",
              border:
                selectedToken === token
                  ? "3px solid #2196F3"
                  : "2px solid #ccc",
              background: selectedToken === token ? "#e3f2fd" : "#fff",
              cursor: "pointer",
              transition: "border 0.2s, background 0.2s",
            }}
            aria-label={`Choisir le jeton ${token}`}
          >
            {token}
          </button>
        ))}
      </div>

      {/* Affichage des jetons */}
      <div className="tokens-display">
        <div className="player-tokens-info">
          <span className="player-icon">{getPlayerToken()}</span>
          <span className="token-count">
            Jetons: {playerTokens} {playerTrapped && "🔒"}{" "}
            {playerSkipTurns > 0 && `(passes ${playerSkipTurns} tours)`}
          </span>
        </div>

        <div className="computer-tokens-info">
          <span className="computer-icon">{getComputerToken()}</span>
          <span className="token-count">
            Jetons: {computerTokens} {computerTrapped && "🔒"}{" "}
            {computerSkipTurns > 0 && `(passes ${computerSkipTurns} tours)`}
          </span>
        </div>
      </div>

      <div className="game-container">
        <div className="left-section">
          <div className="board-wrapper">{renderBoard()}</div>

          <div className="game-legend">
            <h3>Légende</h3>
            <div className="legend-items">
              {Object.entries(specialCases)
                .filter(
                  (entry, index, self) =>
                    index === self.findIndex((e) => e[1].type === entry[1].type)
                )
                .map(([caseNum, caseInfo]) => (
                  <div key={caseNum} className="legend-item">
                    <div className="legend-header">
                      <span className="legend-icon">
                        {getSpecialIcon(caseInfo.type)}
                      </span>
                      <span className="legend-type">{caseInfo.type}</span>
                    </div>
                    <span className="legend-desc">{caseInfo.message}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="game-controls">
          <div
            className={`turn-indicator ${
              currentTurn === "player" ? "player-turn" : "computer-turn"
            }`}
          >
            {currentTurn === "player"
              ? "C'est votre tour !"
              : computerThinking
              ? "L'ordinateur réfléchit..."
              : "Tour de l'ordinateur"}
          </div>

          <div className="dice-container">
            <div className="dice-wrapper">
              <div className="visual-dice">
                <div
                  className={`dice-face dice-${diceValues[0]} ${
                    isRolling ? "rolling" : ""
                  }`}
                >
                  <span>{diceValues[0]}</span>
                  <div className="dice-dots">
                    {diceValues[0] === 1 && (
                      <div className="dice-dot center"></div>
                    )}
                    {diceValues[0] === 2 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                    {diceValues[0] === 3 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot center"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                    {diceValues[0] === 4 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot top-right"></div>
                        <div className="dice-dot bottom-left"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                    {diceValues[0] === 5 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot top-right"></div>
                        <div className="dice-dot center"></div>
                        <div className="dice-dot bottom-left"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                    {diceValues[0] === 6 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot top-right"></div>
                        <div className="dice-dot middle-left"></div>
                        <div className="dice-dot middle-right"></div>
                        <div className="dice-dot bottom-left"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="visual-dice">
                <div
                  className={`dice-face dice-${diceValues[1]} ${
                    isRolling ? "rolling" : ""
                  }`}
                >
                  <span>{diceValues[1]}</span>
                  <div className="dice-dots">
                    {diceValues[1] === 1 && (
                      <div className="dice-dot center"></div>
                    )}
                    {diceValues[1] === 2 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                    {diceValues[1] === 3 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot center"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                    {diceValues[1] === 4 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot top-right"></div>
                        <div className="dice-dot bottom-left"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                    {diceValues[1] === 5 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot top-right"></div>
                        <div className="dice-dot center"></div>
                        <div className="dice-dot bottom-left"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                    {diceValues[1] === 6 && (
                      <>
                        <div className="dice-dot top-left"></div>
                        <div className="dice-dot top-right"></div>
                        <div className="dice-dot middle-left"></div>
                        <div className="dice-dot middle-right"></div>
                        <div className="dice-dot bottom-left"></div>
                        <div className="dice-dot bottom-right"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="dice-total">
              <span>Total: {diceValues[0] + diceValues[1]}</span>
              {diceValues[0] === 3 && diceValues[1] === 6 && firstTurn && (
                <div className="special-rule-message">
                  3 et 6! Avancez directement à la case 26!
                </div>
              )}
              {diceValues[0] === 4 && diceValues[1] === 5 && firstTurn && (
                <div className="special-rule-message">
                  4 et 5! Avancez directement à la case 53!
                </div>
              )}
            </div>

            <button
              className="roll-button"
              onClick={rollDice}
              disabled={
                !canRoll ||
                gameOver ||
                currentTurn !== "player" ||
                playerTrapped ||
                playerSkipTurns > 0
              }
            >
              {isRolling
                ? "Lancement..."
                : currentTurn === "player"
                ? playerTrapped
                  ? "Vous êtes piégé"
                  : playerSkipTurns > 0
                  ? `Passez ${playerSkipTurns} tour(s)`
                  : "Lancer les dés"
                : "Attendez votre tour"}
            </button>
            <button
              className="restart-button"
              style={{ marginTop: 10 }}
              onClick={restartGame}
            >
              Recommencer
            </button>
          </div>

          <div className="game-info">
            <div className="message-box">{message}</div>
            <div className="player-positions">
              <div className="player-position">
                <span className="player-icon">{getPlayerToken()}</span> Vous:{" "}
                <strong>{playerPosition}</strong> / {totalCases}
              </div>
              <div className="computer-position">
                <span className="player-icon">{getComputerToken()}</span>{" "}
                Ordinateur: <strong>{computerPosition}</strong> / {totalCases}
              </div>
            </div>

            {gameOver && (
              <button className="restart-button" onClick={restartGame}>
                Nouvelle partie
              </button>
            )}
          </div>

          <div className="game-history">
            <h3>Journal de partie</h3>
            <div className="history-list">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className={`history-item ${entry.playerType}-move`}
                >
                  <span className="history-time">{entry.time}</span>
                  <span className="history-action">
                    {entry.playerType === "player"
                      ? getPlayerToken()
                      : getComputerToken()}
                    {typeof entry.action === "number"
                      ? `Dé: ${entry.action}, ${entry.from} → ${entry.to}`
                      : `${entry.from} → ${entry.to} (${entry.action})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JeuDeLOie;
