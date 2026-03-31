import crypto from 'crypto';
import { Difficulty } from './constants';
import { GameSession, LeaderboardEntry, getEmptyCells, getPenaltySeconds, getHintPenaltySeconds } from './config';
import { generateSudoku } from './sudoku';

const games = new Map<string, GameSession>();
const leaderboard: LeaderboardEntry[] = [];

// --- Helpers ---

/** Get a game session or return an error object */
function getGame(gameId: string) {
  const game = games.get(gameId);
  if (!game) return { error: 'Game not found', status: 404 } as const;
  return game;
}

/** Check if a number violates Sudoku rules (same row, column, or 3x3 box) */
function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i] === num) return false;
    if (i !== row && board[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if ((boxRow + i !== row || boxCol + j !== col) && board[boxRow + i][boxCol + j] === num) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Check if the board is complete (all cells filled and matching the solution).
 * If complete, marks the game as finished and adds to leaderboard.
 * Returns { completed: true, finalTime } or { completed: false }.
 */
function checkCompletion(game: GameSession): { completed: true; finalTime: number } | { completed: false } {
  const isFull = game.board.every(r => r.every(c => c !== 0));
  if (!isFull) return { completed: false };

  const matchesSolution = game.board.every((row, ri) =>
    row.every((cell, ci) => cell === game.solution[ri][ci])
  );
  if (!matchesSolution) return { completed: false };

  game.completed = true;
  game.completedTime = Date.now();
  const elapsedSeconds = (game.completedTime - game.startTime) / 1000;
  const finalTime = Math.round((elapsedSeconds + game.totalPenalty) * 10) / 10;

  leaderboard.push({
    finalTime,
    difficulty: game.difficulty,
    completedAt: new Date(game.completedTime).toISOString(),
  });

  return { completed: true, finalTime };
}

// --- Public API ---

export function createGame(difficulty: Difficulty) {
  const gameId = crypto.randomUUID();
  const emptyCount = getEmptyCells(difficulty);
  const { puzzle, solution } = generateSudoku(emptyCount);

  const session: GameSession = {
    gameId,
    difficulty,
    puzzle: puzzle.map(row => [...row]),
    board: puzzle.map(row => [...row]),
    solution,
    startTime: Date.now(),
    totalPenalty: 0,
    completed: false,
    undoStack: [],
    redoStack: [],
  };

  games.set(gameId, session);
  return { gameId, puzzle, difficulty };
}

export function makeMove(gameId: string, row: number, col: number, value: number) {
  const game = getGame(gameId);
  if ('error' in game) return game;
  if (game.completed) return { error: 'Game already completed', status: 400 };
  if (game.puzzle[row][col] !== 0) return { error: 'Cannot modify initial cell', status: 400 };
  if (row < 0 || row > 8 || col < 0 || col > 8 || value < 1 || value > 9) {
    return { error: 'Invalid move parameters', status: 400 };
  }

  // Validate against Sudoku rules
  if (!isValidPlacement(game.board, row, col, value)) {
    const penalty = getPenaltySeconds();
    game.totalPenalty += penalty;
    return { valid: false, penalty, totalPenalty: game.totalPenalty };
  }

  // Place the number
  const prevValue = game.board[row][col];
  game.board[row][col] = value;
  game.undoStack.push({ row, col, prevValue, newValue: value });
  game.redoStack = [];

  const result = checkCompletion(game);
  if (result.completed) {
    return { valid: true, completed: true, finalTime: result.finalTime };
  }
  return { valid: true, completed: false };
}

export function clearCell(gameId: string, row: number, col: number) {
  const game = getGame(gameId);
  if ('error' in game) return game;
  if (game.completed) return { error: 'Game already completed', status: 400 };
  if (game.puzzle[row][col] !== 0) return { error: 'Cannot modify initial cell', status: 400 };

  const prevValue = game.board[row][col];
  if (prevValue === 0) return { success: true };

  game.board[row][col] = 0;
  game.undoStack.push({ row, col, prevValue, newValue: 0 });
  game.redoStack = [];
  return { success: true };
}

export function undo(gameId: string) {
  const game = getGame(gameId);
  if ('error' in game) return game;
  if (game.completed) return { error: 'Game already completed', status: 400 };
  if (game.undoStack.length === 0) return { error: 'Nothing to undo', status: 400 };

  const move = game.undoStack.pop()!;
  game.board[move.row][move.col] = move.prevValue;
  game.redoStack.push(move);

  return { success: true, row: move.row, col: move.col, value: move.prevValue };
}

export function redo(gameId: string) {
  const game = getGame(gameId);
  if ('error' in game) return game;
  if (game.completed) return { error: 'Game already completed', status: 400 };
  if (game.redoStack.length === 0) return { error: 'Nothing to redo', status: 400 };

  const move = game.redoStack.pop()!;
  game.board[move.row][move.col] = move.newValue;
  game.undoStack.push(move);

  return { success: true, row: move.row, col: move.col, value: move.newValue };
}

export function hint(gameId: string) {
  const game = getGame(gameId);
  if ('error' in game) return game;
  if (game.completed) return { error: 'Game already completed', status: 400 };

  // Collect all unfilled cells
  const emptyCells: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (game.board[r][c] === 0) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return { error: 'No empty cells to reveal', status: 400 };

  // Reveal a random empty cell with the correct value
  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const value = game.solution[row][col];

  game.board[row][col] = value;
  game.undoStack.push({ row, col, prevValue: 0, newValue: value });
  game.redoStack = [];

  const penalty = getHintPenaltySeconds();
  game.totalPenalty += penalty;

  const completionResult = checkCompletion(game);
  if (completionResult.completed) {
    return { row, col, value, penalty, totalPenalty: game.totalPenalty, completed: true, finalTime: completionResult.finalTime };
  }
  return { row, col, value, penalty, totalPenalty: game.totalPenalty, completed: false };
}

export function getState(gameId: string) {
  const game = getGame(gameId);
  if ('error' in game) return game;

  const elapsedTime = game.completed && game.completedTime
    ? Math.round(((game.completedTime - game.startTime) / 1000) * 10) / 10
    : Math.round(((Date.now() - game.startTime) / 1000) * 10) / 10;

  return {
    gameId: game.gameId,
    board: game.board,
    difficulty: game.difficulty,
    elapsedTime,
    totalPenalty: game.totalPenalty,
    completed: game.completed,
  };
}

export function getLeaderboard(difficulty?: Difficulty, limit: number = 10): LeaderboardEntry[] {
  const filtered = difficulty
    ? leaderboard.filter(e => e.difficulty === difficulty)
    : leaderboard;
  return [...filtered].sort((a, b) => a.finalTime - b.finalTime).slice(0, limit);
}