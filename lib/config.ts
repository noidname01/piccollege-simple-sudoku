import { Difficulties, Difficulty } from "./constants";

// --- Types ---

/** A single move, used for undo/redo tracking */
export interface Move {
  row: number;
  col: number;
  prevValue: number;
  newValue: number;
}

/** Server-side game session state */
export interface GameSession {
  gameId: string;
  difficulty: Difficulty;
  puzzle: number[][]; // The original puzzle (immutable, used to prevent editing given cells)
  board: number[][]; // Current board state with user entries
  emptyCells: number; // Count of remaining empty cells (0 = board is full)
  startTime: number;
  totalPenalty: number;
  completed: boolean;
  completedTime?: number;
  undoStack: Move[];
  redoStack: Move[];
}

/** A completed game entry for the leaderboard */
export interface LeaderboardEntry {
  finalTime: number;
  difficulty: Difficulty;
  completedAt: string; // ISO datetime
}

// --- Config helpers (read from env vars with defaults) ---

function getBaseEmptyCells(difficulty: Difficulty): number {
  const defaults: Record<Difficulty, number> = {
    easy: 30,
    medium: 40,
    hard: 50,
  };
  const envKeys: Record<Difficulty, string> = {
    easy: "SUDOKU_EASY_EMPTY_CELLS",
    medium: "SUDOKU_MEDIUM_EMPTY_CELLS",
    hard: "SUDOKU_HARD_EMPTY_CELLS",
  };
  const envVal = process.env[envKeys[difficulty]];
  return envVal ? parseInt(envVal, 10) : defaults[difficulty];
}

/**
 * Returns a random empty cell count for the given difficulty.
 * Range is [current level's value, next level's value - 1].
 * e.g. easy=30, medium=40 → easy range is 30-39
 * For the hardest level, range is [value, value + 9].
 */
export function getEmptyCells(difficulty: Difficulty): number {
  const idx = Difficulties.indexOf(difficulty);
  const min = getBaseEmptyCells(difficulty);
  const isLastLevel = idx >= Difficulties.length - 1;
  const max = isLastLevel
    ? min + 9
    : getBaseEmptyCells(Difficulties[idx + 1]) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getPenaltySeconds(): number {
  const envVal = process.env["SUDOKU_PENALTY_SECONDS"];
  return envVal ? parseInt(envVal, 10) : 30;
}
