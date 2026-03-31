'use client';

import { Box, Button, Typography } from '@mui/material';
import { useGame } from '@/contexts/GameContext';
import { Difficulty, DIFFICULTY_LABELS } from '@/lib/constants';

export default function DifficultySelect() {
  const { startGame } = useGame();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} p={4}>
      <Typography variant="h3" component="h1" fontWeight="bold" color="primary">
        Sudoku
      </Typography>
      <Typography variant="h6" color="text.secondary">
        Select Difficulty
      </Typography>
      <Box display="flex" gap={2}>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
          <Button
            key={diff}
            variant="contained"
            size="large"
            onClick={() => startGame(diff)}
            sx={{ minWidth: 120, textTransform: 'capitalize' }}
          >
            {DIFFICULTY_LABELS[diff]}
          </Button>
        ))}
      </Box>
    </Box>
  );
}