'use client';

import { Box, Typography, Chip, Snackbar, Alert } from '@mui/material';
import { useGame } from '@/contexts/GameContext';
import { DIFFICULTY_LABELS } from '@/lib/constants';
import Timer from './Timer';
import Board from './Board';
import NumberPad from './NumberPad';
import Leaderboard from './Leaderboard';

export default function GameView() {
  const { difficulty, errorMsg, clearError } = useGame();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} p={2}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2}>
        <Typography
          variant="h4"
          component="h1"
          fontWeight="bold"
          sx={{
            background: 'linear-gradient(135deg, #7e22ce, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Sudoku
        </Typography>
        <Chip
          label={DIFFICULTY_LABELS[difficulty!]}
          size="small"
          sx={{
            backgroundColor: '#9333ea',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
          }}
        />
      </Box>

      {/* Timer */}
      <Timer />

      {/* Main area: Board + Leaderboard side by side, responsive */}
      <Box
        display="flex"
        gap={4}
        alignItems="flex-start"
        sx={{
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
        }}
      >
        {/* Board + Controls */}
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Board />
          <NumberPad />
        </Box>

        {/* Leaderboard */}
        <Leaderboard />
      </Box>

      {/* Error snackbar */}
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={3000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={clearError}
          severity="error"
          sx={{
            width: '100%',
            borderRadius: '10px',
            fontWeight: 500,
          }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}