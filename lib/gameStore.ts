import crypto from 'crypto';
import { Difficulty } from './constants';
import { GameSession, LeaderboardEntry, getEmptyCells, getPenaltySeconds, getHintPenaltySeconds } from './config';
import { generateSudoku } from './sudoku';

const GAME_TTL = 86400; // 24 hours

// --- KV Helpers ---

async function getGame(kv: KVNamespace, gameId: string): Promise<GameSession | null> {
  return await kv.get<GameSession>(`game:${gameId}`, 'json');
}

async function saveGame(kv: KVNamespace, game: GameSession): Promise<void> {
  await kv.put(`game:${game.gameId}`, JSON.stringify(game), { expirationTtl: GAME_TTL });
}

async function getLeaderboardEntries(kv: KVNamespace, difficulty: Difficulty): Promise<LeaderboardEntry[]> {
  const entries = await kv.get<LeaderboardEntry[]>(`leaderboard:${difficulty}`, 'json');
  return entries ?? [];
}

async function addLeaderboardEntry(kv: KVNamespace, entry: LeaderboardEntry): Promise<void> {
  const entries = await getLeaderboardEntries(kv, entry.difficulty);
  entries.push(entry);
  entries.sort((a, b) => a.finalTime - b.finalTime);
  const top10 = entries.slice(0, 10);
  await kv.put(`leaderboard:${entry.difficulty}`, JSON.stringify(top10));
}

// --- Validation ---

/** Check if placing `num` at (row, col) violates Sudoku rules */
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
 */
async function checkCompletion(kv: KVNamespace, game: GameSession): Promise<{ completed: true; finalTime: number } | { completed: false }> {
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

  await addLeaderboardEntry(kv, {
    finalTime,
    difficulty: game.difficulty,
    completedAt: new Date(game.completedTime).toISOString(),
  });

  return { completed: true, finalTime };
}

// --- Public API ---

export async function createGame(kv: KVNamespace, difficulty: Difficulty) {
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

  await saveGame(kv, session);
  return { gameId, puzzle, difficulty };
}

export async function makeMove(kv: KVNamespace, gameId: string, row: number, col: number, value: number) {
  const game = await getGame(kv, gameId);
  if (!game) return { error: 'Game not found', status: 404 };
  if (game.completed) return { error: 'Game already completed', status: 400 };
  if (game.puzzle[row][col] !== 0) return { error: 'Cannot modify initial cell', status: 400 };
  if (row < 0 || row > 8 || col < 0 || col > 8 || value < 1 || value > 9) {
    return { error: 'Invalid move parameters', status: 400 };
  }

  // Validate against Sudoku rules
  if (!isValidPlacement(game.board, row, col, value)) {
    const penalty = getPenaltySeconds();
    game.totalPenalty += penalty;
    await saveGame(kv, game);
    return { valid: false, penalty, totalPenalty: game.totalPenalty };
  }

  // Place the number
  const prevValue = game.board[row][col];
  game.board[row][col] = value;
  game.undoStack.push({ row, col, prevValue, newValue: value });
  game.redoStack = [];

  const result = await checkCompletion(kv, game);
  await saveGame(kv, game);

  if (result.completed) {
    return { valid: true, completed: true, finalTime: result.finalTime };
  }
  return { valid: true, completed: false };
}

export async function clearCell(kv: KVNamespace, gameId: string, row: number, col: number) {
  const game = await getGame(kv, gameId);
  if (!game) return { error: 'Game not found', status: 404 };
  if (game.completed) return { error: 'Game already completed', status: 400 };
  if (game.puzzle[row][col] !== 0) return { error: 'Cannot modify initial cell', status: 400 };

  const prevValue = game.board[row][col];
  if (prevValue === 0) return { success: true };

  game.board[row][col] = 0;
  game.undoStack.push({ row, col, prevValue, newValue: 0 });
  game.redoStack = [];
  await saveGame(kv, game);
  return { success: true };
}

export async function undo(kv: KVNamespace, gameId: string) {
  const game = await getGame(kv, gameId);
  if (!game) return { error: 'Game not found', status: 404 };
  if (game.completed) return { error: 'Game already completed', status: 400 };
  if (game.undoStack.length === 0) return { error: 'Nothing to undo', status: 400 };

  const move = game.undoStack.pop()!;
  game.board[move.row][move.col] = move.prevValue;
  game.redoStack.push(move);
  await saveGame(kv, game);

  return { success: true, row: move.row, col: move.col, value: move.prevValue };
}

export async function redo(kv: KVNamespace, gameId: string) {
  const game = await getGame(kv, gameId);
  if (!game) return { error: 'Game not found', status: 404 };
  if (game.completed) return { error: 'Game already completed', status: 400 };
  if (game.redoStack.length === 0) return { error: 'Nothing to redo', status: 400 };

  const move = game.redoStack.pop()!;
  game.board[move.row][move.col] = move.newValue;
  game.undoStack.push(move);
  await saveGame(kv, game);

  return { success: true, row: move.row, col: move.col, value: move.newValue };
}

export async function hint(kv: KVNamespace, gameId: string) {
  const game = await getGame(kv, gameId);
  if (!game) return { error: 'Game not found', status: 404 };
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

  const completionResult = await checkCompletion(kv, game);
  await saveGame(kv, game);

  if (completionResult.completed) {
    return { row, col, value, penalty, totalPenalty: game.totalPenalty, completed: true, finalTime: completionResult.finalTime };
  }
  return { row, col, value, penalty, totalPenalty: game.totalPenalty, completed: false };
}

export async function getState(kv: KVNamespace, gameId: string) {
  const game = await getGame(kv, gameId);
  if (!game) return { error: 'Game not found', status: 404 };

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

export async function getLeaderboard(kv: KVNamespace, difficulty?: Difficulty, limit: number = 10): Promise<LeaderboardEntry[]> {
  if (difficulty) {
    const entries = await getLeaderboardEntries(kv, difficulty);
    return entries.slice(0, limit);
  }
  const all = await Promise.all(
    (['easy', 'medium', 'hard'] as Difficulty[]).map(d => getLeaderboardEntries(kv, d))
  );
  return all.flat().sort((a, b) => a.finalTime - b.finalTime).slice(0, limit);
}