## Context

The Sudoku game currently allows unlimited invalid moves. When a player enters a number that violates Sudoku rules (duplicate in row, column, or 3x3 box), the game shows an error message but nothing else happens. The game state is managed in `SudokuBoard.tsx` using React hooks.

Current state tracking includes:
- `board` - current game board
- `initialBoard` - original puzzle (read-only cells)
- `solution` - the solved puzzle
- `errorMsg` - validation error messages
- `isWon` - win state flag

## Goals / Non-Goals

**Goals:**
- Track invalid move attempts per game session
- End the game after three invalid moves
- Provide clear visual feedback on remaining attempts
- Allow players to restart after game over

**Non-Goals:**
- Persisting invalid move count across browser sessions
- Configurable number of allowed attempts
- Leaderboards or scoring based on attempts
- Undo functionality for invalid moves

## Decisions

### 1. State Management Approach
**Decision**: Add `invalidMoveCount` state to `SudokuBoard.tsx` alongside existing state.

**Rationale**: The existing component already manages all game state. Adding a simple counter state follows the established pattern and keeps logic co-located.

**Alternative considered**: Create a separate game state context. Rejected because the current architecture is simple and doesn't warrant additional complexity for a single new state value.

### 2. Invalid Move Detection Point
**Decision**: Increment counter in the existing `handleChange` function when `checkValidInput()` returns false.

**Rationale**: This is the exact location where invalid moves are already detected and rejected. No architectural changes needed.

### 3. Game Over UI
**Decision**: Add a `isGameOver` state and render a game-over overlay/modal when true.

**Rationale**: Consistent with the existing `isWon` pattern. The overlay prevents further interaction while showing restart option.

**Alternative considered**: Redirect to a separate game-over page. Rejected because the game is single-component and a modal maintains context.

### 4. Remaining Attempts Display
**Decision**: Show three heart icons that visually deplete as invalid moves occur.

**Rationale**: Hearts are a widely recognized "lives" metaphor in games. Visual display is more intuitive than text like "2 attempts remaining".

**Alternative considered**: Progress bar or numbered counter. Hearts are more engaging and game-like.

### 5. Counter Reset Behavior
**Decision**: Reset `invalidMoveCount` to 0 in the existing `initGame()` function.

**Rationale**: This function already handles all game initialization. Reset logic belongs here.

## Risks / Trade-offs

**[Risk]** Players may find three attempts too restrictive → Allow easy restart and consider adding a "practice mode" in future iterations

**[Risk]** Accidental invalid moves feel punishing → The existing error message explains why the move was invalid, helping players learn

**[Trade-off]** Hearts display takes UI space → Minimal impact; hearts are small and add visual interest
