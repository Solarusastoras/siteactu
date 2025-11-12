import React, { useState, useEffect, useCallback } from "react";
import "./_echecs.scss";

// Définition d'un plateau initial de secours en cas de problème avec le JSON
const defaultBoard = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];

// Symboles de pièces par défaut
const defaultPieces = {
  p: { symbol: "♟" },
  P: { symbol: "♙" },
  r: { symbol: "♜" },
  R: { symbol: "♖" },
  n: { symbol: "♞" },
  N: { symbol: "♘" },
  b: { symbol: "♝" },
  B: { symbol: "♗" },
  q: { symbol: "♛" },
  Q: { symbol: "♕" },
  k: { symbol: "♚" },
  K: { symbol: "♔" },
};

// Essayez de charger les données de Chess, sinon utilisez les valeurs par défaut
let chessData;
try {
  chessData = require("../../../../Data/DataJeux/Datachess.json");
} catch (e) {
  console.warn("Impossible de charger le fichier Datachess.json:", e);
  chessData = {
    initialBoard: defaultBoard,
    pieces: defaultPieces,
  };
}

function EchecsGame ()  {
  // Initialisation des états
  const [board, setBoard] = useState(defaultBoard);
  const [selectedPiece, setSelectedPiece] = useState(null); // type: null | [number, number]
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState("white");
  const [gameStatus, setGameStatus] = useState("playing");
  const [message, setMessage] = useState("Initialisation...");
  const [capturedPieces, setCapturedPieces] = useState({
    white: [],
    black: [],
  });
  const [moveHistory, setMoveHistory] = useState([]);
  const [computerThinking, setComputerThinking] = useState(false);
  const [isComputerMoving, setIsComputerMoving] = useState(false);
  const [vsComputer, setVsComputer] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [checkedKing, setCheckedKing] = useState("");
  const [checkMateReason, setCheckMateReason] = useState("");
  const [showCheckAnimation, setShowCheckAnimation] = useState(false);

  // États pour les règles spéciales des échecs
  const [hasKingMoved, setHasKingMoved] = useState({
    white: false,
    black: false,
  });
  const [hasRookMoved, setHasRookMoved] = useState({
    white: { queenside: false, kingside: false },
    black: { queenside: false, kingside: false },
  });
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  // lastMove: null or { from: [number, number], to: [number, number], piece: string }
  const [lastMove, setLastMove] = useState(
    /** @type {null | {from: number[], to: number[], piece: string}} */ (null)
  );

  // Ajout d'une référence pour le plateau actuel
  const boardRef = React.useRef(defaultBoard);

  // Mettre à jour la référence quand le plateau change
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  // Effet pour gérer l'animation d'échec
  useEffect(() => {
    if (isCheck) {
      setShowCheckAnimation(true);
      const timer = setTimeout(() => {
        setShowCheckAnimation(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCheck]);

  // Fonction pour obtenir la valeur d'une pièce
  const getPieceValue = useCallback((piece) => {
    if (!piece) return 0;

    const pieceType = piece.toLowerCase();
    const values = {
      p: 1, // Pawn
      n: 3, // Knight
      b: 3, // Bishop
      r: 5, // Rook
      q: 9, // Queen
      k: 100, // King (very high value)
    };

    return values[pieceType] || 0;
  }, []);

  // Notation d'échecs simplifiée
  const generateChessNotation = useCallback(
    (fromRow, fromCol, toRow, toCol, piece, capturedPiece) => {
      const pieceSymbol = {
        p: "",
        P: "",
        r: "T",
        R: "T",
        n: "C",
        N: "C",
        b: "F",
        B: "F",
        q: "D",
        Q: "D",
        k: "R",
        K: "R",
      };

      const files = "abcdefgh";
      const ranks = "87654321";

      const from = `${files[fromCol]}${ranks[fromRow]}`;
      const to = `${files[toCol]}${ranks[toRow]}`;
      const pieceChar = pieceSymbol[piece] || "";
      const captureStr = capturedPiece ? "x" : "";
      return `${pieceChar}${from}${captureStr}${to}`;
    },
    []
  );

  // Mouvements du pion pour l'ordinateur
  const calculatePawnMovesForComputer = useCallback(
    (row, col, isWhite, moves, currentBoard) => {
      const direction = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;

      if (
        row + direction >= 0 &&
        row + direction < 8 &&
        !currentBoard[row + direction][col]
      ) {
        moves.push([row + direction, col]);

        if (row === startRow && !currentBoard[row + 2 * direction][col]) {
          moves.push([row + 2 * direction, col]);
        }
      }

      for (let dcol of [-1, 1]) {
        const newCol = col + dcol;
        if (newCol >= 0 && newCol < 8) {
          const target = currentBoard[row + direction]?.[newCol];
          if (target) {
            const isTargetWhite = target === target.toUpperCase();
            if (isWhite !== isTargetWhite) {
              moves.push([row + direction, newCol]);
            }
          }
        }
      }
    },
    []
  );

  // Mouvements en ligne droite pour l'ordinateur
  const calculateStraightMovesForComputer = useCallback(
    (row, col, isWhite, moves, currentBoard) => {
      const directions = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ];
      for (const [dx, dy] of directions) {
        let newRow = row + dx;
        let newCol = col + dy;
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = currentBoard[newRow][newCol];
          if (!target) {
            moves.push([newRow, newCol]);
          } else {
            const isTargetWhite = target === target.toUpperCase();
            if (isWhite !== isTargetWhite) {
              moves.push([newRow, newCol]);
            }
            break;
          }
          newRow += dx;
          newCol += dy;
        }
      }
    },
    []
  );

  // Mouvements en diagonale pour l'ordinateur
  const calculateDiagonalMovesForComputer = useCallback(
    (row, col, isWhite, moves, currentBoard) => {
      const directions = [
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
      ];
      for (const [dx, dy] of directions) {
        let newRow = row + dx;
        let newCol = col + dy;
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = currentBoard[newRow][newCol];
          if (!target) {
            moves.push([newRow, newCol]);
          } else {
            const isTargetWhite = target === target.toUpperCase();
            if (isWhite !== isTargetWhite) {
              moves.push([newRow, newCol]);
            }
            break;
          }
          newRow += dx;
          newCol += dy;
        }
      }
    },
    []
  );

  // Mouvements du cavalier pour l'ordinateur
  const calculateKnightMovesForComputer = useCallback(
    (row, col, isWhite, moves, currentBoard) => {
      const knightMoves = [
        [2, 1],
        [1, 2],
        [-1, 2],
        [-2, 1],
        [-2, -1],
        [-1, -2],
        [1, -2],
        [2, -1],
      ];
      for (const [dx, dy] of knightMoves) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = currentBoard[newRow][newCol];
          if (!target || (target === target.toUpperCase()) !== isWhite) {
            moves.push([newRow, newCol]);
          }
        }
      }
    },
    []
  );

  // Mouvements du roi pour l'ordinateur
  const calculateKingMovesForComputer = useCallback(
    (row, col, isWhite, moves, currentBoard) => {
      const kingMoves = [
        [0, 1],
        [1, 1],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, 1],
      ];
      for (const [dx, dy] of kingMoves) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = currentBoard[newRow][newCol];
          if (!target || (target === target.toUpperCase()) !== isWhite) {
            moves.push([newRow, newCol]);
          }
        }
      }
    },
    []
  );

  // Calculer tous les mouvements possibles pour une pièce
  const calculateAllMovesForPiece = useCallback(
    (row, col, isWhite, moves, currentBoard) => {
      const piece = currentBoard[row][col];
      if (!piece) return;

      const pieceType = piece.toLowerCase();

      switch (pieceType) {
        case "p":
          calculatePawnMovesForComputer(row, col, isWhite, moves, currentBoard);
          break;
        case "r":
          calculateStraightMovesForComputer(
            row,
            col,
            isWhite,
            moves,
            currentBoard
          );
          break;
        case "n":
          calculateKnightMovesForComputer(
            row,
            col,
            isWhite,
            moves,
            currentBoard
          );
          break;
        case "b":
          calculateDiagonalMovesForComputer(
            row,
            col,
            isWhite,
            moves,
            currentBoard
          );
          break;
        case "q":
          calculateStraightMovesForComputer(
            row,
            col,
            isWhite,
            moves,
            currentBoard
          );
          calculateDiagonalMovesForComputer(
            row,
            col,
            isWhite,
            moves,
            currentBoard
          );
          break;
        case "k":
          calculateKingMovesForComputer(row, col, isWhite, moves, currentBoard);
          break;
        default:
          break;
      }
    },
    [
      calculatePawnMovesForComputer,
      calculateStraightMovesForComputer,
      calculateKnightMovesForComputer,
      calculateDiagonalMovesForComputer,
      calculateKingMovesForComputer,
    ]
  );

  // Fonction pour vérifier si un roi est en échec
  const isKingInCheck = useCallback(
    (boardToCheck, isWhiteKing) => {
      // Trouver la position du roi
      let kingRow = -1,
        kingCol = -1;
      const kingSymbol = isWhiteKing ? "K" : "k";

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (boardToCheck[row][col] === kingSymbol) {
            kingRow = row;
            kingCol = col;
            break;
          }
        }
        if (kingRow !== -1) break;
      }

      // Vérifier si des pièces adverses peuvent attaquer le roi
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = boardToCheck[row][col];
          if (!piece) continue;

          const isPieceWhite = piece === piece.toUpperCase();
          // Si la pièce appartient à l'adversaire
          if (isPieceWhite !== isWhiteKing) {
            const attackMoves = [];
            calculateAllMovesForPiece(
              row,
              col,
              isPieceWhite,
              attackMoves,
              boardToCheck
            );

            // Vérifier si l'une des attaques possibles atteint le roi
            if (
              attackMoves.some(
                (move) => move[0] === kingRow && move[1] === kingCol
              )
            ) {
              return true;
            }
          }
        }
      }

      return false;
    },
    [calculateAllMovesForPiece]
  );

  // Vérifier si un mouvement laisse le roi en échec
  const moveWouldLeaveKingInCheck = useCallback(
    (fromRow, fromCol, toRow, toCol, player) => {
      // Simuler le mouvement
      const tempBoard = JSON.parse(JSON.stringify(board));
      tempBoard[toRow][toCol] = tempBoard[fromRow][fromCol];
      tempBoard[fromRow][fromCol] = null;

      // Vérifier si le roi est en échec après ce mouvement
      return isKingInCheck(tempBoard, player === "white");
    },
    [board, isKingInCheck]
  );

  // Filtrer les mouvements valides en situation d'échec
  const filterLegalMoves = useCallback(
    (row, col, currentMoves) => {
      const piece = board[row][col];
      if (!piece) return [];

      const isWhitePiece = piece === piece.toUpperCase();

      // Filtrer les mouvements qui laisseraient le roi en échec
      return currentMoves.filter((move) => {
        return !moveWouldLeaveKingInCheck(
          row,
          col,
          move[0],
          move[1],
          isWhitePiece ? "white" : "black"
        );
      });
    },
    [board, moveWouldLeaveKingInCheck]
  );

  // Mouvements du pion pour le joueur humain
  const calculatePawnMoves = useCallback(
    (row, col, isWhite, moves) => {
      if (!board) return;

      const direction = isWhite ? -1 : 1;
      const startRow = isWhite ? 6 : 1;

      // Avancer d'une case
      if (
        row + direction >= 0 &&
        row + direction < 8 &&
        !board[row + direction][col]
      ) {
        moves.push([row + direction, col]);

        // Avancer de deux cases depuis la position initiale
        if (row === startRow && !board[row + 2 * direction][col]) {
          moves.push([row + 2 * direction, col]);
        }
      }

      // Captures diagonales normales
      for (let dcol of [-1, 1]) {
        const newCol = col + dcol;
        if (newCol >= 0 && newCol < 8) {
          const target = board[row + direction]?.[newCol];
          if (target) {
            const isTargetWhite = target === target.toUpperCase();
            if (isWhite !== isTargetWhite) {
              moves.push([row + direction, newCol]);
            }
          }

          // TODO: Prise en passant sera ajoutée après la déclaration de canCaptureEnPassant
        }
      }
    },
    [board]
  );

  // Mouvements en diagonale pour le joueur humain
  const calculateDiagonalMoves = useCallback(
    (row, col, isWhite, moves) => {
      const directions = [
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
      ];
      for (const [dx, dy] of directions) {
        let newRow = row + dx;
        let newCol = col + dy;
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = board[newRow][newCol];
          if (!target) {
            moves.push([newRow, newCol]);
          } else {
            const isTargetWhite = target === target.toUpperCase();
            if (isWhite !== isTargetWhite) {
              moves.push([newRow, newCol]);
            }
            break;
          }
          newRow += dx;
          newCol += dy;
        }
      }
    },
    [board]
  );

  // Mouvements du cavalier pour le joueur humain
  const calculateKnightMoves = useCallback(
    (row, col, isWhite, moves) => {
      const knightMoves = [
        [2, 1],
        [1, 2],
        [-1, 2],
        [-2, 1],
        [-2, -1],
        [-1, -2],
        [1, -2],
        [2, -1],
      ];
      for (const [dx, dy] of knightMoves) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = board[newRow][newCol];
          if (!target || (target === target.toUpperCase()) !== isWhite) {
            moves.push([newRow, newCol]);
          }
        }
      }
    },
    [board]
  );

  // Mouvements en ligne droite pour le joueur humain
  const calculateStraightMoves = useCallback(
    (row, col, isWhite, moves) => {
      const directions = [
        [0, 1],
        [1, 0],
        [0, -1],
        [-1, 0],
      ];
      for (const [dx, dy] of directions) {
        let newRow = row + dx;
        let newCol = col + dy;
        while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = board[newRow][newCol];
          if (!target) {
            moves.push([newRow, newCol]);
          } else {
            const isTargetWhite = target === target.toUpperCase();
            if (isWhite !== isTargetWhite) {
              moves.push([newRow, newCol]);
            }
            break;
          }
          newRow += dx;
          newCol += dy;
        }
      }
    },
    [board]
  );

  // Vérifier si le roque est possible
  const canCastle = useCallback(
    (color, side) => {
      // Vérifier si le roi a déjà bougé
      if (hasKingMoved[color]) return false;

      // Vérifier si la tour correspondante a déjà bougé
      if (hasRookMoved[color][side]) return false;

      // Positions du roi et de la tour
      const kingRow = color === "white" ? 7 : 0;
      const kingCol = 4;
      const rookCol = side === "kingside" ? 7 : 0;

      // Vérifier si le roi et la tour sont à leurs positions initiales
      const expectedKing = color === "white" ? "K" : "k";
      const expectedRook = color === "white" ? "R" : "r";

      if (board[kingRow][kingCol] !== expectedKing) return false;
      if (board[kingRow][rookCol] !== expectedRook) return false;

      // Vérifier que les cases entre le roi et la tour sont vides
      const startCol = side === "kingside" ? kingCol + 1 : rookCol + 1;
      const endCol = side === "kingside" ? rookCol : kingCol;

      for (let col = startCol; col < endCol; col++) {
        if (board[kingRow][col]) return false;
      }

      // Vérifier que le roi n'est pas en échec
      if (isKingInCheck(board, color === "white")) return false;

      // Vérifier que le roi ne passe pas par une case en échec
      const direction = side === "kingside" ? 1 : -1;
      for (let i = 1; i <= 2; i++) {
        const testCol = kingCol + direction * i;
        if (testCol >= 0 && testCol < 8) {
          const testBoard = board.map((row) => [...row]);
          testBoard[kingRow][kingCol] = null;
          testBoard[kingRow][testCol] = expectedKing;

          if (isKingInCheck(testBoard, color === "white")) return false;
        }
      }

      return true;
    },
    [board, hasKingMoved, hasRookMoved, isKingInCheck]
  );

  // Obtenir les mouvements de roque possibles
  const getCastleMoves = useCallback(
    (row, col, isWhite) => {
      const moves = [];
      const color = isWhite ? "white" : "black";

      // Vérifier que c'est bien le roi à sa position initiale
      if (
        (isWhite && row !== 7 && col !== 4) ||
        (!isWhite && row !== 0 && col !== 4)
      ) {
        return moves;
      }

      // Roque du côté roi (petit roque)
      if (canCastle(color, "kingside")) {
        moves.push([row, col + 2]);
      }

      // Roque du côté dame (grand roque)
      if (canCastle(color, "queenside")) {
        moves.push([row, col - 2]);
      }

      return moves;
    },
    [canCastle]
  );

  // Effectuer le roque
  const performCastle = useCallback(
    (kingRow, kingCol, newKingCol) => {
      const isKingside = newKingCol > kingCol;
      const rookCurrentCol = isKingside ? 7 : 0;
      const rookNewCol = isKingside ? newKingCol - 1 : newKingCol + 1;

      const newBoard = board.map((row) => [...row]);

      // Déplacer le roi
      const king = newBoard[kingRow][kingCol];
      newBoard[kingRow][kingCol] = null;
      newBoard[kingRow][newKingCol] = king;

      // Déplacer la tour
      const rook = newBoard[kingRow][rookCurrentCol];
      newBoard[kingRow][rookCurrentCol] = null;
      newBoard[kingRow][rookNewCol] = rook;

      return newBoard;
    },
    [board]
  );

  // Mouvements du roi pour le joueur humain (avec roque)
  const calculateKingMoves = useCallback(
    (row, col, isWhite, moves) => {
      if (!board) return;

      const kingMoves = [
        [0, 1],
        [1, 1],
        [1, 0],
        [1, -1],
        [0, -1],
        [-1, -1],
        [-1, 0],
        [-1, 1],
      ];

      for (const [dx, dy] of kingMoves) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const target = board[newRow][newCol];
          if (!target || (target === target.toUpperCase()) !== isWhite) {
            moves.push([newRow, newCol]);
          }
        }
      }

      // Ajouter les mouvements de roque
      const castleMoves = getCastleMoves(row, col, isWhite);
      moves.push(...castleMoves);
    },
    [board, getCastleMoves]
  );

  // Vérifier l'échec et mat
  const checkForCheckmate = useCallback(
    (playerColor) => {
      const isWhitePlayer = playerColor === "white";

      // Parcourir toutes les pièces du joueur
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (!piece) continue;

          const isPieceWhite = piece === piece.toUpperCase();
          if (isPieceWhite === isWhitePlayer) {
            // Calculer tous les mouvements possibles pour cette pièce
            const moves = [];
            switch (piece.toLowerCase()) {
              case "p":
                calculatePawnMoves(row, col, isPieceWhite, moves);
                break;
              case "r":
                calculateStraightMoves(row, col, isPieceWhite, moves);
                break;
              case "n":
                calculateKnightMoves(row, col, isPieceWhite, moves);
                break;
              case "b":
                calculateDiagonalMoves(row, col, isPieceWhite, moves);
                break;
              case "q":
                calculateStraightMoves(row, col, isPieceWhite, moves);
                calculateDiagonalMoves(row, col, isPieceWhite, moves);
                break;
              case "k":
                calculateKingMoves(row, col, isPieceWhite, moves);
                break;
              default:
                break;
            }

            // Vérifier s'il y a des mouvements légaux
            const legalMoves = filterLegalMoves(row, col, moves);
            if (legalMoves.length > 0) {
              // S'il y a au moins un mouvement légal, ce n'est pas un échec et mat
              return false;
            }
          }
        }
      }

      // Analyse des raisons de l'échec et mat
      const kingSymbol = isWhitePlayer ? "K" : "k";
      let kingRow = -1,
        kingCol = -1;

      // Trouver la position du roi
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (board[row][col] === kingSymbol) {
            kingRow = row;
            kingCol = col;
            break;
          }
        }
        if (kingRow !== -1) break;
      }

      // Trouver les pièces qui attaquent le roi
      const attackingPieces = [];
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (!piece) continue;

          const isPieceWhite = piece === piece.toUpperCase();
          if (isPieceWhite !== isWhitePlayer) {
            const moves = [];
            calculateAllMovesForPiece(row, col, isPieceWhite, moves, board);

            if (
              moves.some((move) => move[0] === kingRow && move[1] === kingCol)
            ) {
              attackingPieces.push({
                piece,
                position: [row, col],
              });
            }
          }
        }
      }

      // Construire le message d'échec et mat
      let reason;
      if (attackingPieces.length === 0) {
        reason =
          "Pat! Le roi n'est pas en échec mais aucun mouvement légal n'est possible.";
        setGameStatus("stalemate");
      } else {
        const attackers = attackingPieces
          .map((attacker) => {
            const pieceNames = {
              p: "pion",
              P: "pion",
              r: "tour",
              R: "tour",
              n: "cavalier",
              N: "cavalier",
              b: "fou",
              B: "fou",
              q: "dame",
              Q: "dame",
            };
            const pieceName = pieceNames[attacker.piece] || "pièce";
            const [r, c] = attacker.position;
            const notation = `${String.fromCharCode(97 + c)}${8 - r}`;
            return `${pieceName} en ${notation}`;
          })
          .join(" et ");

        reason = `Échec et mat ! Le roi ${
          isWhitePlayer ? "blanc" : "noir"
        } est attaqué par ${attackers} et ne peut pas échapper.`;
        setGameStatus("checkmate");
      }

      setCheckMateReason(reason);
      setMessage(reason);
      return true;
    },
    [
      board,
      calculatePawnMoves,
      calculateStraightMoves,
      calculateKnightMoves,
      calculateDiagonalMoves,
      calculateKingMoves,
      calculateAllMovesForPiece,
      filterLegalMoves,
    ]
  );

  // Calculer les mouvements possibles
  const calculatePossibleMoves = useCallback(
    (row, col) => {
      const piece = board[row][col];
      if (!piece) return [];

      const isPieceWhite = piece === piece.toUpperCase();
      const pieceType = piece.toLowerCase();
      const moves = [];

      // Logique pour chaque type de pièce
      switch (pieceType) {
        case "p": // Pawn
          calculatePawnMoves(row, col, isPieceWhite, moves);
          break;
        case "r": // Rook
          calculateStraightMoves(row, col, isPieceWhite, moves);
          break;
        case "n": // Knight
          calculateKnightMoves(row, col, isPieceWhite, moves);
          break;
        case "b": // Bishop
          calculateDiagonalMoves(row, col, isPieceWhite, moves);
          break;
        case "q": // Queen
          calculateStraightMoves(row, col, isPieceWhite, moves);
          calculateDiagonalMoves(row, col, isPieceWhite, moves);
          break;
        case "k": // King
          calculateKingMoves(row, col, isPieceWhite, moves);
          break;
        default:
          break;
      }

      // Filtrer les mouvements qui laisseraient/mettraient le roi en échec
      const legalMoves = filterLegalMoves(row, col, moves);
      setPossibleMoves(legalMoves);

      // Vérifier l'échec et mat si le roi est en échec
      if (isCheck && legalMoves.length === 0) {
        // Vérifier si aucune pièce ne peut sauver le roi
        checkForCheckmate(isPieceWhite ? "white" : "black");
      }

      return legalMoves;
    },
    [
      board,
      calculatePawnMoves,
      calculateStraightMoves,
      calculateKnightMoves,
      calculateDiagonalMoves,
      calculateKingMoves,
      filterLegalMoves,
      isCheck,
      checkForCheckmate,
    ]
  );

  // Déplacer une pièce sur le plateau (avec règles spéciales)
  const movePiece = useCallback(
    (fromRow, fromCol, toRow, toCol, isComputerAction = false) => {
      // Eviter les actions pendant que l'ordinateur réfléchit
      if ((computerThinking || isComputerMoving) && !isComputerAction) return;
      if (!board) return;

      const piece = board[fromRow][fromCol];
      if (!piece) return;

      // VALIDATION CRITIQUE : Vérifier que le mouvement ne laisse pas le roi en échec
      const isWhitePiece = piece === piece.toUpperCase();
      const playerColor = isWhitePiece ? "white" : "black";

      if (
        moveWouldLeaveKingInCheck(fromRow, fromCol, toRow, toCol, playerColor)
      ) {
        console.warn("Mouvement interdit : le roi serait en échec !");
        return; // Empêcher le mouvement
      }

      // Créer une copie profonde du plateau actuel
      let newBoard = JSON.parse(JSON.stringify(board));
      const capturedPiece = newBoard[toRow][toCol];

      // Détecter et gérer les mouvements spéciaux
      const pieceType = piece.toLowerCase();

      // Roque
      if (pieceType === "k" && Math.abs(toCol - fromCol) === 2) {
        // Effectuer le roque (déplace le roi et la tour)
        newBoard = performCastle(fromRow, fromCol, toCol);

        // Marquer que le roi a bougé
        setHasKingMoved((prev) => ({
          ...prev,
          [isWhitePiece ? "white" : "black"]: true,
        }));

        // Marquer que les tours ont bougé
        setHasRookMoved((prev) => ({
          ...prev,
          [isWhitePiece ? "white" : "black"]: {
            ...prev[isWhitePiece ? "white" : "black"],
            kingside:
              toCol > fromCol
                ? true
                : prev[isWhitePiece ? "white" : "black"].kingside,
            queenside:
              toCol < fromCol
                ? true
                : prev[isWhitePiece ? "white" : "black"].queenside,
          },
        }));
      } else {
        // Mouvement normal
        newBoard[toRow][toCol] = piece;
        newBoard[fromRow][fromCol] = null;

        // Prise en passant
        if (pieceType === "p" && !capturedPiece && fromCol !== toCol) {
          // Capturer le pion en passant
          newBoard[fromRow][toCol] = null;
        }

        // Promotion des pions - TODO: Implémenter après la déclaration de canPromotePawn et promotePawn
        if (
          pieceType === "p" &&
          ((isWhitePiece && toRow === 0) || (!isWhitePiece && toRow === 7))
        ) {
          // Promotion automatique en dame
          newBoard[toRow][toCol] = isWhitePiece ? "Q" : "q";
        }

        // Marquer les mouvements pour le roque
        if (pieceType === "k") {
          setHasKingMoved((prev) => ({
            ...prev,
            [isWhitePiece ? "white" : "black"]: true,
          }));
        } else if (pieceType === "r") {
          const player = isWhitePiece ? "white" : "black";
          const side = fromCol === 0 ? "queenside" : "kingside";
          setHasRookMoved((prev) => ({
            ...prev,
            [player]: {
              ...prev[player],
              [side]: true,
            },
          }));
        }
      }

      // Enregistrer le dernier mouvement pour la prise en passant
      setLastMove({
        from: [fromRow, fromCol],
        to: [toRow, toCol],
        piece: piece,
      });

      // Enregistrer les pièces capturées
      if (capturedPiece) {
        const isWhiteCapture = capturedPiece === capturedPiece.toUpperCase();
        setCapturedPieces((prev) => ({
          ...prev,
          [isWhiteCapture ? "white" : "black"]: [
            ...prev[isWhiteCapture ? "white" : "black"],
            capturedPiece,
          ],
        }));
      }

      // Enregistrer le mouvement dans l'historique
      const notation = generateChessNotation(
        fromRow,
        fromCol,
        toRow,
        toCol,
        piece,
        capturedPiece
      );
      setMoveHistory((prev) => [...prev, notation]);

      // Mettre à jour le plateau
      setBoard(newBoard);

      // Changer de joueur APRÈS avoir mis à jour le plateau
      const nextPlayer = currentPlayer === "white" ? "black" : "white";

      // Vérifier si le roi adverse est en échec
      const isNextPlayerInCheck = isKingInCheck(
        newBoard,
        nextPlayer === "white"
      );
      setIsCheck(isNextPlayerInCheck);
      setCheckedKing(isNextPlayerInCheck ? nextPlayer : "");

      // Vérifier immédiatement s'il y a échec et mat
      if (isNextPlayerInCheck) {
        setTimeout(() => {
          if (checkForCheckmate(nextPlayer)) {
            return; // Ne pas continuer si c'est échec et mat
          }
          setMessage(
            `Échec ! Tour des ${nextPlayer === "white" ? "blancs" : "noirs"}.`
          );
        }, 100);
      } else {
        setMessage(`Tour des ${nextPlayer === "white" ? "blancs" : "noirs"}.`);
      }

      setCurrentPlayer(nextPlayer);
    },
    [
      board,
      computerThinking,
      currentPlayer,
      generateChessNotation,
      isComputerMoving,
      isKingInCheck,
      checkForCheckmate,
      performCastle,
      moveWouldLeaveKingInCheck,
    ]
  );

  // Logique pour le mouvement de l'ordinateur - amélioration de la gestion de l'échec
  const makeComputerMove = useCallback(() => {
    // Utiliser la référence pour avoir l'état le plus récent
    const currentBoard = boardRef.current;
    if (!currentBoard || currentPlayer !== "black") return;

    // Vérifier d'abord si le roi noir est en échec
    const isBlackKingInCheck = isKingInCheck(currentBoard, false);

    // Liste de toutes les pièces noires disponibles
    const blackPieces = [];
    for (let rowIndex = 0; rowIndex < currentBoard.length; rowIndex++) {
      for (
        let colIndex = 0;
        colIndex < currentBoard[rowIndex].length;
        colIndex++
      ) {
        const piece = currentBoard[rowIndex][colIndex];
        if (piece && piece === piece.toLowerCase()) {
          blackPieces.push([rowIndex, colIndex]);
        }
      }
    }

    // Pour chaque pièce, calculer les mouvements possibles
    let allMoves = [];
    blackPieces.forEach(([row, col]) => {
      const pieceMoves = [];
      calculateAllMovesForPiece(row, col, false, pieceMoves, currentBoard);

      pieceMoves.forEach((move) => {
        const [toRow, toCol] = move;

        // Important: Identifier la pièce cible AVANT de la remplacer dans le mouvement simulé
        const targetPiece = currentBoard[toRow][toCol];

        // Simuler le mouvement pour vérifier s'il laisse le roi en échec
        const tempBoard = JSON.parse(JSON.stringify(currentBoard));
        tempBoard[toRow][toCol] = tempBoard[row][col];
        tempBoard[row][col] = null;

        // Vérifier si ce mouvement sort le roi de l'échec
        const moveSavesFromCheck =
          isBlackKingInCheck && !isKingInCheck(tempBoard, false);

        // Ne considérer que les mouvements qui protègent le roi si le roi est en échec
        if (
          !isKingInCheck(tempBoard, false) &&
          (!isBlackKingInCheck || moveSavesFromCheck)
        ) {
          let moveScore = 0;

          // Priorité TRÈS ÉLEVÉE si le mouvement sauve le roi d'un échec
          if (moveSavesFromCheck) {
            moveScore += 50; // Bonus important pour sortir de l'échec
          }

          // Prioriser les captures
          if (targetPiece) {
            const pieceValue = getPieceValue(targetPiece);
            moveScore += pieceValue;

            // Bonus supplémentaire si on capture la pièce qui met en échec
            if (moveSavesFromCheck) {
              moveScore += 20;
            }
          }

          // Bonus pour avancer les pions au début
          const currentPiece = currentBoard[row][col];
          if (currentPiece && currentPiece.toLowerCase() === "p" && row < 4) {
            moveScore += 1;
          }

          // Bonus pour contrôler le centre
          if ((toRow === 3 || toRow === 4) && (toCol === 3 || toCol === 4)) {
            moveScore += 2;
          }

          allMoves.push({
            from: [row, col],
            to: move,
            score: moveScore,
            savesFromCheck: moveSavesFromCheck,
          });
        }
      });
    });

    // Trier les mouvements par score
    allMoves.sort((a, b) => b.score - a.score);

    try {
      // Sélectionner un mouvement
      if (allMoves.length > 0) {
        // Si nous sommes en échec, privilégier les mouvements qui sauvent le roi
        const movesToConsider = isBlackKingInCheck
          ? allMoves.filter((move) => move.savesFromCheck)
          : allMoves;

        if (movesToConsider.length > 0) {
          const topMoves = movesToConsider.slice(
            0,
            Math.min(3, movesToConsider.length)
          );
          const selectedMove =
            topMoves[Math.floor(Math.random() * topMoves.length)];

          const [fromRow, fromCol] = selectedMove.from;
          const [toRow, toCol] = selectedMove.to;

          // Exécuter le mouvement avec le flag isComputerAction à true
          movePiece(fromRow, fromCol, toRow, toCol, true);
        } else if (isBlackKingInCheck) {
          // Si on est en échec mais qu'aucun mouvement ne peut sauver le roi
          setMessage("Échec et mat! Les blancs ont gagné.");
          setGameStatus("checkmate");
        } else {
          // Aucun mouvement valide - pat
          setMessage("Pat! La partie est nulle.");
          setGameStatus("stalemate");
        }
      } else {
        // Aucun mouvement possible
        if (isBlackKingInCheck) {
          setMessage("Échec et mat! Les blancs ont gagné.");
          setGameStatus("checkmate");
        } else {
          setMessage("Pat! La partie est nulle.");
          setGameStatus("stalemate");
        }
      }
    } finally {
      // S'assurer que ces états sont toujours réinitialisés, même en cas d'erreur
      setComputerThinking(false);
      setIsComputerMoving(false);
    }
  }, [
    boardRef,
    calculateAllMovesForPiece,
    currentPlayer,
    getPieceValue,
    movePiece,
    isKingInCheck,
  ]);

  // Déclencher le mouvement de l'ordinateur quand c'est à lui de jouer
  useEffect(() => {
    if (
      vsComputer &&
      currentPlayer === "black" &&
      gameStatus === "playing" &&
      board
    ) {
      setComputerThinking(true);
      setTimeout(() => {
        makeComputerMove();
      }, 700); // délai pour simuler la réflexion
    }
  }, [vsComputer, currentPlayer, gameStatus, board, makeComputerMove]);

  // Initialiser le plateau de jeu
  useEffect(() => {
    resetBoard();
  }, []);

  // Réinitialiser le plateau
  const resetBoard = () => {
    try {
      // Utiliser les données du JSON ou la configuration par défaut
      const initialBoard = chessData?.initialBoard || defaultBoard;
      setBoard(JSON.parse(JSON.stringify(initialBoard)));
      setSelectedPiece(null);
      setPossibleMoves([]);
      setCurrentPlayer("white");
      setGameStatus("playing");
      setIsCheck(false);
      setMessage("Les blancs commencent");
      setCapturedPieces({ white: [], black: [] });
      setMoveHistory([]);
    } catch (error) {
      console.error("Erreur lors de l'initialisation du plateau:", error);
      setBoard(defaultBoard);
      setMessage("Erreur d'initialisation - plateau par défaut chargé");
    }
  };

  // Sélectionner une pièce
  const selectPiece = (row, col) => {
    if (gameStatus !== "playing") return;
    if (computerThinking) return; // Empêcher la sélection pendant que l'ordinateur réfléchit
    const piece = board[row][col];

    // Si aucune pièce n'est sélectionnée et qu'on clique sur une case vide
    if (!piece && !selectedPiece) {
      return;
    }

    // Si une pièce est déjà sélectionnée, tenter de la déplacer
    if (selectedPiece && Array.isArray(selectedPiece)) {
      const selectedRow = selectedPiece[0];
      const selectedCol = selectedPiece[1];
      const selectedPieceCode = board[selectedRow][selectedCol];

      // Si on clique sur la même pièce, désélectionner
      if (selectedRow === row && selectedCol === col) {
        setSelectedPiece(null);
        setPossibleMoves([]);
        return;
      }

      // Vérifier si le mouvement est valide
      const isMoveValid = possibleMoves.some(
        (move) => Array.isArray(move) && move[0] === row && move[1] === col
      );
      if (isMoveValid) {
        movePiece(selectedRow, selectedCol, row, col);
        setSelectedPiece(null);
        setPossibleMoves([]);
        return;
      }

      // Si on clique sur une autre pièce de la même couleur, la sélectionner
      const isPieceWhite = piece && piece === piece.toUpperCase();
      const isSelectedPieceWhite =
        selectedPieceCode &&
        selectedPieceCode === selectedPieceCode.toUpperCase();
      if (piece && isPieceWhite === isSelectedPieceWhite) {
        setSelectedPiece([row, col]);
        calculatePossibleMoves(row, col);
        return;
      }
    }

    // Sélectionner une nouvelle pièce si elle appartient au joueur actuel
    const isPieceWhite = piece === piece?.toUpperCase();
    if (
      piece &&
      ((currentPlayer === "white" && isPieceWhite) ||
        (currentPlayer === "black" && !isPieceWhite))
    ) {
      setSelectedPiece([row, col]);
      calculatePossibleMoves(row, col);
    }
  };

  // Ajout d'un bouton pour changer de mode de jeu
  const toggleGameMode = () => {
    // Réinitialiser les états pour éviter les conflits
    setIsComputerMoving(false);
    setComputerThinking(false);
    setVsComputer((prev) => !prev);
    resetBoard();
  };

  // Rendu de chaque case du plateau
  const renderSquare = (row, col) => {
    // Protection contre un board non défini
    if (!board) return <div className="square loading"></div>;

    const piece = board[row][col];
    const isSelected =
      selectedPiece &&
      Array.isArray(selectedPiece) &&
      selectedPiece[0] === row &&
      selectedPiece[1] === col;
    const isPossibleMove = possibleMoves.some(
      (move) => Array.isArray(move) && move[0] === row && move[1] === col
    );
    const isLight = (row + col) % 2 === 0;

    // Vérifier si cette case contient un roi en échec
    const containsCheckedKing =
      isCheck &&
      ((checkedKing === "white" && piece === "K") ||
        (checkedKing === "black" && piece === "k"));

    return (
      <div
        key={`${row}-${col}`}
        className={`square ${isLight ? "light" : "dark"} ${
          isSelected ? "selected" : ""
        } ${isPossibleMove ? "possible-move" : ""} ${
          containsCheckedKing ? "checked-king" : ""
        } ${
          showCheckAnimation && containsCheckedKing ? "check-animation" : ""
        }`}
        onClick={() => selectPiece(row, col)}
      >
        {row === 0 && (
          <div className="file-label">{String.fromCharCode(97 + col)}</div>
        )}
        {col === 0 && <div className="rank-label">{8 - row}</div>}

        {piece && (
          <div
            className={`piece ${
              piece === piece.toUpperCase() ? "white" : "black"
            } ${containsCheckedKing ? "checked" : ""}`}
          >
            {(chessData?.pieces && chessData.pieces[piece]?.symbol) ||
              defaultPieces[piece]?.symbol ||
              "?"}
          </div>
        )}

        {isPossibleMove && <div className="move-indicator"></div>}
      </div>
    );
  };

  // Rendu des pièces capturées
  const renderCapturedPieces = (color) => {
    const pieces = capturedPieces[color];
    return (
      <div className={`captured-pieces ${color}`}>
        {pieces.map((piece, index) => (
          <div key={index} className="captured-piece">
            {chessData.pieces[piece].symbol}
          </div>
        ))}
      </div>
    );
  };

  // Rendu de l'historique des mouvements
  const renderMoveHistory = () => {
    return (
      <div className="move-history">
        <h3>Historique des coups</h3>
        <div className="moves-list">
          {moveHistory.map((move, index) => (
            <div
              key={index}
              className={`move ${
                index % 2 === 0 ? "white-move" : "black-move"
              }`}
            >
              {index % 2 === 0 && (
                <span className="move-number">
                  {Math.floor(index / 2) + 1}.
                </span>
              )}
              {move}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="chess-game">
      <h2 className="game-title">Jeu d'Échecs</h2>

      <div className="game-controls-top">
        <button className="mode-toggle" onClick={toggleGameMode}>
          {vsComputer ? "Mode actuel: vs Ordinateur" : "Mode actuel: 2 Joueurs"}
        </button>
      </div>

      <div className={`game-status ${isCheck ? "check-status" : ""}`}>
        {computerThinking
          ? "L'ordinateur réfléchit..."
          : isCheck
          ? `ÉCHEC ! ${message}`
          : message}
      </div>

      {!board ? (
        <div className="loading-board">Chargement du plateau...</div>
      ) : (
        <div className="game-container">
          <div className="chess-board">
            {Array.from({ length: 8 }, (_, row) => (
              <div key={row} className="board-row">
                {Array.from({ length: 8 }, (_, col) => renderSquare(row, col))}
              </div>
            ))}
          </div>

          <div className="game-controls">
            <div className="captured-pieces-container">
              <h3>Pièces capturées</h3>
              {renderCapturedPieces("white")}
              {renderCapturedPieces("black")}
            </div>

            {renderMoveHistory()}

            <button className="restart-button" onClick={resetBoard}>
              Nouvelle partie
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EchecsGame;
