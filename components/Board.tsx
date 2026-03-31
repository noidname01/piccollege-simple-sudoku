'use client';

import { useState, useEffect } from 'react';
import { Box, Paper, Button, Typography } from '@mui/material';
import { useGame, formatTime } from '@/contexts/GameContext';

const CELL_SIZE = 50;

export default function Board() {
  const {
    board, initialBoard, selectedCell, completed, finalTime, notes,
    elapsedSeconds, totalPenalty, handleCellClick, handleNewGame,
  } = useGame();
  const displayTime = elapsedSeconds + totalPenalty;

  // Track which cell just got a new value for pop animation
  const [popCell, setPopCell] = useState<string | null>(null);
  const [prevBoard, setPrevBoard] = useState<number[][]>([]);

  useEffect(() => {
    if (prevBoard.length === 0) {
      setPrevBoard(board.map(r => [...r]));
      return;
    }
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r]?.[c] !== prevBoard[r]?.[c] && board[r]?.[c] !== 0) {
          setPopCell(`${r}-${c}`);
          setTimeout(() => setPopCell(null), 300);
        }
      }
    }
    setPrevBoard(board.map(r => [...r]));
  }, [board]);

  if (board.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: '16px',
        backgroundColor: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        border: '1px solid rgba(147, 51, 234, 0.1)',
      }}
    >
      {/* Completion overlay */}
      {completed && (
        <Box
          className="overlay-slide-in"
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(135deg, rgba(126, 34, 206, 0.92), rgba(147, 51, 234, 0.92))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '16px',
          }}
        >
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
            Congratulations!
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace', mb: 3 }}>
            {finalTime != null ? formatTime(Math.round(finalTime)) : formatTime(displayTime)}
          </Typography>
          <Button
            variant="contained"
            onClick={handleNewGame}
            size="large"
            sx={{
              backgroundColor: '#fff',
              color: '#7e22ce',
              fontWeight: 600,
              borderRadius: '10px',
              '&:hover': { backgroundColor: '#f3e8ff' },
            }}
          >
            New Game
          </Button>
        </Box>
      )}

      {/* Board grid */}
      <Box
        display="grid"
        gridTemplateColumns={`repeat(9, ${CELL_SIZE}px)`}
        gridTemplateRows={`repeat(9, ${CELL_SIZE}px)`}
        gap="1px"
        sx={{
          backgroundColor: '#d8b4fe',
          border: '2px solid #7e22ce',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isInitial = initialBoard[rowIndex][colIndex] !== 0;
            const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
            const isHighlighted = selectedCell && !isSelected && (
              selectedCell[0] === rowIndex || selectedCell[1] === colIndex ||
              (Math.floor(selectedCell[0] / 3) === Math.floor(rowIndex / 3) &&
               Math.floor(selectedCell[1] / 3) === Math.floor(colIndex / 3))
            );
            const cellKey = `${rowIndex}-${colIndex}`;
            const cellNotes = notes[rowIndex][colIndex];
            const showNotes = cell === 0 && cellNotes.length > 0;
            const isPop = popCell === cellKey;

            // Thicker borders at 3x3 box boundaries (gap handles normal borders)
            const borderRight = (colIndex % 3 === 2 && colIndex < 8) ? '2px solid #7e22ce' : 'none';
            const borderBottom = (rowIndex % 3 === 2 && rowIndex < 8) ? '2px solid #7e22ce' : 'none';

            let bgColor = '#ffffff';
            if (isSelected) bgColor = '#e9d5ff';
            else if (isHighlighted) bgColor = '#faf5ff';
            if (isInitial && !isSelected && !isHighlighted) bgColor = '#ede4ff';

            return (
              <div
                key={cellKey}
                className={`sudoku-cell ${isPop ? 'cell-pop' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: isInitial ? 700 : 500,
                  color: isInitial ? '#581c87' : '#9333ea',
                  backgroundColor: bgColor,
                  borderRight,
                  borderBottom,
                  cursor: isInitial ? 'default' : 'pointer',
                  userSelect: 'none',
                  outline: isSelected ? '2px solid #9333ea' : 'none',
                  outlineOffset: '-2px',
                  zIndex: isSelected ? 1 : 0,
                  position: 'relative',
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
                          fontSize: '10px',
                          lineHeight: 1,
                          color: cellNotes.includes(n) ? '#9333ea' : 'transparent',
                          fontWeight: 500,
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