'use client';

import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useGame, formatTime } from '@/contexts/GameContext';

const RANK_ICONS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { leaderboardData, finalTime } = useGame();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        minWidth: 260,
        borderRadius: '16px',
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(147, 51, 234, 0.1)',
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#581c87' }}>
          Leaderboard
        </Typography>
      </Box>

      {leaderboardData.length === 0 ? (
        <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: '#9333ea', opacity: 0.5 }}>
          No scores yet. Be the first!
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#581c87', borderColor: '#e9d5ff' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#581c87', borderColor: '#e9d5ff' }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#581c87', borderColor: '#e9d5ff' }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboardData.map((entry, index) => {
                const isCurrentGame = finalTime != null && entry.finalTime === finalTime
                  && index === leaderboardData.findIndex(e => e.finalTime === finalTime);

                return (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: isCurrentGame ? 'rgba(147, 51, 234, 0.08)' : 'inherit',
                      '& td': { borderColor: '#f3e8ff' },
                    }}
                  >
                    <TableCell sx={{ color: '#581c87' }}>
                      {RANK_ICONS[index] ?? index + 1}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: index < 3 ? 700 : 400, color: '#7e22ce' }}>
                      {formatTime(Math.round(entry.finalTime))}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.8rem', color: '#9333ea', opacity: 0.6 }}>
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