'use client';

import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { useGame } from '@/contexts/GameContext';
import { DIFFICULTY_LABELS } from '@/lib/constants';
import Timer from './Timer';
import Board from './Board';
import NumberPad from './NumberPad';
import Leaderboard from './Leaderboard';

export default function GameView() {
  const { difficulty, errorMsg, clearError } = useGame();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} p={4}>
      <Typography variant="h3" component="h1" fontWeight="bold" color="primary">
        Sudoku
      </Typography>

      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
          {DIFFICULTY_LABELS[difficulty!]}
        </Typography>
      </Box>

      <Timer />

      {/* Board + Leaderboard side by side */}
      <Box display="flex" gap={4} alignItems="flex-start">
        {/* Left: Board + Controls */}
        <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
          <Board />
          <NumberPad />
        </Box>

        {/* Right: Leaderboard */}
        <Leaderboard />
      </Box>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={3000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={clearError} severity="error" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}