import React, { useState, useEffect, useRef, useCallback } from "react";
import { Container } from "react-bootstrap";
import "./yams.scss";

const MAX_ROLLS = 3;
const NUM_DICE = 5;

// Styles de dés disponibles
const DICE_STYLES = {
  classic: {
    name: "Classique",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style numérique classique",
  },
  dots: {
    name: "Égypte Antique",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Chiffres dorés style papyrus",
  },
  emoji: {
    name: "Moyen Âge",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style médiéval épique",
  },
  roman: {
    name: "Romain",
    values: ["I", "II", "III", "IV", "V", "VI"],
    description: "Chiffres romains élégants",
  },
  letters: {
    name: "Cyber",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style futuriste néon",
  },
  symbols: {
    name: "Espace",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style spatial futuriste",
  },
  princess: {
    name: "Princesse",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style rose et paillettes",
  },
  unicorn: {
    name: "Licorne",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style arc-en-ciel magique",
  },
  candy: {
    name: "Bonbons",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style sucré coloré",
  },
  flower: {
    name: "Fleurs",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style floral délicat",
  },
  ocean: {
    name: "Océan",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style bleu profond",
  },
  forest: {
    name: "Forêt",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style vert nature",
  },
  fire: {
    name: "Feu",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style flammes ardentes",
  },
  ice: {
    name: "Glace",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style cristal glacé",
  },
  gold: {
    name: "Or",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style luxe doré",
  },
  silver: {
    name: "Argent",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style métallique argenté",
  },
  neon: {
    name: "Néon",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style électrique fluo",
  },
  retro: {
    name: "Rétro",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style vintage années 80",
  },
  ninja: {
    name: "Ninja",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style furtif sombre",
  },
  pirate: {
    name: "Pirate",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style aventurier des mers",
  },
  magic: {
    name: "Magie",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style mystique violet",
  },
  steampunk: {
    name: "Steampunk",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style rétro-futuriste",
  },
  aurora: {
    name: "Aurore",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style aurore boréale",
  },
  sunset: {
    name: "Coucher",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style coucher de soleil",
  },
  galaxy: {
    name: "Galaxie",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style cosmique étoilé",
  },
  diamond: {
    name: "Diamant",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style cristal brillant",
  },
  volcano: {
    name: "Volcan",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style lave et magma",
  },
  thunder: {
    name: "Foudre",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style orage électrique",
  },
  rainbow: {
    name: "Arc-en-ciel",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style multicolore éclatant",
  },
  desert: {
    name: "Désert",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style sable et oasis",
  },
  jungle: {
    name: "Jungle",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style tropical luxuriant",
  },
  arctic: {
    name: "Arctique",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style banquise polaire",
  },
  vampire: {
    name: "Vampire",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style gothique sombre",
  },
  angel: {
    name: "Ange",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style céleste lumineux",
  },
  dragon: {
    name: "Dragon",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style légendaire épique",
  },
  robot: {
    name: "Robot",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style mécanique futuriste",
  },
  crystal: {
    name: "Cristal",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style gemme transparente",
  },
  poison: {
    name: "Poison",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style toxique vert",
  },
  plasma: {
    name: "Plasma",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style énergie pure",
  },
  marble: {
    name: "Marbre",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style pierre noble",
  },
  hologram: {
    name: "Hologramme",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style projection 3D",
  },
  shadow: {
    name: "Ombre",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style mystérieux furtif",
  },
  cosmic: {
    name: "Cosmique",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style univers infini",
  },
  lava: {
    name: "Lave",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style fusion ardente",
  },
  matrix: {
    name: "Matrix",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style code digital",
  },
  ancient: {
    name: "Antique",
    values: ["1", "2", "3", "4", "5", "6"],
    description: "Style civilisation perdue",
  },
};

// Types de mode de jeu
const GAME_MODES = {
  SINGLE_PLAYER: "single_player",
  PLAYER_VS_PLAYER: "player_vs_player",
  PLAYER_VS_IA: "player_vs_ia",
};

// Catégories de scores
const CATEGORIES = {
  // Partie supérieure
  ones: {
    label: "As (1)",
    section: "upper",
    description: "Somme de tous les 1",
  },
  twos: {
    label: "Deux (2)",
    section: "upper",
    description: "Somme de tous les 2",
  },
  threes: {
    label: "Trois (3)",
    section: "upper",
    description: "Somme de tous les 3",
  },
  fours: {
    label: "Quatre (4)",
    section: "upper",
    description: "Somme de tous les 4",
  },
  fives: {
    label: "Cinq (5)",
    section: "upper",
    description: "Somme de tous les 5",
  },
  sixes: {
    label: "Six (6)",
    section: "upper",
    description: "Somme de tous les 6",
  },

  // Partie inférieure
  threeOfAKind: {
    label: "Brelan",
    section: "lower",
    description: "Au moins 3 dés identiques",
  },
  fourOfAKind: {
    label: "Carré",
    section: "lower",
    description: "Au moins 4 dés identiques",
  },
  fullHouse: {
    label: "Full",
    section: "lower",
    description: "Un brelan et une paire",
  },
  smallStraight: {
    label: "Petite suite",
    section: "lower",
    description: "4 dés qui se suivent",
  },
  largeStraight: {
    label: "Grande suite",
    section: "lower",
    description: "5 dés qui se suivent",
  },
  yahtzee: { label: "Yams", section: "lower", description: "5 dés identiques" },
  chance: {
    label: "Chance",
    section: "lower",
    description: "Somme de tous les dés",
  },
};

const YamsGame = () => {
  // État du mode de jeu
  const [gameMode, setGameMode] = useState(GAME_MODES.SINGLE_PLAYER);
  // Références pour les dés
  const diceRefs = useRef(Array(NUM_DICE).fill(null));

  // État des dés
  const [dice, setDice] = useState(() => {
    const savedGame = localStorage.getItem("yams-current-game");
    return savedGame
      ? JSON.parse(savedGame).dice || Array(NUM_DICE).fill(1)
      : Array(NUM_DICE).fill(1);
  });
  const [heldDice, setHeldDice] = useState(() => {
    const savedGame = localStorage.getItem("yams-current-game");
    return savedGame
      ? JSON.parse(savedGame).heldDice || Array(NUM_DICE).fill(false)
      : Array(NUM_DICE).fill(false);
  });
  const [rolling, setRolling] = useState(false);

  // État du jeu
  const [rollsLeft, setRollsLeft] = useState(() => {
    const savedGame = localStorage.getItem("yams-current-game");
    return savedGame ? JSON.parse(savedGame).rollsLeft || MAX_ROLLS : MAX_ROLLS;
  });
  const [currentPlayer, setCurrentPlayer] = useState(() => {
    const savedGame = localStorage.getItem("yams-current-game");
    return savedGame ? JSON.parse(savedGame).currentPlayer || 1 : 1;
  });
  const [scores, setScores] = useState(() => {
    // Charger les scores sauvegardés ou initialiser
    const savedGame = localStorage.getItem("yams-current-game");
    if (savedGame) {
      const parsed = JSON.parse(savedGame);
      return (
        parsed.scores || {
          player1: Object.keys(CATEGORIES).reduce((acc, cat) => {
            acc[cat] = null;
            return acc;
          }, {}),
          player2: Object.keys(CATEGORIES).reduce((acc, cat) => {
            acc[cat] = null;
            return acc;
          }, {}),
        }
      );
    }
    return {
      player1: Object.keys(CATEGORIES).reduce((acc, cat) => {
        acc[cat] = null;
        return acc;
      }, {}),
      player2: Object.keys(CATEGORIES).reduce((acc, cat) => {
        acc[cat] = null;
        return acc;
      }, {}),
    };
  });
  const [potentialScores, setPotentialScores] = useState({});
  const [gameOver, setGameOver] = useState(() => {
    // Charger l'état du jeu sauvegardé
    const savedGame = localStorage.getItem("yams-current-game");
    return savedGame ? JSON.parse(savedGame).gameOver || false : false;
  });

  // État pour la modale des scores
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [gameHistory, setGameHistory] = useState(() => {
    const saved = localStorage.getItem("yams-game-history");
    return saved ? JSON.parse(saved) : [];
  });

  // État pour la modale de style des dés
  const [showDiceStyleModal, setShowDiceStyleModal] = useState(false);
  const [currentDiceStyle, setCurrentDiceStyle] = useState(() => {
    const saved = localStorage.getItem("yams-dice-style");
    return saved || "classic";
  });

  // Calcul du meilleur score
  const getBestScore = () => {
    if (gameHistory.length === 0) return null;

    let bestScore = 0;
    let bestGame = null;

    gameHistory.forEach((game) => {
      const player1Score = game.players.player1.score;
      const player2Score = game.players.player2?.score || 0;

      if (player1Score > bestScore) {
        bestScore = player1Score;
        bestGame = { ...game, bestPlayer: "player1" };
      }

      if (player2Score > bestScore) {
        bestScore = player2Score;
        bestGame = { ...game, bestPlayer: "player2" };
      }
    });

    return bestGame;
  };

  // Fonction pour changer le style des dés
  const changeDiceStyle = (styleKey) => {
    setCurrentDiceStyle(styleKey);
    localStorage.setItem("yams-dice-style", styleKey);
    setShowDiceStyleModal(false);
  };

  // Fonction pour obtenir la valeur d'affichage d'un dé
  const getDiceDisplayValue = (value) => {
    const style = DICE_STYLES[currentDiceStyle];
    return style ? style.values[value - 1] : value.toString();
  };

  // Calcule le score total
  const calculateTotalScore = useCallback(
    (playerKey = "player1") => {
      let upperTotal = 0;
      let lowerTotal = 0;

      Object.entries(scores[playerKey]).forEach(([category, score]) => {
        if (score === null) return;

        if (CATEGORIES[category].section === "upper") {
          upperTotal += score;
        } else {
          lowerTotal += score;
        }
      });

      // Bonus pour la section supérieure si elle atteint 63 ou plus
      const bonus = upperTotal >= 63 ? 35 : 0;

      return {
        upperTotal,
        bonus,
        lowerTotal,
        grandTotal: upperTotal + bonus + lowerTotal,
      };
    },
    [scores]
  );

  // Fonction pour sauvegarder une partie terminée
  const saveGameToHistory = useCallback(() => {
    const totalScoresP1 = calculateTotalScore("player1");
    const totalScoresP2 = calculateTotalScore("player2");

    const gameResult = {
      id: Date.now(),
      date: new Date().toLocaleDateString("fr-FR"),
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      mode: gameMode,
      players: {
        player1: {
          name: "Joueur 1",
          score: totalScoresP1.grandTotal,
          upperTotal: totalScoresP1.upperTotal,
          bonus: totalScoresP1.bonus,
          lowerTotal: totalScoresP1.lowerTotal,
        },
        ...(gameMode !== GAME_MODES.SINGLE_PLAYER && {
          player2: {
            name: gameMode === GAME_MODES.PLAYER_VS_IA ? "IA" : "Joueur 2",
            score: totalScoresP2.grandTotal,
            upperTotal: totalScoresP2.upperTotal,
            bonus: totalScoresP2.bonus,
            lowerTotal: totalScoresP2.lowerTotal,
          },
        }),
      },
      winner:
        gameMode === GAME_MODES.SINGLE_PLAYER
          ? "player1"
          : totalScoresP1.grandTotal > totalScoresP2.grandTotal
          ? "player1"
          : totalScoresP1.grandTotal < totalScoresP2.grandTotal
          ? "player2"
          : "tie",
    };

    setGameHistory((prev) => {
      const newHistory = [gameResult, ...prev].slice(0, 50); // Garder les 50 dernières parties
      localStorage.setItem("yams-game-history", JSON.stringify(newHistory));
      return newHistory;
    });
  }, [gameMode, calculateTotalScore]);

  // Calcule si toutes les catégories sont remplies
  useEffect(() => {
    const player1Complete = Object.values(scores.player1).every(
      (score) => score !== null
    );

    // En mode solo, on vérifie seulement le joueur 1
    if (gameMode === GAME_MODES.SINGLE_PLAYER && player1Complete) {
      saveGameToHistory();
      setGameOver(true);
      return;
    }

    // En mode multi ou vs IA, on vérifie les deux joueurs
    if (gameMode !== GAME_MODES.SINGLE_PLAYER) {
      const player2Complete = Object.values(scores.player2).every(
        (score) => score !== null
      );

      if (player1Complete && player2Complete) {
        saveGameToHistory();
        setGameOver(true);
      }
    }
  }, [scores, gameMode, saveGameToHistory]);

  // Sauvegarde automatique de l'état du jeu
  useEffect(() => {
    const gameState = {
      dice,
      heldDice,
      rollsLeft,
      currentPlayer,
      scores,
      gameOver,
      gameMode,
      timestamp: Date.now(),
    };

    localStorage.setItem("yams-current-game", JSON.stringify(gameState));
    console.log("Jeu sauvegardé automatiquement");
  }, [dice, heldDice, rollsLeft, currentPlayer, scores, gameOver, gameMode]);

  // Déclencher le tour de l'IA lorsque c'est son tour
  useEffect(() => {
    // Si c'est le tour de l'IA et que nous sommes en mode joueur vs IA
    if (
      currentPlayer === 2 &&
      gameMode === GAME_MODES.PLAYER_VS_IA &&
      !gameOver &&
      rollsLeft === MAX_ROLLS // S'assurer que c'est un nouveau tour
    ) {
      console.log("Effect détecté: C'est le tour de l'IA!");
      // On attend un peu pour que l'interface se mette à jour
      const timer = setTimeout(() => {
        console.log("Déclenchement du tour de l'IA depuis l'effet useEffect");
        playIATurn();
      }, 500);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, gameMode, gameOver, rollsLeft]);

  // Calcule les scores potentiels chaque fois que les dés changent
  useEffect(() => {
    if (rollsLeft < MAX_ROLLS) {
      const newPotentialScores = calculatePotentialScores(dice);
      setPotentialScores(newPotentialScores);
    }
  }, [dice, rollsLeft]);

  // Fonction pour lancer les dés
  const rollDice = () => {
    if (rollsLeft === 0) return;

    setRolling(true);

    // Animation de roulement avec changement rapide des valeurs
    const diceElements = diceRefs.current;
    let interval;

    interval = setInterval(() => {
      diceElements.forEach((die, index) => {
        if (die && !heldDice[index]) {
          const randomValue = Math.floor(Math.random() * 6) + 1;
          die.textContent = randomValue;
          die.setAttribute("data-value", randomValue);
        }
      });
    }, 100);

    // Arrêter l'animation et définir les valeurs finales
    setTimeout(() => {
      clearInterval(interval);

      const newDice = dice.map((die, index) =>
        heldDice[index] ? die : Math.floor(Math.random() * 6) + 1
      );

      setDice(newDice);

      // Mettre à jour l'affichage avec les valeurs finales
      diceElements.forEach((die, index) => {
        if (die) {
          die.textContent = newDice[index];
          die.setAttribute("data-value", newDice[index]);
        }
      });

      setRollsLeft((prev) => prev - 1);
      setRolling(false);
    }, 800);
  };

  // Fonction pour maintenir/relâcher un dé
  const toggleHold = (index) => {
    if (rollsLeft === MAX_ROLLS || rolling) return;

    setHeldDice((prev) => {
      const newHeldDice = [...prev];
      newHeldDice[index] = !newHeldDice[index];
      return newHeldDice;
    });
  };

  // Fonction pour sélectionner une catégorie de score
  const selectCategory = (category) => {
    const currentPlayerKey = currentPlayer === 1 ? "player1" : "player2";
    console.log(
      `selectCategory appelé par joueur ${currentPlayer} pour la catégorie ${category}`
    );

    if (
      scores[currentPlayerKey][category] !== null ||
      rollsLeft === MAX_ROLLS ||
      rolling
    ) {
      console.log(
        "Sélection de catégorie impossible:",
        scores[currentPlayerKey][category] !== null
          ? "déjà utilisée"
          : rollsLeft === MAX_ROLLS
          ? "aucun lancer effectué"
          : "dés en train de rouler"
      );
      return;
    }

    // Met à jour le score
    setScores((prev) => ({
      ...prev,
      [currentPlayerKey]: {
        ...prev[currentPlayerKey],
        [category]: potentialScores[category],
      },
    }));

    // Réinitialiser pour le prochain tour
    setDice(Array(NUM_DICE).fill(1));
    setHeldDice(Array(NUM_DICE).fill(false));
    setRollsLeft(MAX_ROLLS);
    setPotentialScores({});

    // Passer au joueur suivant si en mode multijoueur
    if (gameMode === GAME_MODES.PLAYER_VS_PLAYER) {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    } else if (gameMode === GAME_MODES.PLAYER_VS_IA && currentPlayer === 1) {
      // Le joueur 1 vient de terminer son tour, le score a été mis à jour
      // On passe au tour de l'IA
      console.log("Tour du joueur 1 terminé, passage au joueur 2 (IA)");
      setCurrentPlayer(2);

      // On laisse un délai pour que le joueur voie le score mis à jour
      setTimeout(() => {
        console.log("Déclenchement du tour de l'IA après délai");
        playIATurn();
      }, 1000);
    } else {
      // En mode solo ou après le tour de l'IA, on reste sur joueur 1
      console.log("Retour au joueur 1");
      setCurrentPlayer(1);
    }
  };

  // Redémarrer le jeu
  const restartGame = () => {
    setDice(Array(NUM_DICE).fill(1));
    setHeldDice(Array(NUM_DICE).fill(false));
    setRollsLeft(MAX_ROLLS);
    setScores({
      player1: Object.keys(CATEGORIES).reduce((acc, cat) => {
        acc[cat] = null;
        return acc;
      }, {}),
      player2: Object.keys(CATEGORIES).reduce((acc, cat) => {
        acc[cat] = null;
        return acc;
      }, {}),
    });
    setPotentialScores({});
    setGameOver(false);
    setCurrentPlayer(1);

    // Effacer la sauvegarde automatique
    localStorage.removeItem("yams-current-game");
    console.log("Partie redémarrée et sauvegarde effacée");
  };

  // Charger une partie sauvegardée
  const loadSavedGame = () => {
    const savedGame = localStorage.getItem("yams-current-game");
    if (savedGame) {
      const gameState = JSON.parse(savedGame);

      setDice(gameState.dice || Array(NUM_DICE).fill(1));
      setHeldDice(gameState.heldDice || Array(NUM_DICE).fill(false));
      setRollsLeft(gameState.rollsLeft || MAX_ROLLS);
      setCurrentPlayer(gameState.currentPlayer || 1);
      setScores(
        gameState.scores || {
          player1: Object.keys(CATEGORIES).reduce((acc, cat) => {
            acc[cat] = null;
            return acc;
          }, {}),
          player2: Object.keys(CATEGORIES).reduce((acc, cat) => {
            acc[cat] = null;
            return acc;
          }, {}),
        }
      );
      setGameOver(gameState.gameOver || false);

      console.log("Partie sauvegardée chargée");
      return true;
    }
    return false;
  };

  // Vérifier s'il y a une partie sauvegardée
  const hasSavedGame = () => {
    const savedGame = localStorage.getItem("yams-current-game");
    return savedGame !== null;
  };

  // ===== NOUVELLES FONCTIONS IA SIMPLIFIÉES =====

  // Fonction pour choisir les dés à garder (logique simple)
  const chooseDiceToHold = () => {
    const counts = {};
    dice.forEach((die) => {
      counts[die] = (counts[die] || 0) + 1;
    });
    const mostCommonValue = Object.entries(counts).sort(
      (a, b) => b[1] - a[1]
    )[0][0];
    return dice
      .map((die, index) => (die === parseInt(mostCommonValue) ? index : null))
      .filter((i) => i !== null);
  };

  // Fonction pour choisir la meilleure combinaison
  const chooseBestCombination = (currentDice) => {
    const availableScores = calculatePotentialScores(currentDice);

    // Trouver la catégorie disponible avec le meilleur score
    let bestCategory = null;
    let bestScore = -1;

    Object.keys(CATEGORIES).forEach((category) => {
      if (scores.player2[category] === null) {
        const potentialScore = availableScores[category] || 0;
        if (potentialScore > bestScore) {
          bestScore = potentialScore;
          bestCategory = category;
        }
      }
    });

    return (
      bestCategory ||
      Object.keys(CATEGORIES).find((cat) => scores.player2[cat] === null)
    );
  };

  // Fonction principale pour le tour de l'IA (version simplifiée)
  const playIATurn = () => {
    if (currentPlayer !== 2) {
      console.log("Ce n'est pas le tour de l'IA");
      return;
    }

    console.log("===== DÉBUT DU TOUR DE L'IA =====");

    // NE PAS réinitialiser les dés ici - garder les dés actuels
    setHeldDice(Array(NUM_DICE).fill(false));
    setRollsLeft(MAX_ROLLS);
    setPotentialScores({});

    let currentRollsLeft = MAX_ROLLS;
    let currentDice = [...dice]; // Utiliser les dés actuels
    let heldDiceIndices = [];

    const aiRoll = () => {
      console.log(`IA Lance ${MAX_ROLLS - currentRollsLeft + 1}/${MAX_ROLLS}`);
      console.log("Dés avant lancer:", currentDice);
      console.log("Dés tenus aux positions:", heldDiceIndices);

      // Lancer les dés (sauf ceux tenus)
      const newDice = currentDice.map((die, index) =>
        heldDiceIndices.includes(index) ? die : Math.ceil(Math.random() * 6)
      );

      console.log("Dés après lancer:", newDice);

      // Mettre à jour les dés locaux ET l'état
      currentDice = newDice;
      setDice(newDice);

      currentRollsLeft--;
      setRollsLeft(currentRollsLeft);

      // Choisir les dés à garder pour le prochain lancer
      if (currentRollsLeft > 0) {
        setTimeout(() => {
          // Utiliser currentDice (les nouveaux dés) pour la décision
          const counts = {};
          currentDice.forEach((die) => {
            counts[die] = (counts[die] || 0) + 1;
          });

          const mostCommonValue = Object.entries(counts).sort(
            (a, b) => b[1] - a[1]
          )[0][0];
          heldDiceIndices = currentDice
            .map((die, index) =>
              die === parseInt(mostCommonValue) ? index : null
            )
            .filter((i) => i !== null);

          console.log("IA garde les dés aux positions:", heldDiceIndices);

          // Mettre à jour l'état des dés tenus pour l'affichage
          const newHeldDice = Array(NUM_DICE).fill(false);
          heldDiceIndices.forEach((index) => {
            newHeldDice[index] = true;
          });
          setHeldDice(newHeldDice);

          // Continuer au lancer suivant
          setTimeout(aiRoll, 1000);
        }, 1000);
      } else {
        // Plus de lancers, choisir la meilleure combinaison
        setTimeout(() => {
          // Utiliser currentDice pour calculer le score final
          const availableScores = calculatePotentialScores(currentDice);

          let bestCategory = null;
          let bestScore = -1;

          Object.keys(CATEGORIES).forEach((category) => {
            if (scores.player2[category] === null) {
              const potentialScore = availableScores[category] || 0;
              if (potentialScore > bestScore) {
                bestScore = potentialScore;
                bestCategory = category;
              }
            }
          });

          const finalCategory =
            bestCategory ||
            Object.keys(CATEGORIES).find((cat) => scores.player2[cat] === null);
          const finalScore = availableScores[finalCategory] || 0;

          console.log(`IA choisit ${finalCategory} pour ${finalScore} points`);

          // Appliquer le score
          setScores((prev) => ({
            ...prev,
            player2: {
              ...prev.player2,
              [finalCategory]: finalScore,
            },
          }));

          // Passer au joueur suivant SANS réinitialiser les dés
          setRollsLeft(MAX_ROLLS);
          setPotentialScores({});
          setCurrentPlayer(1);
          setHeldDice(Array(NUM_DICE).fill(false)); // Réinitialiser seulement les sélections
        }, 1000);
      }
    };

    // Démarrer le premier lancer avec un délai
    setTimeout(aiRoll, 800);
  };

  // ===== FIN DES FONCTIONS IA =====

  // Fonction pour l'IA pour décider quels dés maintenir AVANT le lancer
  const iaDecideHoldDice = (currentDice, remainingRolls) => {
    console.log("L'IA décide quels dés conserver avant de lancer...");
    console.log(`Lancers restants après ce tour: ${remainingRolls}`);
    console.log("Dés actuels:", currentDice);

    // Logique simple : garder les dés de la valeur la plus fréquente
    const chooseDiceToHold = () => {
      const counts = {};
      currentDice.forEach((die) => {
        counts[die] = (counts[die] || 0) + 1;
      });

      console.log("Comptage des valeurs:", counts);

      // Trouver la valeur la plus fréquente
      const mostCommonValue = Object.entries(counts).sort(
        (a, b) => b[1] - a[1]
      )[0][0];
      console.log("Valeur la plus fréquente:", mostCommonValue);

      // Retourner un tableau boolean indiquant quels dés garder
      return currentDice.map((die) => die === parseInt(mostCommonValue));
    };

    // Appliquer la logique de sélection
    const diceToHold = chooseDiceToHold();
    console.log("Dés à garder:", diceToHold);

    setHeldDice(diceToHold);
  };

  // Fonction pour l'IA pour sélectionner une catégorie
  const iaSelectCategory = () => {
    console.log("L'IA analyse ses options et choisit une catégorie...");

    // Calcule les scores potentiels
    const availableScores = calculatePotentialScores(dice);
    console.log("Scores potentiels pour l'IA:", availableScores);

    // Stratégie simple mais efficace: choisir la catégorie qui rapporte le plus de points
    let bestCategory = null;
    let bestScore = -1;

    // Parcourir toutes les catégories disponibles
    Object.keys(CATEGORIES).forEach((category) => {
      // Vérifier si la catégorie est disponible (pas encore remplie)
      if (scores.player2[category] === null) {
        const potentialScore = availableScores[category] || 0;

        // Si ce score est meilleur que le précédent, le garder
        if (potentialScore > bestScore) {
          bestScore = potentialScore;
          bestCategory = category;
        }
      }
    });

    // Si une catégorie a été trouvée, la sélectionner
    if (bestCategory) {
      console.log(
        `L'IA choisit la catégorie ${bestCategory} pour ${bestScore} points`
      );
      selectCategoryForIA(bestCategory, bestScore);
    } else {
      // Cas d'urgence: si aucune catégorie trouvée, prendre la première disponible
      const firstAvailable = Object.keys(CATEGORIES).find(
        (category) => scores.player2[category] === null
      );
      if (firstAvailable) {
        console.log(
          `L'IA choisit la catégorie ${firstAvailable} par défaut (0 points)`
        );
        selectCategoryForIA(firstAvailable, 0);
      } else {
        console.error("ERREUR: Aucune catégorie disponible pour l'IA!");
      }
    }
  };

  // Fonction pour l'IA pour sélectionner une catégorie
  // Fonction utilitaire pour l'IA pour sélectionner une catégorie
  const selectCategoryForIA = (category, score) => {
    console.log(
      `L'IA a choisi la catégorie ${CATEGORIES[category].label} pour ${score} points.`
    );

    // Vérifier si la catégorie est déjà remplie
    if (scores.player2[category] !== null) {
      console.error(
        "Erreur: La catégorie",
        category,
        "est déjà remplie avec",
        scores.player2[category]
      );

      // Trouver une autre catégorie disponible
      const availableCategory = Object.keys(CATEGORIES).find(
        (cat) => scores.player2[cat] === null
      );

      if (availableCategory) {
        console.log(
          "Sélection d'une autre catégorie disponible:",
          availableCategory
        );
        category = availableCategory;
        score = calculatePotentialScores(dice)[category] || 0;
      } else {
        console.log("Aucune catégorie disponible!");
        return;
      }
    }

    console.log(
      `===== FIN DU TOUR DE L'IA: ${CATEGORIES[category].label} (${score} pts) =====`
    );

    setScores((prev) => ({
      ...prev,
      player2: {
        ...prev.player2,
        [category]: score,
      },
    }));

    // Réinitialiser pour le tour du joueur SANS affecter les dés sélectionnés immédiatement
    setRollsLeft(MAX_ROLLS);
    setPotentialScores({});
    setCurrentPlayer(1);

    // Réinitialiser les dés et les sélections avec un petit délai
    setTimeout(() => {
      setDice(Array(NUM_DICE).fill(1));
      setHeldDice(Array(NUM_DICE).fill(false));
    }, 100);
  };

  const totalScoresP1 = calculateTotalScore("player1");
  const totalScoresP2 = calculateTotalScore("player2");
  const bestGame = getBestScore();

  return (
    <Container
      className={`yams-game ${
        gameMode === GAME_MODES.SINGLE_PLAYER
          ? "single-player-mode"
          : gameMode === GAME_MODES.PLAYER_VS_IA
          ? "player-vs-ia-mode"
          : gameMode === GAME_MODES.PLAYER_VS_PLAYER
          ? "player-vs-player-mode"
          : ""
      }`}
    >
      <div className="game-header">
        <h2>Yams</h2>
        <p className="game-description">
          Lancez les dés et faites les meilleures combinaisons possibles pour
          marquer un maximum de points !
        </p>
        <div className="game-mode-selection">
          <button
            className={`yams-button ${
              gameMode === GAME_MODES.SINGLE_PLAYER ? "active" : ""
            }`}
            onClick={() => setGameMode(GAME_MODES.SINGLE_PLAYER)}
          >
            1J
          </button>
          <button
            className={`yams-button ${
              gameMode === GAME_MODES.PLAYER_VS_PLAYER ? "active" : ""
            }`}
            onClick={() => setGameMode(GAME_MODES.PLAYER_VS_PLAYER)}
          >
            1J vs 2J
          </button>
          <button
            className={`yams-button ${
              gameMode === GAME_MODES.PLAYER_VS_IA ? "active" : ""
            }`}
            onClick={() => setGameMode(GAME_MODES.PLAYER_VS_IA)}
          >
            1J vs IA
          </button>
          <button
            className="yams-button"
            onClick={() => setShowDiceStyleModal(true)}
          >
            Style Dés
          </button>
          <button
            className="yams-button"
            onClick={() => setShowScoresModal(true)}
          >
            Historique{" "}
            {getBestScore() &&
              ` (Record: ${
                getBestScore()?.bestPlayer === "player1"
                  ? getBestScore()?.players?.player1?.score
                  : getBestScore()?.players?.player2?.score
              })`}
          </button>
        </div>
      </div>

      <div className="game-layout">
        {/* Deux sections principales côte à côte (comme dans l'image) */}
        <div className="main-sections">
          <div className="section section-blue">
            {/* Contenu de la section de gauche (bleue dans l'image) */}

            <div className="combinations">
              {/* En-tête des colonnes de scores */}
              {gameMode !== GAME_MODES.SINGLE_PLAYER && (
                <div className="scores-header">
                  <div className="category-header">Catégorie</div>
                  <div className="players-header">
                    <div className="player-header">1J</div>
                    <div className="player-header">
                      {gameMode === GAME_MODES.PLAYER_VS_IA ? "IA" : "2J"}
                    </div>
                  </div>
                </div>
              )}
              {/* Section supérieure */}
              <div className="section-group">
                {Object.entries(CATEGORIES)
                  .filter(([_, { section }]) => section === "upper")
                  .map(([category, { label }]) => (
                    <div
                      key={category}
                      className={`scores-rows ${
                        scores.player1[category] !== null ||
                        scores.player2[category] !== null
                          ? "used"
                          : ""
                      } ${
                        potentialScores[category] !== undefined &&
                        scores[currentPlayer === 1 ? "player1" : "player2"][
                          category
                        ] === null
                          ? "potential"
                          : ""
                      }`}
                      onClick={() => selectCategory(category)}
                    >
                      <div className="category">{label}</div>
                      <div className="scores-container">
                        <div
                          className={`player-score ${
                            currentPlayer === 1 ? "current" : ""
                          }`}
                        >
                          {scores.player1[category] !== null
                            ? scores.player1[category]
                            : currentPlayer === 1 &&
                              potentialScores[category] !== undefined
                            ? potentialScores[category]
                            : "-"}
                        </div>
                        {gameMode !== GAME_MODES.SINGLE_PLAYER && (
                          <div
                            className={`player-score ${
                              currentPlayer === 2 ? "current" : ""
                            }`}
                          >
                            {scores.player2[category] !== null
                              ? scores.player2[category]
                              : currentPlayer === 2 &&
                                potentialScores[category] !== undefined
                              ? potentialScores[category]
                              : "-"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Sous-total et bonus */}
              <div className="totals">
                <div className="total-row">
                  <div className="total-label">Sous-total</div>
                  <div className="total-score-container">
                    <div className="player-score">
                      {totalScoresP1.upperTotal}
                    </div>
                    {gameMode !== GAME_MODES.SINGLE_PLAYER && (
                      <div className="player-score">
                        {totalScoresP2.upperTotal}
                      </div>
                    )}
                  </div>
                </div>
                <div className="bonus-row">
                  <div className="bonus-label">Bonus (si ≥ 63 +35)</div>
                  <div className="total-score-container">
                    <div className="player-score">{totalScoresP1.bonus}</div>
                    {gameMode !== GAME_MODES.SINGLE_PLAYER && (
                      <div className="player-score">{totalScoresP2.bonus}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section section-purple">
            {/* Contenu de la section de droite (violette dans l'image) */}
            <div className="special-combinations">
              {/* En-tête des colonnes de scores */}
              {gameMode !== GAME_MODES.SINGLE_PLAYER && (
                <div className="scores-header">
                  <div className="category-header">Catégorie</div>
                  <div className="players-header">
                    <div className="player-header">1J</div>
                    <div className="player-header">
                      {gameMode === GAME_MODES.PLAYER_VS_IA ? "IA" : "2J"}
                    </div>
                  </div>
                </div>
              )}
              {/* Section inférieure */}
              <div className="section-group">
                {Object.entries(CATEGORIES)
                  .filter(([_, { section }]) => section === "lower")
                  .map(([category, { label }]) => (
                    <div
                      key={category}
                      className={`score-row ${
                        scores.player1[category] !== null ||
                        scores.player2[category] !== null
                          ? "used"
                          : ""
                      } ${
                        potentialScores[category] !== undefined &&
                        scores[currentPlayer === 1 ? "player1" : "player2"][
                          category
                        ] === null
                          ? "potential"
                          : ""
                      }`}
                      onClick={() => selectCategory(category)}
                    >
                      <div className="category">{label}</div>
                      <div className="scores-container">
                        <div
                          className={`player-score ${
                            currentPlayer === 1 ? "current" : ""
                          }`}
                        >
                          {scores.player1[category] !== null
                            ? scores.player1[category]
                            : currentPlayer === 1 &&
                              potentialScores[category] !== undefined
                            ? potentialScores[category]
                            : "-"}
                        </div>
                        {gameMode !== GAME_MODES.SINGLE_PLAYER && (
                          <div
                            className={`player-score ${
                              currentPlayer === 2 ? "current" : ""
                            }`}
                          >
                            {scores.player2[category] !== null
                              ? scores.player2[category]
                              : currentPlayer === 2 &&
                                potentialScores[category] !== undefined
                              ? potentialScores[category]
                              : "-"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Total final */}
              <div className="total-row final">
                <div className="total-label">TOTAL</div>
                <div className="total-score-container">
                  <div className="player-score">{totalScoresP1.grandTotal}</div>
                  {gameMode !== GAME_MODES.SINGLE_PLAYER && (
                    <div className="player-score">
                      {totalScoresP2.grandTotal}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rangée de dés (comme dans l'image) */}
        <div className="dices-row">
          {dice.map((value, index) => (
            <div
              key={index}
              ref={(el) => (diceRefs.current[index] = el)}
              className={`dice ${heldDice[index] ? "held" : ""} ${
                rolling ? "rolling" : ""
              } ${currentDiceStyle === "dots" ? "egypt-style" : ""} ${
                currentDiceStyle === "emoji" ? "medieval-style" : ""
              } ${currentDiceStyle === "letters" ? "cyber-style" : ""} ${
                currentDiceStyle === "symbols" ? "space-style" : ""
              } ${currentDiceStyle === "princess" ? "princess-style" : ""} ${
                currentDiceStyle === "unicorn" ? "unicorn-style" : ""
              } ${currentDiceStyle === "candy" ? "candy-style" : ""} ${
                currentDiceStyle === "flower" ? "flower-style" : ""
              } ${currentDiceStyle === "ocean" ? "ocean-style" : ""} ${
                currentDiceStyle === "forest" ? "forest-style" : ""
              } ${currentDiceStyle === "fire" ? "fire-style" : ""} ${
                currentDiceStyle === "ice" ? "ice-style" : ""
              } ${currentDiceStyle === "gold" ? "gold-style" : ""} ${
                currentDiceStyle === "silver" ? "silver-style" : ""
              } ${currentDiceStyle === "neon" ? "neon-style" : ""} ${
                currentDiceStyle === "retro" ? "retro-style" : ""
              } ${currentDiceStyle === "ninja" ? "ninja-style" : ""} ${
                currentDiceStyle === "pirate" ? "pirate-style" : ""
              } ${currentDiceStyle === "magic" ? "magic-style" : ""} ${
                currentDiceStyle === "steampunk" ? "steampunk-style" : ""
              } ${currentDiceStyle === "aurora" ? "aurora-style" : ""} ${
                currentDiceStyle === "sunset" ? "sunset-style" : ""
              } ${currentDiceStyle === "galaxy" ? "galaxy-style" : ""} ${
                currentDiceStyle === "diamond" ? "diamond-style" : ""
              } ${currentDiceStyle === "volcano" ? "volcano-style" : ""} ${
                currentDiceStyle === "thunder" ? "thunder-style" : ""
              } ${currentDiceStyle === "rainbow" ? "rainbow-style" : ""} ${
                currentDiceStyle === "desert" ? "desert-style" : ""
              } ${currentDiceStyle === "jungle" ? "jungle-style" : ""} ${
                currentDiceStyle === "arctic" ? "arctic-style" : ""
              } ${currentDiceStyle === "vampire" ? "vampire-style" : ""} ${
                currentDiceStyle === "angel" ? "angel-style" : ""
              } ${currentDiceStyle === "dragon" ? "dragon-style" : ""} ${
                currentDiceStyle === "robot" ? "robot-style" : ""
              } ${currentDiceStyle === "crystal" ? "crystal-style" : ""} ${
                currentDiceStyle === "poison" ? "poison-style" : ""
              } ${currentDiceStyle === "plasma" ? "plasma-style" : ""} ${
                currentDiceStyle === "marble" ? "marble-style" : ""
              } ${currentDiceStyle === "hologram" ? "hologram-style" : ""} ${
                currentDiceStyle === "shadow" ? "shadow-style" : ""
              } ${currentDiceStyle === "cosmic" ? "cosmic-style" : ""} ${
                currentDiceStyle === "lava" ? "lava-style" : ""
              } ${currentDiceStyle === "matrix" ? "matrix-style" : ""} ${
                currentDiceStyle === "ancient" ? "ancient-style" : ""
              }`}
              data-value={value}
              onClick={() => toggleHold(index)}
            >
              {getDiceDisplayValue(value)}
            </div>
          ))}

          <div className="roll-button-container">
            <button
              className="roll-button"
              onClick={rollDice}
              disabled={rollsLeft === 0 || gameOver || rolling}
            >
              {rolling ? "Lancement..." : "Lance les dés"}
            </button>
          </div>
        </div>

        <div
          className={`rolls-left ${rollsLeft === MAX_ROLLS ? "max-rolls" : ""}`}
          data-rolls={rollsLeft}
        >
          ⚠️ {rollsLeft} lancer{rollsLeft !== 1 ? "s" : ""} restant
          {rollsLeft !== 1 ? "s" : ""} ⚠️
        </div>
      </div>

      {gameOver && (
        <div className="game-over">
          <h2>Partie terminée !</h2>
          {gameMode === GAME_MODES.SINGLE_PLAYER ? (
            <p>Votre score final est :</p>
          ) : (
            <p>Vos scores finaux sont :</p>
          )}
          <div className="final-scores-container">
            <div className="player-final">
              <span>Joueur 1:</span>
              <div className="final-score">{totalScoresP1.grandTotal}</div>
            </div>
            {gameMode !== GAME_MODES.SINGLE_PLAYER && (
              <div className="player-final">
                <span>
                  {gameMode === GAME_MODES.PLAYER_VS_CPU ? "IA:" : "Joueur 2:"}
                </span>
                <div className="final-score">{totalScoresP2.grandTotal}</div>
              </div>
            )}
          </div>
          <button className="play-again" onClick={restartGame}>
            Rejouer
          </button>
        </div>
      )}

      <div className="game-info">
        <h3>Règles du jeu</h3>
        <div className="rules">
          <p>
            Le Yams se joue avec 5 dés. À chaque tour, vous pouvez lancer les
            dés jusqu'à 3 fois :
          </p>
          <ul>
            <li>
              Après chaque lancer, vous pouvez garder les dés qui vous
              conviennent
            </li>
            <li>
              Une fois vos lancers terminés, vous devez choisir une catégorie
              pour marquer vos points
            </li>
            <li>
              Chaque catégorie ne peut être utilisée qu'une seule fois par
              partie
            </li>
            <li>
              La partie se termine quand toutes les catégories sont remplies
            </li>
          </ul>
        </div>

        <div className="game-info">
          <h3>Valeur</h3>
          <div className="rules">
            <ul>
              <li>Brelan : 3 dés identiques</li>
              <li>Carré : 4 dés identiques</li>
              <li>Full : 3 dés identiques + 2 dés identiques</li>
              <li>Petite suite : 4 dés en séquence (ex: 1-2-3-4)</li>
              <li>Grande suite : 5 dés en séquence (ex: 2-3-4-5-6)</li>
              <li>Yams : 5 dés identiques (ex: 2-2-2-2-2)</li>
              <li>Chance : addition des dés</li>
              <li>
                Bonus : 35 points de bonus si le sous total est supérieur à 63
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modale des scores */}
      {showScoresModal && (
        <div
          className="scores-modal-overlay"
          onClick={() => setShowScoresModal(false)}
        >
          <div className="scores-modal" onClick={(e) => e.stopPropagation()}>
            <div className="scores-modal-header">
              <h2>Historique des Parties</h2>
              <button
                className="scores-modal-close"
                onClick={() => setShowScoresModal(false)}
              >
                ×
              </button>
            </div>

            <div className="scores-modal-content">
              {gameHistory.length === 0 ? (
                <div className="no-games">
                  <p>Aucune partie terminée pour le moment.</p>
                  <p>Terminez une partie pour voir vos scores ici !</p>
                </div>
              ) : (
                <div className="games-list">
                  {gameHistory.map((game) => (
                    <div key={game.id} className="game-card">
                      <div className="game-header">
                        <div className="game-date">
                          {game.date} à {game.time}
                        </div>
                        <div className="game-mode">
                          {game.mode === GAME_MODES.SINGLE_PLAYER && "Solo"}
                          {game.mode === GAME_MODES.PLAYER_VS_PLAYER &&
                            "1J vs 2J"}
                          {game.mode === GAME_MODES.PLAYER_VS_IA && "1J vs IA"}
                        </div>
                      </div>

                      <div className="game-scores">
                        <div
                          className={`player-result ${
                            game.winner === "player1" ? "winner" : ""
                          }`}
                        >
                          <div className="player-name">
                            {game.players.player1.name}
                          </div>
                          <div className="player-score">
                            {game.players.player1.score}
                          </div>
                          <div className="score-breakdown">
                            <span>
                              Partie Sup: {game.players.player1.upperTotal}
                            </span>
                            <span>Bonus: {game.players.player1.bonus}</span>
                            <span>
                              Partie Inf: {game.players.player1.lowerTotal}
                            </span>
                          </div>
                        </div>

                        {game.players.player2 && (
                          <>
                            <div className="vs-divider">VS</div>
                            <div
                              className={`player-result ${
                                game.winner === "player2" ? "winner" : ""
                              }`}
                            >
                              <div className="player-name">
                                {game.players.player2.name}
                              </div>
                              <div className="player-score">
                                {game.players.player2.score}
                              </div>
                              <div className="score-breakdown">
                                <span>
                                  Partie Sup: {game.players.player2.upperTotal}
                                </span>
                                <span>Bonus: {game.players.player2.bonus}</span>
                                <span>
                                  Partie Inf: {game.players.player2.lowerTotal}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {game.winner !== "player1" && game.players.player2 && (
                        <div className="game-result">
                          {game.winner === "tie"
                            ? "Égalité !"
                            : game.winner === "player2"
                            ? `${game.players.player2.name} gagne !`
                            : `${game.players.player1.name} gagne !`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {gameHistory.length > 0 && (
                <div className="scores-modal-footer">
                  <button
                    className="clear-history-btn"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Êtes-vous sûr de vouloir effacer tout l'historique ?"
                        )
                      ) {
                        setGameHistory([]);
                        localStorage.removeItem("yams-game-history");
                      }
                    }}
                  >
                    Effacer l'historique
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modale des styles de dés */}
      {showDiceStyleModal && (
        <div
          className="dice-style-modal-overlay"
          onClick={() => setShowDiceStyleModal(false)}
        >
          <div
            className="dice-style-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dice-style-modal-header">
              <h2>Choisir le Style des Dés</h2>
              <button
                className="dice-style-modal-close"
                onClick={() => setShowDiceStyleModal(false)}
              >
                ×
              </button>
            </div>

            <div className="dice-style-modal-content">
              <div className="dice-styles-grid">
                {Object.entries(DICE_STYLES).map(([styleKey, style]) => (
                  <div
                    key={styleKey}
                    className={`dice-style-option ${
                      currentDiceStyle === styleKey ? "selected" : ""
                    }`}
                    onClick={() => changeDiceStyle(styleKey)}
                  >
                    <div className="style-name">{style.name}</div>
                    <div className="style-preview">
                      <div
                        className={`preview-dice ${
                          styleKey === "dots" ? "egypt-style" : ""
                        } ${styleKey === "emoji" ? "medieval-style" : ""} ${
                          styleKey === "letters" ? "cyber-style" : ""
                        } ${styleKey === "symbols" ? "space-style" : ""} ${
                          styleKey === "princess" ? "princess-style" : ""
                        } ${styleKey === "unicorn" ? "unicorn-style" : ""} ${
                          styleKey === "candy" ? "candy-style" : ""
                        } ${styleKey === "flower" ? "flower-style" : ""} ${
                          styleKey === "ocean" ? "ocean-style" : ""
                        } ${styleKey === "forest" ? "forest-style" : ""} ${
                          styleKey === "fire" ? "fire-style" : ""
                        } ${styleKey === "ice" ? "ice-style" : ""} ${
                          styleKey === "gold" ? "gold-style" : ""
                        } ${styleKey === "silver" ? "silver-style" : ""} ${
                          styleKey === "neon" ? "neon-style" : ""
                        } ${styleKey === "retro" ? "retro-style" : ""} ${
                          styleKey === "ninja" ? "ninja-style" : ""
                        } ${styleKey === "pirate" ? "pirate-style" : ""} ${
                          styleKey === "magic" ? "magic-style" : ""
                        } ${
                          styleKey === "steampunk" ? "steampunk-style" : ""
                        } ${styleKey === "aurora" ? "aurora-style" : ""} ${
                          styleKey === "sunset" ? "sunset-style" : ""
                        } ${styleKey === "galaxy" ? "galaxy-style" : ""} ${
                          styleKey === "diamond" ? "diamond-style" : ""
                        } ${styleKey === "volcano" ? "volcano-style" : ""} ${
                          styleKey === "thunder" ? "thunder-style" : ""
                        } ${styleKey === "rainbow" ? "rainbow-style" : ""} ${
                          styleKey === "desert" ? "desert-style" : ""
                        } ${styleKey === "jungle" ? "jungle-style" : ""} ${
                          styleKey === "arctic" ? "arctic-style" : ""
                        } ${styleKey === "vampire" ? "vampire-style" : ""} ${
                          styleKey === "angel" ? "angel-style" : ""
                        } ${styleKey === "dragon" ? "dragon-style" : ""} ${
                          styleKey === "robot" ? "robot-style" : ""
                        } ${styleKey === "crystal" ? "crystal-style" : ""} ${
                          styleKey === "poison" ? "poison-style" : ""
                        } ${styleKey === "plasma" ? "plasma-style" : ""} ${
                          styleKey === "marble" ? "marble-style" : ""
                        } ${styleKey === "hologram" ? "hologram-style" : ""} ${
                          styleKey === "shadow" ? "shadow-style" : ""
                        } ${styleKey === "cosmic" ? "cosmic-style" : ""} ${
                          styleKey === "lava" ? "lava-style" : ""
                        } ${styleKey === "matrix" ? "matrix-style" : ""} ${
                          styleKey === "ancient" ? "ancient-style" : ""
                        }`}
                      >
                        {style.values[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

// Fonction pour calculer les scores potentiels
const calculatePotentialScores = (dice) => {
  const diceCount = {};

  // Compter les occurrences de chaque valeur
  dice.forEach((value) => {
    diceCount[value] = (diceCount[value] || 0) + 1;
  });

  const sortedDice = [...dice].sort((a, b) => a - b);
  const diceSum = dice.reduce((sum, value) => sum + value, 0);

  const scores = {};

  // Section supérieure
  scores.ones = dice.filter((d) => d === 1).reduce((sum, d) => sum + d, 0);
  scores.twos = dice.filter((d) => d === 2).reduce((sum, d) => sum + d, 0);
  scores.threes = dice.filter((d) => d === 3).reduce((sum, d) => sum + d, 0);
  scores.fours = dice.filter((d) => d === 4).reduce((sum, d) => sum + d, 0);
  scores.fives = dice.filter((d) => d === 5).reduce((sum, d) => sum + d, 0);
  scores.sixes = dice.filter((d) => d === 6).reduce((sum, d) => sum + d, 0);

  // Section inférieure

  // Brelan (3 dés identiques)
  const hasThreeOfAKind = Object.values(diceCount).some((count) => count >= 3);
  scores.threeOfAKind = hasThreeOfAKind ? diceSum : 0;

  // Carré (4 dés identiques)
  const hasFourOfAKind = Object.values(diceCount).some((count) => count >= 4);
  scores.fourOfAKind = hasFourOfAKind ? diceSum : 0;

  // Full House (brelan + paire)
  const hasFullHouse =
    Object.values(diceCount).some((count) => count === 3) &&
    Object.values(diceCount).some((count) => count === 2);
  scores.fullHouse = hasFullHouse ? 25 : 0;

  // Petite suite (4 dés qui se suivent)
  const uniqueSorted = [...new Set(sortedDice)];
  let hasSmallStraight = false;
  for (let i = 0; i <= uniqueSorted.length - 4; i++) {
    if (
      uniqueSorted[i + 1] === uniqueSorted[i] + 1 &&
      uniqueSorted[i + 2] === uniqueSorted[i] + 2 &&
      uniqueSorted[i + 3] === uniqueSorted[i] + 3
    ) {
      hasSmallStraight = true;
      break;
    }
  }
  scores.smallStraight = hasSmallStraight ? 30 : 0;

  // Grande suite (5 dés qui se suivent)
  const hasLargeStraight =
    (sortedDice[0] === 1 &&
      sortedDice[1] === 2 &&
      sortedDice[2] === 3 &&
      sortedDice[3] === 4 &&
      sortedDice[4] === 5) ||
    (sortedDice[0] === 2 &&
      sortedDice[1] === 3 &&
      sortedDice[2] === 4 &&
      sortedDice[3] === 5 &&
      sortedDice[4] === 6);
  scores.largeStraight = hasLargeStraight ? 40 : 0;

  // Yams (5 dés identiques)
  const hasYahtzee = Object.values(diceCount).some((count) => count === 5);
  scores.yahtzee = hasYahtzee ? 50 : 0;

  // Chance (somme de tous les dés)
  scores.chance = diceSum;

  return scores;
};

export default YamsGame;
