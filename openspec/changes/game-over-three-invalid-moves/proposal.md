## Why

Players can currently make unlimited invalid moves with no consequence beyond error messages. This reduces the game's challenge and stakes. Adding a "three strikes" mechanic creates meaningful tension and encourages players to think more carefully before entering numbers.

## What Changes

- Add tracking for invalid move attempts (moves that violate Sudoku rules)
- Display a visual counter showing remaining attempts (e.g., 3 hearts or strike indicators)
- End the game when the player makes three invalid moves
- Show a "Game Over" screen with option to restart
- Reset the invalid move counter when starting a new game

## Capabilities

### New Capabilities

- `invalid-move-tracking`: Track invalid move attempts and enforce a three-strike limit that ends the game

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- **Components affected**: `SudokuBoard.tsx` - add state for invalid move count, game over logic, and UI for displaying remaining attempts
- **Game flow**: Invalid moves now have consequences beyond just showing an error message
- **User experience**: Players will see how many attempts remain and experience game-over state when limit is reached
