'use client';

import { Box, Button, IconButton, Tooltip } from '@mui/material';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ReplayIcon from '@mui/icons-material/Replay';
import { useGame } from '@/contexts/GameContext';

const btnBase = {
  borderRadius: '10px',
  fontWeight: 600,
  transition: 'all 0.15s ease',
};

export default function NumberPad() {
  const { selectedCell, completed, noteMode, handleNumberInput, handleClear, handleUndo, handleRedo, handleNewGame, toggleNoteMode } = useGame();

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={1.5}>
      {/* Number buttons */}
      <Box display="flex" gap={0.5}>
        {[1, 2, 3, 4, 5, 6].map(num => (
          <Button
            key={num}
            variant="outlined"
            onClick={() => handleNumberInput(num)}
            disabled={!selectedCell || completed}
            sx={{
              ...btnBase,
              minWidth: '44px',
              height: '48px',
              fontSize: '18px',
              borderColor: '#d8b4fe',
              color: '#7e22ce',
              '&:hover': {
                backgroundColor: '#f3e8ff',
                borderColor: '#9333ea',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                borderColor: '#e9d5ff',
                color: '#d8b4fe',
              },
            }}
          >
            {num}
          </Button>
        ))}
      </Box>

      {/* Action buttons - compact toolbar */}
      <Box display="flex" gap={1} alignItems="center">
        <Tooltip title={`Notes ${noteMode ? 'ON' : 'OFF'}`}>
          <span>
            <IconButton
              onClick={toggleNoteMode}
              disabled={completed}
              sx={{
                backgroundColor: noteMode ? '#9333ea' : 'transparent',
                color: noteMode ? '#fff' : '#9333ea',
                border: '1.5px solid',
                borderColor: '#d8b4fe',
                borderRadius: '10px',
                '&:hover': { backgroundColor: noteMode ? '#7e22ce' : '#f3e8ff' },
              }}
            >
              <EditNoteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Undo (Ctrl+Z)">
          <span>
            <IconButton
              onClick={handleUndo}
              disabled={completed}
              sx={{ color: '#9333ea', border: '1.5px solid #d8b4fe', borderRadius: '10px', '&:hover': { backgroundColor: '#f3e8ff' } }}
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo (Ctrl+Shift+Z)">
          <span>
            <IconButton
              onClick={handleRedo}
              disabled={completed}
              sx={{ color: '#9333ea', border: '1.5px solid #d8b4fe', borderRadius: '10px', '&:hover': { backgroundColor: '#f3e8ff' } }}
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Clear cell">
          <span>
            <IconButton
              onClick={handleClear}
              disabled={!selectedCell || completed}
              sx={{ color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '10px', '&:hover': { backgroundColor: '#fef2f2' } }}
            >
              <BackspaceOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Button
          variant="contained"
          onClick={handleNewGame}
          startIcon={<ReplayIcon />}
          sx={{
            ...btnBase,
            ml: 1,
            backgroundColor: '#9333ea',
            boxShadow: '0 2px 10px rgba(147, 51, 234, 0.25)',
            '&:hover': {
              backgroundColor: '#7e22ce',
              boxShadow: '0 4px 16px rgba(147, 51, 234, 0.35)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          New Game
        </Button>
      </Box>
    </Box>
  );
}
