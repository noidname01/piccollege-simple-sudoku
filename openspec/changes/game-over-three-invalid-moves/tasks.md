## 1. State Management

- [x] 1.1 Add `invalidMoveCount` state initialized to 0 in SudokuBoard.tsx
- [x] 1.2 Add `isGameOver` state initialized to false in SudokuBoard.tsx
- [x] 1.3 Reset both states to initial values in `initGame()` function

## 2. Invalid Move Tracking

- [x] 2.1 Increment `invalidMoveCount` in `handleChange` when `checkValidInput()` returns false
- [x] 2.2 Set `isGameOver` to true when `invalidMoveCount` reaches 3

## 3. Hearts Display UI

- [x] 3.1 Create hearts display component showing 3 heart icons above the board
- [x] 3.2 Style filled hearts for remaining attempts
- [x] 3.3 Style empty/depleted hearts for used attempts
- [x] 3.4 Connect hearts display to `invalidMoveCount` state

## 4. Game Over UI

- [x] 4.1 Create game over overlay/modal component
- [x] 4.2 Add "Game Over" message to the overlay
- [x] 4.3 Add restart button that calls `initGame()`
- [x] 4.4 Conditionally render overlay when `isGameOver` is true
- [x] 4.5 Disable board inputs when `isGameOver` is true

## 5. Testing

- [ ] 5.1 Verify invalid moves increment the counter
- [ ] 5.2 Verify hearts deplete correctly on invalid moves
- [ ] 5.3 Verify game over triggers after third invalid move
- [ ] 5.4 Verify restart resets counter and hearts
- [ ] 5.5 Verify valid moves and cell clearing don't affect counter
