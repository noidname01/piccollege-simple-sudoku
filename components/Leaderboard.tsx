'use client';

import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useGame, formatTime } from '@/contexts/GameContext';

export default function Leaderboard() {
  const { leaderboardData, finalTime } = useGame();

  return (
    <Paper elevation={2} sx={{ p: 2, minWidth: 280 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <EmojiEventsIcon sx={{ color: '#f9a825' }} />
        <Typography variant="h6" fontWeight="bold">
          Leaderboard
        </Typography>
      </Box>
      {leaderboardData.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No scores yet. Be the first!
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboardData.map((entry, index) => {
                const rankIcons = ['🥇', '🥈', '🥉'];
                const isCurrentGame = finalTime != null && entry.finalTime === finalTime
                  && index === leaderboardData.findIndex(e => e.finalTime === finalTime);

                return (
                <TableRow
                  key={index}
                  sx={{ backgroundColor: isCurrentGame ? '#e8f5e9' : 'inherit' }}
                >
                  <TableCell>
                    {rankIcons[index] ?? index + 1}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: index < 3 ? 'bold' : 'normal' }}>
                    {formatTime(Math.round(entry.finalTime))}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    {new Date(entry.completedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}