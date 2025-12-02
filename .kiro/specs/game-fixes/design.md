# Design Document

## Overview

This design document outlines the technical approach to fixing critical gameplay issues, visual inconsistencies, and bugs in the Blast-Kiro game. The fixes will improve game balance, visual consistency, and resolve several game-breaking bugs that negatively impact player experience.

## Architecture

The game follows a simple canvas-based architecture with a game loop pattern:
- **Game Loop**: Handles update and render cycles via requestAnimationFrame
- **State Management**: Global game state variables track player, enemies, arena, and game status
- **Event System**: Keyboard event listeners for player input
- **Rendering**: Canvas 2D context for all visual rendering

The fixes will be implemented within this existing architecture without requiring structural changes.

## Components and Interfaces

### Configuration Updates

The CONFIG object will be modified to adjust:
- `GRID_WIDTH` and `GRID_HEIGHT`: Increase canvas size
- `ENEMY_MOVE_FRAMES`: Slow down enemy movement
- `DESTRUCTIBLE_BLOCK_PERCENTAGE`: Add more bricks
- New `DEATH_PAUSE_DURATION`: Add death feedback timing

### Color System Updates

The COLORS object will be updated to:
- Replace brown brick color with purple-toned alternatives
- Ensure enemy sprite rendering preserves pinkish tones
- Add death feedback colors

### Game State Management

Enhanced state tracking for:
- Death state with pause timer
- Proper vibe cleanup on death
- Lives boundary checking
- Restart vs continue logic

## Data Models

### Player State
```javascript
{
  x: number,           // Grid x position
  y: number,           // Grid y position
  moveTimer: number,   // Movement frame counter
  canPlaceVibe: boolean, // Vibe placement cooldown
  isDying: boolean,    // NEW: Death state flag
  deathTimer: number   // NEW: Death animation timer
}
```

### Game State Extensions
```javascript
{
  gameState: string,   // Current game state
  score: number,       // Player score
  lives: number,       // Remaining lives (min 0)
  deathPauseStart: number, // NEW: Death pause timestamp
  isInDeathPause: boolean  // NEW: Death pause flag
}
```

## Correc
tness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Lives never go negative

*For any* sequence of player deaths, the lives count should always be greater than or equal to zero.

**Validates: Requirements 5.1**

## Error Handling

### Image Loading Failures
- If sprites fail to load, display error message to user
- Prevent game from starting until images are successfully loaded
- Provide fallback rendering if images unavailable

### State Corruption
- Validate lives count on every update (clamp to 0 minimum)
- Ensure vibe array is properly cleared on level reset
- Verify game state transitions are valid

### Canvas Rendering
- Handle canvas context creation failures gracefully
- Validate canvas dimensions before rendering
- Catch and log any rendering errors

## Testing Strategy

### Unit Testing Approach

Unit tests will verify specific behaviors and edge cases:

**Configuration Tests:**
- Verify canvas dimensions match expected values based on grid size
- Verify destructible brick count meets minimum threshold
- Verify color values are set to purple tones

**State Management Tests:**
- Test that lives never go below 0 after multiple deaths
- Test that vibes array is cleared on level reset
- Test that game state transitions correctly on death

**Death Mechanics Tests:**
- Test death pause is activated when player dies
- Test that resetLevel is called when lives > 0
- Test that game over triggers when lives === 0

**Image Loading Tests:**
- Test that gameplay is blocked until images load
- Test that imagesLoaded counter increments correctly

### Property-Based Testing Approach

Property-based tests will verify universal correctness properties:

**Property Test Requirements:**
- Use a JavaScript property-based testing library (fast-check recommended)
- Configure each property test to run minimum 100 iterations
- Tag each test with the format: `**Feature: game-fixes, Property {number}: {property_text}**`

**Property 1: Lives Boundary**
- Generate random sequences of death events
- Verify lives count never becomes negative
- Verify game over triggers when lives reach 0

### Integration Testing

- Test complete death-to-restart flow
- Test complete game over flow
- Verify visual feedback appears during death
- Verify canvas resizing works correctly

## Implementation Details

### Difficulty Adjustments

**Canvas Size:**
- Increase GRID_WIDTH from 13 to 17 (30% larger)
- Increase GRID_HEIGHT from 11 to 15 (36% larger)
- Maintains aspect ratio while providing more space

**Enemy Movement:**
- Increase ENEMY_MOVE_FRAMES from 12 to 18 (50% slower)
- Reduces enemy aggressiveness significantly

**Brick Density:**
- Increase DESTRUCTIBLE_BLOCK_PERCENTAGE from 0.10 to 0.25 (150% more bricks)
- Provides more strategic cover and scoring opportunities

### Visual Improvements

**Color Updates:**
```javascript
COLORS: {
  DESTRUCTIBLE: '#9B59B6',  // Purple tone matching brand
  // ... other colors
}
```

**Font Updates (styles.css):**
```css
body {
  font-family: Helvetica, Arial, sans-serif;
}
```

**Brick Rendering:**
- Remove the +2 offset and -4 size reduction
- Render destructible bricks at full TILE_SIZE dimensions

### Bug Fixes

**Vibe Counter Fix:**
```javascript
function resetLevel() {
  vibes = [];  // Clear vibes array
  explosions = [];  // Clear explosions array
  // ... rest of reset logic
}
```

**Lives Boundary Fix:**
```javascript
function playerDie() {
  lives = Math.max(0, lives - 1);  // Clamp to 0 minimum
  updateUI();
  
  if (lives === 0) {
    gameState = GAME_STATES.GAME_OVER;
    showMessage('GAME OVER!<br>Press Enter to restart');
  } else {
    // Add death pause before reset
    startDeathPause();
  }
}
```

**Death Feedback:**
```javascript
let deathPauseStart = null;
const DEATH_PAUSE_DURATION = 1000; // 1 second

function startDeathPause() {
  deathPauseStart = Date.now();
  showMessage('💀 OUCH! 💀');
}

function update() {
  if (gameState !== GAME_STATES.PLAYING) return;
  
  // Check death pause
  if (deathPauseStart !== null) {
    if (Date.now() - deathPauseStart >= DEATH_PAUSE_DURATION) {
      deathPauseStart = null;
      showMessage('');
      resetLevel();
    }
    return; // Skip update during pause
  }
  
  // ... rest of update logic
}
```

**Restart Mechanics:**
```javascript
function handleKeyDown(e) {
  // ... existing code
  
  if (gameState === GAME_STATES.GAME_OVER) {
    if (e.key === 'Enter') {
      // Full restart from beginning
      score = 0;
      lives = CONFIG.STARTING_LIVES;
      gameState = GAME_STATES.PLAYING;
      resetLevel();
      updateUI();
      showMessage('');
    }
  }
}
```

**Sprite Visibility:**
- Existing image loading logic already prevents gameplay until sprites load
- Verify that startGame() is only called after imagesLoaded === 2
- Ensure resetLevel() is called within startGame() to initialize player/enemies

## Performance Considerations

- Larger canvas (17x15 vs 13x11) increases rendering load by ~50%
- More bricks (25% vs 10%) increases collision detection slightly
- Death pause adds minimal overhead (single timestamp check)
- All changes should maintain 60 FPS target on modern browsers

## Accessibility

- Maintain keyboard-only controls
- Ensure sufficient color contrast for purple bricks
- Death feedback provides clear visual indication
- Font change to Helvetica improves readability

## Future Enhancements

- Add sound effects for death and explosions
- Add screen shake on death
- Add particle effects for explosions
- Add difficulty levels (easy/medium/hard)
- Add level progression with increasing difficulty
