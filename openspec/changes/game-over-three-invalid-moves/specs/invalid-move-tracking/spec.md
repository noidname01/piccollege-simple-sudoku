## ADDED Requirements

### Requirement: System tracks invalid move count
The system SHALL maintain a count of invalid move attempts for the current game session. An invalid move is defined as entering a number that violates Sudoku rules (duplicate in row, column, or 3x3 box).

#### Scenario: Invalid move increments counter
- **WHEN** player enters a number that violates Sudoku rules
- **THEN** the invalid move counter SHALL increment by 1

#### Scenario: Valid move does not affect counter
- **WHEN** player enters a valid number
- **THEN** the invalid move counter SHALL remain unchanged

#### Scenario: Clearing a cell does not affect counter
- **WHEN** player clears a cell (removes a number)
- **THEN** the invalid move counter SHALL remain unchanged

### Requirement: System displays remaining attempts
The system SHALL display the number of remaining attempts as three heart icons that visually indicate remaining lives.

#### Scenario: Initial display shows full hearts
- **WHEN** a new game starts
- **THEN** the system SHALL display three filled heart icons

#### Scenario: Hearts deplete on invalid move
- **WHEN** player makes an invalid move
- **THEN** one heart SHALL change to an empty/depleted state

### Requirement: Game ends after three invalid moves
The system SHALL end the game when the player has made three invalid moves.

#### Scenario: Third invalid move triggers game over
- **WHEN** player makes their third invalid move
- **THEN** the system SHALL display a game over screen
- **AND** the system SHALL prevent further moves on the board

#### Scenario: Game over screen shows restart option
- **WHEN** the game over screen is displayed
- **THEN** the system SHALL show a button to start a new game

### Requirement: Invalid move counter resets on new game
The system SHALL reset the invalid move counter to zero when starting a new game.

#### Scenario: Counter resets on restart
- **WHEN** player starts a new game (either from game over or normal restart)
- **THEN** the invalid move counter SHALL be 0
- **AND** all heart icons SHALL display as filled
