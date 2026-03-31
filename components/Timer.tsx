'use client';

import { Box, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useGame, formatTime } from '@/contexts/GameContext';

export default function Timer() {
  const { elapsedSeconds, totalPenalty, completed, penaltyFlash } = useGame();
  const displayTime = elapsedSeconds + totalPenalty;

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <AccessTimeIcon sx={{ color: completed ? '#4caf50' : '#1976d2' }} />
      <Typography variant="h5" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
        {formatTime(displayTime)}
      </Typography>
      {penaltyFlash && (
        <Typography variant="body2" color="error" fontWeight="bold">
          {penaltyFlash}
        </Typography>
      )}
    </Box>
  );
}