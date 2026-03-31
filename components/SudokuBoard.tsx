'use client';

import { GameProvider, useGame } from '@/contexts/GameContext';
import DifficultySelect from './DifficultySelect';
import GameView from './GameView';

function SudokuBoardInner() {
  const { gameId, board } = useGame();

  if (!gameId) return <DifficultySelect />;
  if (board.length === 0) return null;
  return <GameView />;
}

export default function SudokuBoard() {
  return (
    <GameProvider>
      <SudokuBoardInner />
    </GameProvider>
  );
}