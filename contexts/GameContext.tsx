'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { Difficulty } from '@/lib/constants';
import { LeaderboardEntry } from '@/lib/config';
import { createGame as apiCreateGame, makeMove, clearCell as apiClearCell, undoMove as apiUndo, redoMove as apiRedo, getHint as apiHint, getLeaderboard } from '@/services/api';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface GameState {
  gameId: string | null;
  difficulty: Difficulty | null;
  board: number[][];
  initialBoard: number[][];
  elapsedSeconds: number;
  totalPenalty: number;
  completed: boolean;
  finalTime: number | null;
  errorMsg: string | null;
  penaltyFlash: string | null;
  selectedCell: [number, number] | null;
  leaderboardData: LeaderboardEntry[];
  notes: number[][][]; // 9x9 array of number arrays
  noteMode: boolean;
}

interface GameActions {
  startGame: (difficulty: Difficulty) => Promise<void>;
  handleNumberInput: (num: number) => Promise<void>;
  handleClear: () => Promise<void>;
  handleUndo: () => Promise<void>;
  handleRedo: () => Promise<void>;
  handleHint: () => Promise<void>;
  handleCellClick: (row: number, col: number) => void;
  handleNewGame: () => void;
  toggleNoteMode: () => void;
  clearError: () => void;
}

type GameContextValue = GameState & GameActions;

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameId, setGameId] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalPenalty, setTotalPenalty] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [penaltyFlash, setPenaltyFlash] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [notes, setNotes] = useState<number[][][]>(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
  const [noteMode, setNoteMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLeaderboard = async (diff: Difficulty) => {
    try {
      const entries = await getLeaderboard(diff);
      setLeaderboardData(entries);
    } catch {
      // ignore
    }
  };

  // Timer
  useEffect(() => {
    if (gameId && !completed) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameId, completed]);

  const startGame = async (diff: Difficulty) => {
    try {
      const data = await apiCreateGame(diff);
      setGameId(data.gameId);
      setDifficulty(diff);
      setBoard(data.puzzle.map(row => [...row]));
      setInitialBoard(data.puzzle.map(row => [...row]));
      setElapsedSeconds(0);
      setTotalPenalty(0);
      setCompleted(false);
      setFinalTime(null);
      setErrorMsg(null);
      setPenaltyFlash(null);
      setSelectedCell(null);
      fetchLeaderboard(diff);
    } catch {
      setErrorMsg('Failed to start game. Please try again.');
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (completed) return;
    if (initialBoard[row][col] !== 0) return;
    setSelectedCell([row, col]);
  };

  const handleNumberInput = useCallback(async (num: number) => {
    if (!gameId || completed || !selectedCell) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== 0) return;

    // Note mode: toggle number in cell's notes
    if (noteMode) {
      if (board[row][col] !== 0) return; // can't add notes to filled cells
      const newNotes = notes.map(r => r.map(c => [...c]));
      const cellNotes = newNotes[row][col];
      const idx = cellNotes.indexOf(num);
      if (idx >= 0) {
        cellNotes.splice(idx, 1);
      } else {
        cellNotes.push(num);
        cellNotes.sort();
      }
      setNotes(newNotes);
      return;
    }

    try {
      const result = await makeMove(gameId, row, col, num);
      if (result.valid) {
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = num;
        setBoard(newBoard);
        // Clear notes on this cell when a value is placed
        const newNotes = notes.map(r => r.map(c => [...c]));
        newNotes[row][col] = [];
        setNotes(newNotes);
        if (result.completed && result.finalTime != null) {
          setCompleted(true);
          setFinalTime(result.finalTime);
          setSelectedCell(null);
          if (difficulty) fetchLeaderboard(difficulty);
        }
      } else {
        setErrorMsg('Wrong number! Penalty +' + (result.penalty ?? 30) + 's');
        setTotalPenalty(result.totalPenalty ?? totalPenalty);
        setPenaltyFlash('+' + (result.penalty ?? 30) + 's');
        setTimeout(() => setPenaltyFlash(null), 2000);
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to make move.';
      setErrorMsg(message || 'Failed to make move.');
    }
  }, [gameId, completed, selectedCell, initialBoard, board, totalPenalty, difficulty, noteMode, notes]);

  const handleClear = useCallback(async () => {
    if (!gameId || completed || !selectedCell) return;
    const [row, col] = selectedCell;
    if (initialBoard[row][col] !== 0) return;

    // If cell has notes, clear notes only
    if (board[row][col] === 0 && notes[row][col].length > 0) {
      const newNotes = notes.map(r => r.map(c => [...c]));
      newNotes[row][col] = [];
      setNotes(newNotes);
      return;
    }

    if (board[row][col] === 0) return;

    try {
      await apiClearCell(gameId, row, col);
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = 0;
      setBoard(newBoard);
    } catch {
      // ignore
    }
  }, [gameId, completed, selectedCell, initialBoard, board, notes]);

  const handleUndo = useCallback(async () => {
    if (!gameId || completed) return;
    try {
      const result = await apiUndo(gameId);
      const newBoard = board.map(r => [...r]);
      newBoard[result.row][result.col] = result.value;
      setBoard(newBoard);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : 'Nothing to undo.';
      setErrorMsg(message || 'Nothing to undo.');
    }
  }, [gameId, completed, board]);

  const handleRedo = useCallback(async () => {
    if (!gameId || completed) return;
    try {
      const result = await apiRedo(gameId);
      const newBoard = board.map(r => [...r]);
      newBoard[result.row][result.col] = result.value;
      setBoard(newBoard);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : 'Nothing to redo.';
      setErrorMsg(message || 'Nothing to redo.');
    }
  }, [gameId, completed, board]);

  const handleHint = useCallback(async () => {
    if (!gameId || completed) return;
    try {
      const result = await apiHint(gameId);
      const newBoard = board.map(r => [...r]);
      newBoard[result.row][result.col] = result.value;
      setBoard(newBoard);
      setTotalPenalty(result.totalPenalty);
      setPenaltyFlash('+' + result.penalty + 's (hint)');
      setTimeout(() => setPenaltyFlash(null), 2000);
      if (result.completed && result.finalTime != null) {
        setCompleted(true);
        setFinalTime(result.finalTime);
        setSelectedCell(null);
        if (difficulty) fetchLeaderboard(difficulty);
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err) ? err.response?.data?.error : 'No hints available.';
      setErrorMsg(message || 'No hints available.');
    }
  }, [gameId, completed, board, difficulty]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (completed) return;

      // Ctrl+Z = undo, Ctrl+Shift+Z or Ctrl+Y = redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (!selectedCell) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        handleNumberInput(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, completed, handleNumberInput, handleClear, handleUndo, handleRedo]);

  const handleNewGame = () => {
    setGameId(null);
    setDifficulty(null);
    setBoard([]);
    setInitialBoard([]);
    setCompleted(false);
    setFinalTime(null);
    setElapsedSeconds(0);
    setTotalPenalty(0);
    setSelectedCell(null);
    setNotes(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
    setNoteMode(false);
  };

  const toggleNoteMode = () => setNoteMode(prev => !prev);
  const clearError = () => setErrorMsg(null);

  const value: GameContextValue = {
    gameId, difficulty, board, initialBoard,
    elapsedSeconds, totalPenalty, completed, finalTime,
    errorMsg, penaltyFlash, selectedCell, leaderboardData,
    notes, noteMode,
    startGame, handleNumberInput, handleClear, handleUndo, handleRedo, handleHint,
    handleCellClick, handleNewGame, toggleNoteMode, clearError,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}