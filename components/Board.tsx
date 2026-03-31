'use client';

import { Box, Paper, Button, Typography } from '@mui/material';
import { useGame, formatTime } from '@/contexts/GameContext';

export default function Board() {
  const {
    board, initialBoard, selectedCell, completed, finalTime, notes,
    elapsedSeconds, totalPenalty, handleCellClick, handleNewGame,
  } = useGame();
  const displayTime = elapsedSeconds + totalPenalty;

  if (board.length === 0) return null;

  return (
    <Paper elevation={4} sx={{ p: 2, backgroundColor: '#f5f5f5', position: 'relative' }}>
      {completed && (
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(76, 175, 80, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: 1,
          }}
        >
          <Typography variant="h4" color="white" fontWeight="bold" mb={1}>
            Congratulations!
          </Typography>
          <Typography variant="h6" color="white" mb={2}>
            Time: {finalTime != null ? formatTime(Math.round(finalTime)) : formatTime(displayTime)}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleNewGame} size="large">
            New Game
          </Button>
        </Box>
      )}
      <Box
        display="grid"
        gridTemplateColumns="repeat(9, 1fr)"
        gap="1px"
        sx={{ backgroundColor: '#000', border: '2px solid #000' }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isInitial = initialBoard[rowIndex][colIndex] !== 0;
            const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
            const borderBottom = rowIndex === 2 || rowIndex === 5 ? '2px solid #000' : 'none';
            const borderRight = colIndex === 2 || colIndex === 5 ? '2px solid #000' : 'none';
            const cellNotes = notes[rowIndex][colIndex];
            const showNotes = cell === 0 && cellNotes.length > 0;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="sudoku-cell"
                onClick={() => handleCellClick(rowIndex, colIndex)}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: cell !== 0 ? '20px' : undefined,
                  fontWeight: isInitial ? 'bold' : 'normal',
                  color: isInitial ? '#000' : '#1976d2',
                  backgroundColor: isSelected ? '#bbdefb' : isInitial ? '#e0e0e0' : '#fff',
                  borderBottom,
                  borderRight,
                  cursor: isInitial ? 'default' : 'pointer',
                  userSelect: 'none',
                  padding: 0,
                }}
              >
                {cell !== 0 ? cell : showNotes ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyItems: 'center',
                  }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <span
                        key={n}
                        style={{
                          fontSize: '9px',
                          lineHeight: 1,
                          color: cellNotes.includes(n) ? '#666' : 'transparent',
                        }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                ) : ''}
              </div>
            );
          })
        )}
      </Box>
    </Paper>
  );
}