import React, { useState, useEffect } from "react";
import "./_puissance4.scss";

const tokenChoices = [
  "🔴",
  "🟡",
  "🧙",
  "🦊",
  "🦁",
  "🐧",
  "🦄",
  "🦈",
  "🚀",
  "⚽",
  "🧛",
];

const DIFFICULTY_LEVELS = [
  {
    id: "easy",
    name: "Facile",
    description: "L'ordinateur joue de manière aléatoire",
  },
  {
    id: "expert",
    name: "Expert",
    description: "L'ordinateur joue comme un champion",
  },
];

function Puissance4 () {
  const [board, setBoard] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(7).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState("player"); // 'player', 'player2' ou 'computer'
  const [message, setMessage] = useState("Cliquez sur une colonne pour jouer");
  const [gameOver, setGameOver] = useState(false);
  const [playerToken, setPlayerToken] = useState(tokenChoices[0]);
  const [computerToken] = useState("🟡");
  const [mode, setMode] = useState("pvp"); // 'pvp' (Joueur vs Joueur) ou 'pvc' (Joueur vs Ordinateur)
  const [victoryCount, setVictoryCount] = useState({
    player1: 0,
    player2: 0,
    computer: 0,
  });
  const [player2Token, setPlayer2Token] = useState(tokenChoices[1]);
  const [difficulty, setDifficulty] = useState("easy");

  // Créer une référence pour le tableau de jeu et éviter les déclenchements multiples
  const boardRef = React.useRef(board);
  boardRef.current = board;

  // Réinitialiser le compteur de victoires
  const resetVictoryCount = () => {
    setVictoryCount({ player1: 0, player2: 0, computer: 0 });
  };

  // Mise à jour de la fonction playMove pour gérer le mode joueur vs joueur
  const playMove = (colIndex) => {
    if (gameOver) return;

    // En mode PvP, vérifier si c'est le tour du joueur 1 ou 2
    if (currentPlayer !== "player" && currentPlayer !== "player2") return;

    const rowIndex = getLowestEmptyRow(colIndex);
    if (rowIndex === -1) {
      setMessage("Cette colonne est pleine. Choisissez-en une autre.");
      return;
    }

    // Créer une nouvelle copie du plateau
    const newBoard = board.map((row) => [...row]);
    newBoard[rowIndex][colIndex] = currentPlayer; // "player" ou "player2"
    setBoard(newBoard);

    // Vérifier la victoire
    if (checkWin(rowIndex, colIndex, currentPlayer)) {
      const winnerMessage =
        currentPlayer === "player" ? "Joueur 1 gagne!" : "Joueur 2 gagne!";
      setMessage(winnerMessage);
      setGameOver(true);

      // Mettre à jour le compteur de victoires
      setVictoryCount((prev) => ({
        ...prev,
        [currentPlayer === "player" ? "player1" : "player2"]:
          prev[currentPlayer === "player" ? "player1" : "player2"] + 1,
      }));
      return;
    }

    // Vérifier match nul
    if (checkDraw()) {
      setMessage("Match nul!");
      setGameOver(true);
      return;
    }

    // Passer au joueur suivant
    if (mode === "pvp") {
      // En mode joueur vs joueur, alterner entre "player" et "player2"
      setCurrentPlayer(currentPlayer === "player" ? "player2" : "player");
      setMessage(
        currentPlayer === "player" ? "Tour du Joueur 2" : "Tour du Joueur 1"
      );
    } else {
      // En mode joueur vs ordinateur, passer à l'ordinateur
      setCurrentPlayer("computer");
      setMessage("L'ordinateur réfléchit...");
    }
  };

  // Trouver la position la plus basse dans une colonne
  const getLowestEmptyRow = React.useCallback(
    (colIndex) => {
      for (let row = 5; row >= 0; row--) {
        if (board[row][colIndex] === null) {
          return row;
        }
      }
      return -1; // Colonne pleine
    },
    [board]
  );

  // Compter le nombre de jetons dans une direction
  const countInDirection = React.useCallback(
    (row, col, rowDir, colDir, player) => {
      let count = 0;
      let r = row + rowDir;
      let c = col + colDir;

      while (r >= 0 && r < 6 && c >= 0 && c < 7 && board[r][c] === player) {
        count++;
        r += rowDir;
        c += colDir;
      }

      return count;
    },
    [board]
  );

  // Vérifier dans une direction spécifique
  const checkDirection = React.useCallback(
    (row, col, rowDir, colDir, player) => {
      let count = 1; // Le jeton actuel

      // Vérifier dans une direction
      count += countInDirection(row, col, rowDir, colDir, player);
      // Vérifier dans la direction opposée
      count += countInDirection(row, col, -rowDir, -colDir, player);

      return count >= 4;
    },
    [countInDirection]
  );

  // Version modifiée de checkDirection pour tester un plateau hypothétique
  const checkDirectionTest = (row, col, rowDir, colDir, player, testBoard) => {
    let count = 1; // Le jeton actuel

    // Vérifier dans une direction
    let r = row + rowDir;
    let c = col + colDir;
    while (r >= 0 && r < 6 && c >= 0 && c < 7 && testBoard[r][c] === player) {
      count++;
      r += rowDir;
      c += colDir;
    }

    // Vérifier dans la direction opposée
    r = row - rowDir;
    c = col - colDir;
    while (r >= 0 && r < 6 && c >= 0 && c < 7 && testBoard[r][c] === player) {
      count++;
      r -= rowDir;
      c -= colDir;
    }

    return count >= 4;
  };

  // Vérifier s'il y a une victoire
  const checkWin = React.useCallback(
    (row, col, player) => {
      // Vérifier horizontal, vertical, diagonal
      return (
        checkDirection(row, col, 0, 1, player) || // Horizontal
        checkDirection(row, col, 1, 0, player) || // Vertical
        checkDirection(row, col, 1, 1, player) || // Diagonal \
        checkDirection(row, col, 1, -1, player) // Diagonal /
      );
    },
    [checkDirection]
  );

  // Vérifier s'il y a match nul
  const checkDraw = React.useCallback(() => {
    // Si aucune cellule n'est vide, c'est un match nul
    return board.every((row) => row.every((cell) => cell !== null));
  }, [board]);

  // Fonction auxiliaire pour vérifier s'il y a 3 jetons alignés (à utiliser par findBestMove)
  const hasThreeInRow = (row, col, player, testBoard) => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal \
      [1, -1], // diagonal /
    ];

    for (const [rowDir, colDir] of directions) {
      let count = 1; // Le jeton actuel

      // Compter dans une direction
      let r = row + rowDir;
      let c = col + colDir;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && testBoard[r][c] === player) {
        count++;
        r += rowDir;
        c += colDir;
      }

      // Compter dans la direction opposée
      r = row - rowDir;
      c = col - colDir;
      while (r >= 0 && r < 6 && c >= 0 && c < 7 && testBoard[r][c] === player) {
        count++;
        r -= rowDir;
        c -= colDir;
      }

      if (count >= 3) return true;
    }

    return false;
  };

  // Fonction avancée pour trouver le meilleur coup (pour le niveau expert)
  const findBestMove = React.useCallback(() => {
    // Stratégie avancée pour le niveau expert

    // 1. Chercher d'abord une victoire immédiate
    for (let col = 0; col < 7; col++) {
      const row = getLowestEmptyRow(col);
      if (row !== -1) {
        // Vérifier si ce coup permettrait de gagner
        const testBoard = JSON.parse(JSON.stringify(board));
        testBoard[row][col] = "computer";

        // Utiliser notre fonction checkDirection pour vérifier
        const isWinningMove =
          checkDirectionTest(row, col, 0, 1, "computer", testBoard) || // Horizontal
          checkDirectionTest(row, col, 1, 0, "computer", testBoard) || // Vertical
          checkDirectionTest(row, col, 1, 1, "computer", testBoard) || // Diagonal \
          checkDirectionTest(row, col, 1, -1, "computer", testBoard); // Diagonal /

        if (isWinningMove) return col;
      }
    }

    // 2. Bloquer une victoire imminente du joueur
    for (let col = 0; col < 7; col++) {
      const row = getLowestEmptyRow(col);
      if (row !== -1) {
        // Vérifier si le joueur pourrait gagner ici
        const testBoard = JSON.parse(JSON.stringify(board));
        testBoard[row][col] = "player";

        const isBlockingMove =
          checkDirectionTest(row, col, 0, 1, "player", testBoard) ||
          checkDirectionTest(row, col, 1, 0, "player", testBoard) ||
          checkDirectionTest(row, col, 1, 1, "player", testBoard) ||
          checkDirectionTest(row, col, 1, -1, "player", testBoard);

        if (isBlockingMove) return col;
      }
    }

    // 3. Créer des alignements de 3 jetons pour préparer une victoire
    for (let col = 0; col < 7; col++) {
      const row = getLowestEmptyRow(col);
      if (row !== -1) {
        const testBoard = JSON.parse(JSON.stringify(board));
        testBoard[row][col] = "computer";

        // Vérifier si on peut créer un alignement de 3 jetons
        if (hasThreeInRow(row, col, "computer", testBoard)) {
          return col;
        }
      }
    }

    // 4. Bloquer les alignements de 2 jetons du joueur
    for (let col = 0; col < 7; col++) {
      const row = getLowestEmptyRow(col);
      if (row !== -1) {
        const testBoard = JSON.parse(JSON.stringify(board));
        testBoard[row][col] = "player";

        if (hasThreeInRow(row, col, "player", testBoard)) {
          return col;
        }
      }
    }

    // 5. Privilégier la colonne centrale puis les colonnes adjacentes
    const centralPreference = [3, 2, 4, 1, 5, 0, 6];
    for (const col of centralPreference) {
      if (getLowestEmptyRow(col) !== -1) {
        return col;
      }
    }

    // Fallback: colonne aléatoire
    return findRandomValidColumn();
  }, [board, getLowestEmptyRow, checkDirectionTest, hasThreeInRow]);

  // Fonction pour trouver une colonne valide aléatoire
  const findRandomValidColumn = React.useCallback(() => {
    const validColumns = [];
    for (let col = 0; col < 7; col++) {
      if (getLowestEmptyRow(col) !== -1) {
        validColumns.push(col);
      }
    }
    return validColumns[Math.floor(Math.random() * validColumns.length)];
  }, [getLowestEmptyRow]);

  // Remplacer complètement l'effet pour le tour de l'ordinateur avec une approche ultra-simplifiée
  useEffect(() => {
    // Si c'est le tour de l'ordinateur et que le jeu n'est pas terminé
    if (currentPlayer === "computer" && !gameOver) {
      console.log("Tour de l'ordinateur - tentative de jeu dans 2 secondes");

      const timer = setTimeout(() => {
        let colIndex;
        if (difficulty === "expert") {
          colIndex = findBestMove();
        } else {
          colIndex = findRandomValidColumn();
        }

        const rowIndex = getLowestEmptyRow(colIndex);

        console.log(
          `L'ordinateur joue en colonne ${colIndex}, ligne ${rowIndex}`
        );

        // Placer le jeton
        const newBoard = JSON.parse(JSON.stringify(boardRef.current));
        newBoard[rowIndex][colIndex] = "computer";

        // Mettre à jour le plateau
        setBoard(newBoard);

        // Vérifier victoire ou match nul
        if (checkWin(rowIndex, colIndex, "computer")) {
          setMessage("L'ordinateur a gagné!");
          setGameOver(true);
          setVictoryCount((prev) => ({ ...prev, computer: prev.computer + 1 }));
        } else if (checkDraw()) {
          setMessage("Match nul!");
          setGameOver(true);
        } else {
          setCurrentPlayer("player");
          setMessage("À votre tour!");
        }
      }, 2000); // Délai de 2 secondes

      // Nettoyer le timer si le composant est démonté ou si les dépendances changent
      return () => clearTimeout(timer);
    }
  }, [
    currentPlayer,
    gameOver,
    board,
    getLowestEmptyRow,
    checkWin,
    checkDraw,
    difficulty,
    findBestMove,
    findRandomValidColumn,
  ]);

  // Fonction pour recommencer la partie
  const restartGame = () => {
    setBoard(
      Array(6)
        .fill(null)
        .map(() => Array(7).fill(null))
    );
    // Toujours commencer par le joueur 1
    setCurrentPlayer("player");
    setMessage(
      mode === "pvp" ? "Tour du Joueur 1" : "Cliquez sur une colonne pour jouer"
    );
    setGameOver(false);
  };

  // Ajoute un gestionnaire pour le changement de mode
  const handleModeChange = (newMode) => {
    setMode(newMode);
    // Réinitialiser la partie quand le mode change
    restartGame();
  };

  // Fonction pour afficher la grille et les boutons de colonnes
  const renderBoard = () => (
    <>
      <div className="column-buttons">
        {[0, 1, 2, 3, 4, 5, 6].map((colIndex) => (
          <button
            key={colIndex}
            onClick={() => playMove(colIndex)}
            disabled={
              getLowestEmptyRow(colIndex) === -1 ||
              gameOver ||
              currentPlayer === "computer" // Désactivé seulement si c'est le tour de l'ordinateur
            }
            className="column-button"
          >
            ⬇️
          </button>
        ))}
      </div>

      <div className="game-grid">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className="cell"
                data-token={
                  cell === "player"
                    ? playerToken
                    : cell === "player2"
                    ? player2Token
                    : cell === "computer"
                    ? computerToken
                    : ""
                }
              ></div>
            ))}
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="puissance4">
      <h2 className="game-title">Puissance 4</h2>

      <div className="mode-selector">
        <label>
          <input
            type="radio"
            name="mode"
            value="pvp"
            checked={mode === "pvp"}
            onChange={() => handleModeChange("pvp")}
          />
          Joueur vs Joueur
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="pvc"
            checked={mode === "pvc"}
            onChange={() => handleModeChange("pvc")}
          />
          Joueur vs Ordinateur
        </label>
      </div>

      {mode === "pvc" && (
        <div className="difficulty-selector">
          <h3>Niveau de difficulté</h3>
          <div className="difficulty-options">
            {DIFFICULTY_LEVELS.map((level) => (
              <label
                key={level.id}
                className={`difficulty-option ${
                  difficulty === level.id ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={level.id}
                  checked={difficulty === level.id}
                  onChange={() => setDifficulty(level.id)}
                  disabled={gameOver || currentPlayer !== "player"}
                />
                <span className="difficulty-name">{level.name}</span>
                <span className="difficulty-description">
                  {level.description}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="victory-counter">
        <p>Victoires Joueur 1 : {victoryCount.player1}</p>
        <p>
          Victoires {mode === "pvp" ? "Joueur 2" : "Ordinateur"} :{" "}
          {mode === "pvp" ? victoryCount.player2 : victoryCount.computer}
        </p>
        <button onClick={resetVictoryCount}>Réinitialiser le compteur</button>
      </div>

      <div className="game-rules">
        <p>
          <strong>Règles du jeu :</strong> Le but du jeu est d'aligner 4 jetons
          de même couleur horizontalement, verticalement ou en diagonale. Chaque
          joueur, à son tour, place un jeton dans la colonne de son choix. Le
          jeton tombe alors en bas de la colonne. Le premier à aligner 4 jetons
          remporte la partie !
        </p>
      </div>

      <div className="token-selector">
        <span>Choisissez votre jeton :</span>
        <div className="token-options">
          {tokenChoices.map((token) => (
            <button
              key={token}
              onClick={() => setPlayerToken(token)}
              className={playerToken === token ? "selected" : ""}
              disabled={gameOver || currentPlayer !== "player"}
            >
              {token}
            </button>
          ))}
        </div>

        {mode === "pvp" && (
          <div className="token-options player2-tokens">
            <span>Jeton Joueur 2 :</span>
            {tokenChoices.map((token) => (
              <button
                key={token}
                onClick={() => setPlayer2Token(token)}
                className={player2Token === token ? "selected" : ""}
                disabled={gameOver || token === playerToken}
              >
                {token}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="game-status">{message}</div>

      {renderBoard()}

      <button className="restart-button" onClick={restartGame}>
        Nouvelle partie
      </button>
    </div>
  );
};

export default Puissance4;
