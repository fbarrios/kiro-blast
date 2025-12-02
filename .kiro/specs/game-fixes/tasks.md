# Implementation Plan

- [x] 1. Update configuration constants for difficulty balancing
  - Increase GRID_WIDTH from 13 to 17
  - Increase GRID_HEIGHT from 11 to 15
  - Increase ENEMY_MOVE_FRAMES from 12 to 18
  - Increase DESTRUCTIBLE_BLOCK_PERCENTAGE from 0.10 to 0.25
  - Add DEATH_PAUSE_DURATION constant set to 1000ms
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Fix visual styling issues
  - [x] 2.1 Update brick colors to purple tones
    - Change COLORS.DESTRUCTIBLE from brown (#8B4513) to purple (#9B59B6)
    - _Requirements: 2.1_
  
  - [x] 2.2 Fix destructible brick rendering size
    - Remove the +2 offset and -4 size reduction in renderArena()
    - Render destructible bricks at full TILE_SIZE dimensions
    - _Requirements: 2.4_
  
  - [x] 2.3 Update font to Helvetica
    - Modify styles.css to use Helvetica as primary font
    - Update font-family to: Helvetica, Arial, sans-serif
    - _Requirements: 2.3_

- [x] 3. Fix lives boundary bug
  - [x] 3.1 Add lives clamping in playerDie function
    - Use Math.max(0, lives - 1) to prevent negative lives
    - _Requirements: 5.1_
  
  - [ ]* 3.2 Write property test for lives boundary
    - **Property 1: Lives never go negative**
    - **Validates: Requirements 5.1**
  
  - [x] 3.3 Ensure game over triggers at zero lives
    - Verify gameState transitions to GAME_OVER when lives === 0
    - _Requirements: 5.2_

- [x] 4. Implement death feedback system
  - [x] 4.1 Add death pause state variables
    - Add deathPauseStart variable (initially null)
    - _Requirements: 6.1_
  
  - [x] 4.2 Create startDeathPause function
    - Set deathPauseStart to current timestamp
    - Display death message (e.g., "💀 OUCH! 💀")
    - _Requirements: 6.2_
  
  - [x] 4.3 Modify update function to handle death pause
    - Check if deathPauseStart is not null
    - If pause duration elapsed, clear pause and call resetLevel
    - Return early during pause to prevent action continuation
    - _Requirements: 6.3_
  
  - [x] 4.4 Update playerDie to use death pause
    - Call startDeathPause() instead of immediately calling resetLevel
    - Only when lives > 0
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Fix vibe counter bug
  - [x] 5.1 Ensure vibes array is cleared in resetLevel
    - Verify vibes = [] is present in resetLevel function
    - Verify explosions = [] is present in resetLevel function
    - _Requirements: 4.1, 4.2_

- [x] 6. Fix restart mechanics
  - [x] 6.1 Update game over restart logic
    - In handleKeyDown, when gameState is GAME_OVER and Enter is pressed
    - Reset score to 0
    - Reset lives to CONFIG.STARTING_LIVES
    - Set gameState to PLAYING
    - Call resetLevel()
    - Call updateUI()
    - Clear message
    - _Requirements: 7.2, 7.3_
  
  - [x] 6.2 Verify level restart preserves lives
    - Ensure playerDie only calls resetLevel when lives > 0
    - Ensure lives count is not reset during level restart
    - _Requirements: 7.1_

- [x] 7. Verify sprite visibility on initialization
  - [x] 7.1 Confirm image loading logic
    - Verify startGame() only executes when imagesLoaded === 2
    - Verify resetLevel() is called to initialize player and enemies
    - _Requirements: 3.1, 3.2_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 9. Create unit tests for bug fixes
  - Write unit test for lives clamping (never negative)
  - Write unit test for vibe array clearing on reset
  - Write unit test for death pause activation
  - Write unit test for game over restart logic
  - Write unit test for level restart preserving lives
  - _Requirements: 4.1, 4.2, 5.1, 5.2, 6.1, 7.1, 7.2_

- [ ]* 10. Create integration tests
  - Test complete death-to-restart flow
  - Test complete game over flow
  - Test canvas resizing works correctly
  - _Requirements: 1.2, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_
