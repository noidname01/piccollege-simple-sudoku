# Sudoku Game

A single-player Sudoku game built with Next.js (App Router), React, and Material UI.

## Features

- **Difficulty levels**: Easy, Medium, Hard (configurable via env vars)
- **Timer-based scoring**: Score = elapsed time + penalties (lower is better)
- **Move validation**: Server-side Sudoku rule checking (row, column, 3x3 box)
- **Penalty system**: Invalid moves and hints add time penalties
- **Undo / Redo**: Full move history with keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
- **Notes / Pencil marks**: Toggle note mode to mark candidate numbers per cell
- **Leaderboard**: Top 10 scores per difficulty level

## Run Locally

**Prerequisites:** Node.js

```bash
npm install
npm run dev
```

App runs at http://localhost:3000

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```
SUDOKU_EASY_EMPTY_CELLS=30
SUDOKU_MEDIUM_EMPTY_CELLS=40
SUDOKU_HARD_EMPTY_CELLS=50
SUDOKU_PENALTY_SECONDS=30
SUDOKU_HINT_PENALTY_SECONDS=60
```

Empty cell count is randomized within a range between difficulty levels (e.g. easy: 30-39, medium: 40-49, hard: 50-59).

## Project Structure

```
lib/                        # Backend (server-side only)
  constants.ts              # Shared types: Difficulty, DIFFICULTY_LABELS
  config.ts                 # Game config: env var readers, GameSession, Move, LeaderboardEntry
  sudoku.ts                 # Puzzle generator (backtracking algorithm)
  gameStore.ts              # In-memory game state manager + game logic

services/                   # Frontend (client-side only)
  api.ts                    # Axios API client for all endpoints

contexts/
  GameContext.tsx            # React context: all game state + actions + useGame() hook

components/
  SudokuBoard.tsx            # Root component: GameProvider + routing
  DifficultySelect.tsx       # Difficulty picker screen
  GameView.tsx               # Game layout: header, timer, board + leaderboard, error snackbar
  Board.tsx                  # 9x9 Sudoku grid with cell selection and notes display
  NumberPad.tsx              # Number buttons (1-9), undo/redo, clear, new game
  Timer.tsx                  # Timer display with penalty flash
  Leaderboard.tsx            # Ranking table (top 10 per difficulty)

app/
  layout.tsx                 # Root HTML layout
  page.tsx                   # Home page (renders SudokuBoard)
  globals.css                # Tailwind imports + cell styles
  api/game/
    new/route.ts             # POST /api/game/new
    leaderboard/route.ts     # GET  /api/game/leaderboard?difficulty=
    [gameId]/
      move/route.ts          # POST /api/game/:gameId/move
      clear/route.ts         # POST /api/game/:gameId/clear
      undo/route.ts          # POST /api/game/:gameId/undo
      redo/route.ts          # POST /api/game/:gameId/redo
      hint/route.ts          # POST /api/game/:gameId/hint
      state/route.ts         # GET  /api/game/:gameId/state
```

## API Design

### POST `/api/game/new`

Start a new game.

- **Request**: `{ "difficulty": "easy" | "medium" | "hard" }`
- **Response**: `{ "gameId": "uuid", "puzzle": number[][], "difficulty": "easy" }`

### POST `/api/game/:gameId/move`

Place a number. Validates against Sudoku rules (not the solution).

- **Request**: `{ "row": 0, "col": 4, "value": 7 }`
- **Response (valid)**: `{ "valid": true, "completed": false }`
- **Response (completes game)**: `{ "valid": true, "completed": true, "finalTime": 185.5 }`
- **Response (invalid)**: `{ "valid": false, "penalty": 30, "totalPenalty": 60 }`

### POST `/api/game/:gameId/clear`

Clear a user-entered cell.

- **Request**: `{ "row": 0, "col": 4 }`
- **Response**: `{ "success": true }`

### POST `/api/game/:gameId/undo`

Undo the last move.

- **Response**: `{ "success": true, "row": 0, "col": 4, "value": 0 }`

### POST `/api/game/:gameId/redo`

Redo a previously undone move.

- **Response**: `{ "success": true, "row": 0, "col": 4, "value": 7 }`

### POST `/api/game/:gameId/hint`

Reveal a random empty cell. Adds a time penalty.

- **Response**: `{ "row": 3, "col": 5, "value": 9, "penalty": 60, "totalPenalty": 90, "completed": false }`

### GET `/api/game/:gameId/state`

Get current game state (for page refresh recovery).

- **Response**: `{ "gameId": "...", "board": number[][], "difficulty": "medium", "elapsedTime": 45.2, "totalPenalty": 30, "completed": false }`

### GET `/api/game/leaderboard?difficulty=easy`

Get top 10 scores for a difficulty level.

- **Response**: `{ "entries": [{ "finalTime": 120.5, "difficulty": "easy", "completedAt": "2026-03-31T..." }, ...] }`