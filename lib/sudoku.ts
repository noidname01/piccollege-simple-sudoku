/**
 * Generates a Sudoku puzzle.
 * 1. Fills a complete 9x9 board using backtracking with randomized numbers
 * 2. Saves the filled board as the solution
 * 3. Removes `emptyCount` random cells to create the puzzle
 * Returns both the puzzle (with holes) and the full solution.
 */
export function generateSudoku(emptyCount: number = 40) {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));

  /** Check if placing `num` at (row, col) violates Sudoku rules */
  const isValid = (
    board: number[][],
    row: number,
    col: number,
    num: number,
  ) => {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[startRow + i][startCol + j] === num) return false;
      }
    }
    return true;
  };

  /** Recursively fill empty cells using backtracking. Mutates board in place. */
  const solve = (board: number[][]) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
            () => Math.random() - 0.5,
          );
          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solve(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  solve(board);
  // const solution = board.map((row) => [...row]);

  let count = emptyCount;
  while (count > 0) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      count--;
    }
  }

  return { puzzle: board };
}
