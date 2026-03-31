'use client';

import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useGame } from '@/contexts/GameContext';

export default function NumberPad() {
  const { selectedCell, completed, noteMode, handleNumberInput, handleClear, handleUndo, handleRedo, handleHint, handleNewGame, toggleNoteMode } = useGame();
  const [hintDialogOpen, setHintDialogOpen] = useState(false);

  const onHintConfirm = () => {
    setHintDialogOpen(false);
    handleHint();
  };

  return (
    <>
      <Box display="flex" gap={1}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <Button
            key={num}
            variant="outlined"
            onClick={() => handleNumberInput(num)}
            disabled={!selectedCell || completed}
            sx={{
              minWidth: '40px',
              height: '48px',
              fontSize: '18px',
              fontWeight: 'bold',
            }}
          >
            {num}
          </Button>
        ))}
      </Box>

      <Box display="flex" gap={2}>
        <Button
          variant={noteMode ? 'contained' : 'outlined'}
          color="info"
          onClick={toggleNoteMode}
          disabled={completed}
          startIcon={<EditNoteIcon />}
        >
          Notes {noteMode ? 'ON' : 'OFF'}
        </Button>
        <Button
          variant="outlined"
          onClick={handleUndo}
          disabled={completed}
          startIcon={<UndoIcon />}
        >
          Undo
        </Button>
        <Button
          variant="outlined"
          onClick={handleRedo}
          disabled={completed}
          startIcon={<RedoIcon />}
        >
          Redo
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={() => setHintDialogOpen(true)}
          disabled={completed}
          startIcon={<LightbulbOutlinedIcon />}
        >
          Hint
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleClear}
          disabled={!selectedCell || completed}
          startIcon={<BackspaceOutlinedIcon />}
        >
          Clear
        </Button>
        <Button variant="contained" color="primary" onClick={handleNewGame}>
          New Game
        </Button>
      </Box>

      <Dialog open={hintDialogOpen} onClose={() => setHintDialogOpen(false)}>
        <DialogTitle>Use Hint?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will reveal one cell but add a time penalty to your score. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHintDialogOpen(false)}>Cancel</Button>
          <Button onClick={onHintConfirm} color="warning" variant="contained">
            Use Hint
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}