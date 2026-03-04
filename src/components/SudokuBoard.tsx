import React, { useState, useEffect } from 'react';
import { generateSudoku, checkValidInput } from '../utils/sudoku';
import { Box, Button, Typography, Paper, Snackbar, Alert } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export default function SudokuBoard() {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [invalidMoveCount, setInvalidMoveCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const initGame = () => {
    const { puzzle, solution: solved } = generateSudoku(45);
    setBoard(puzzle.map(row => [...row]));
    setInitialBoard(puzzle.map(row => [...row]));
    setSolution(solved);
    setIsWon(false);
    setErrorMsg(null);
    setInvalidMoveCount(0);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleChange = (row: number, col: number, value: string) => {
    const lastChar = value.slice(-1);

    if (lastChar === '') {
      const newBoard = [...board];
      newBoard[row] = [...newBoard[row]];
      newBoard[row][col] = 0;
      setBoard(newBoard);
      return;
    }

    const num = parseInt(lastChar, 10);
    if (isNaN(num) || num < 1 || num > 9) {
      setErrorMsg('Please enter a number between 1 and 9.');
      return;
    }

    if (!checkValidInput(board, row, col, num)) {
      setErrorMsg('Invalid input! This number conflicts with the current board.');
      const newCount = invalidMoveCount + 1;
      setInvalidMoveCount(newCount);
      if (newCount >= 3) {
        setIsGameOver(true);
      }
      return;
    }

    const newBoard = [...board];
    newBoard[row] = [...newBoard[row]];
    newBoard[row][col] = num;
    setBoard(newBoard);

    checkWin(newBoard);
  };

  const checkWin = (currentBoard: number[][]) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (currentBoard[i][j] === 0) return;
      }
    }
    setIsWon(true);
  };

  if (board.length === 0) return null;

  const heartsDisplay = (
    <Box display="flex" gap={1} mb={1}>
      {[0, 1, 2].map((index) => (
        index < 3 - invalidMoveCount ? (
          <FavoriteIcon key={index} sx={{ color: '#e91e63', fontSize: 32 }} />
        ) : (
          <FavoriteBorderIcon key={index} sx={{ color: '#e91e63', fontSize: 32 }} />
        )
      ))}
    </Box>
  );

  const gameOverOverlay = isGameOver && (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderRadius: 1,
      }}
    >
      <Typography variant="h4" color="error" fontWeight="bold" mb={2}>
        Game Over
      </Typography>
      <Button variant="contained" color="primary" onClick={initGame} size="large">
        Try Again
      </Button>
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={3} p={4}>
      <Typography variant="h3" component="h1" fontWeight="bold" color="primary">
        Sudoku
      </Typography>

      {heartsDisplay}

      <Paper elevation={4} sx={{ p: 2, backgroundColor: '#f5f5f5', position: 'relative' }}>
        {gameOverOverlay}
        <Box
          display="grid"
          gridTemplateColumns="repeat(9, 1fr)"
          gap="1px"
          sx={{ backgroundColor: '#000', border: '2px solid #000' }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isInitial = initialBoard[rowIndex][colIndex] !== 0;
              const borderBottom = rowIndex === 2 || rowIndex === 5 ? '2px solid #000' : 'none';
              const borderRight = colIndex === 2 || colIndex === 5 ? '2px solid #000' : 'none';

              return (
                <input
                  key={`${rowIndex}-${colIndex}`}
                  className="sudoku-cell"
                  type="text"
                  value={cell === 0 ? '' : cell}
                  onChange={(e) => handleChange(rowIndex, colIndex, e.target.value)}
                  readOnly={isInitial || isGameOver}
                  disabled={isGameOver}
                  style={{
                    width: '40px',
                    height: '40px',
                    textAlign: 'center',
                    fontSize: '20px',
                    fontWeight: isInitial ? 'bold' : 'normal',
                    color: isInitial ? '#000' : '#1976d2',
                    backgroundColor: isInitial ? '#e0e0e0' : '#fff',
                    border: 'none',
                    borderBottom,
                    borderRight,
                    outline: 'none',
                    cursor: isInitial ? 'default' : 'text',
                  }}
                />
              );
            })
          )}
        </Box>
      </Paper>

      <Button variant="contained" color="primary" onClick={initGame} size="large">
        New Game
      </Button>

      <Snackbar 
        open={!!errorMsg} 
        autoHideDuration={3000} 
        onClose={() => setErrorMsg(null)} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMsg(null)} severity="error" sx={{ width: '100%' }}>
          {errorMsg}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={isWon} 
        autoHideDuration={6000} 
        onClose={() => setIsWon(false)} 
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setIsWon(false)} severity="success" sx={{ width: '100%' }}>
          Congratulations! You solved the puzzle!
        </Alert>
      </Snackbar>
    </Box>
  );
}
