'use client';

import { Box, Button, Typography } from '@mui/material';
import { useGame } from '@/contexts/GameContext';
import { Difficulties, Difficulty, DIFFICULTY_LABELS } from '@/lib/constants';

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#a855f7',
  medium: '#9333ea',
  hard: '#7e22ce',
};

export default function DifficultySelect() {
  const { startGame } = useGame();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={4} p={4} sx={{ minHeight: '80vh' }}>
      <Typography
        variant="h3"
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
      <Typography variant="h6" sx={{ color: '#9333ea', opacity: 0.7 }}>
        Select Difficulty
      </Typography>
      <Box display="flex" gap={2}>
        {Difficulties.map(diff => (
          <Button
            key={diff}
            variant="contained"
            size="large"
            onClick={() => startGame(diff)}
            sx={{
              minWidth: 130,
              textTransform: 'capitalize',
              backgroundColor: DIFFICULTY_COLORS[diff],
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 14px rgba(147, 51, 234, 0.25)',
              '&:hover': {
                backgroundColor: DIFFICULTY_COLORS[diff],
                boxShadow: '0 6px 20px rgba(147, 51, 234, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {DIFFICULTY_LABELS[diff]}
          </Button>
        ))}
      </Box>
    </Box>
  );
}