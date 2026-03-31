'use client';

import { Box, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useGame, formatTime } from '@/contexts/GameContext';

export default function Timer() {
  const { elapsedSeconds, totalPenalty, completed, finalTime, penaltyFlash } = useGame();
  // When completed, use the server's authoritative finalTime to avoid 1s drift
  const displayTime = (completed && finalTime != null) ? Math.round(finalTime) : elapsedSeconds + totalPenalty;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      sx={{
        px: 2,
        py: 1,
        borderRadius: '10px',
        backgroundColor: 'rgba(147, 51, 234, 0.08)',
      }}
    >
      <AccessTimeIcon sx={{ color: completed ? '#22c55e' : '#9333ea', fontSize: 20 }} />
      <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'monospace', color: '#581c87' }}>
        {formatTime(displayTime)}
      </Typography>
      {penaltyFlash && (
        <Typography
          variant="body2"
          fontWeight="bold"
          className="penalty-flash"
          sx={{ color: '#dc2626', ml: 0.5 }}
        >
          {penaltyFlash}
        </Typography>
      )}
    </Box>
  );
}