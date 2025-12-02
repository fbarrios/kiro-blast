# Blast-Kiro Game Prompt

I want to build a game called "Blast-Kiro" based on the famous Bomberman (NES), but instead of a bomb, Kiro plants "vibes" that destroys bricks.
Please create a basic working version with:

## Core Setup
- HTML5 canvas for rendering
- 13x11 grid-based arena layout (same as NES Bomberman)
- Destructible and indestructible blocks stored as originalArena template
- Working arena copy that gets modified during gameplay (blocks destroyed by vibes)
- kiro-logo.png should be used as the player character

## Arena Layout (NES Bomberman Style)
- 13 columns x 11 rows grid
- Indestructible blocks in checkerboard pattern (every other tile on odd rows/columns)
- Destructible bricks filling a configurable number of remaining spaces (start around 10%)
- Top-left corner (player spawn) and surrounding tiles must be clear
- Player starts at position (1, 1) in grid coordinates

## Player Controls
- A Kiro character (kiro-logo.png) with movement controls (arrow keys) that moves at controlled speed (8 frames between moves)
- "Vibes" placement with spacebar key -- represent this with a animated text that says "vibe"
- Grid-based movement (snaps to tiles)
- Cannot walk through vibes, blocks, walls, or into explosion tiles

## Vibes Mechanics
- Vibes placed with spacebar key
- Vibes explode after a timer (3 seconds) --> add visual indication for each second
- Cross-shaped blast pattern extending in all four directions (up, down, left, right)
- Blast should be in Kiro pallete
- Blast range of 2 tiles in all directions initially
- Explosions destroy destructible blocks
- Explosions stopped by indestructible walls
- Limit of 1 bomb at a time initially
- Player can walk over their own bomb immediately after placing it, but cannot re-enter once they leave

## Enemy AI
- 6 enemies spawn at start (same as NES Bomberman Stage 1)
- Simple enemy AI that moves randomly
- Enemies move slower than the player (12 frames between moves)
- Enemies die when caught in vibes
- Enemies kill player on contact
- No power-ups dropped (enemies just die)

## Collision Detection
- Basic collision detection for walls, blocks, bombs, explosions, and enemies
- Player dies when touching enemy or caught in explosion (including their own)
- Enemies die when caught in any explosion

## Game Systems
- A score counter (points for destroying blocks and enemies)
- Lives system (start with 3 lives)
- Proper game state management with 'start', 'playing', 'gameOver', 'levelComplete' states
- Start screen that shows 'Arrow keys to move, Spacebar to place bomb! Press any arrow key to start'
- Game begins when any arrow key is pressed
- Game over when all lives lost
- Level complete when all enemies defeated
- Restart functionality

## Technical Requirements
- Proper arena restoration on restart (copy from originalArena, not random generation)
- Movement timer reset on restart to prevent timing issues
- Proper movement timing so characters move smoothly on the grid
- Explosions should have visual feedback and proper collision
- 40px tile size for clear visibility

## Visual Style
- Use Kiro brand colors: Purple (#790ECB) for UI elements
- Dark background (#0a0a0a)
- Clear visual distinction between destructible blocks, indestructible walls, bombs, and explosions
- Smooth animations for explosions

Make sure movement is grid-based and feels like classic NES Bomberman with proper timing. The arena must restore correctly on restart using the original template. Keep it simple and playable. Use vanilla JavaScript and make it work in a browser.
