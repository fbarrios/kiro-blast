// ===== CONSTANTS =====
const CONFIG = {
    TILE_SIZE: 40,
    GRID_WIDTH: 17,
    GRID_HEIGHT: 15,
    PLAYER_MOVE_FRAMES: 8,
    ENEMY_MOVE_FRAMES: 18,
    VIBE_TIMER: 3000, // 3 seconds
    VIBE_RANGE: 2,
    EXPLOSION_DURATION: 500,
    MAX_VIBES: 1,
    STARTING_LIVES: 3,
    DESTRUCTIBLE_BLOCK_PERCENTAGE: 0.25,
    DEATH_PAUSE_DURATION: 2000,
    ENEMY_COUNT: 6,
    SCORE: {
        BRICK: 10,
        ENEMY: 100,
        LEVEL_COMPLETE: 500
    }
};

const COLORS = {
    BACKGROUND: '#0a0a0a',
    INDESTRUCTIBLE: '#2a2a2a',
    DESTRUCTIBLE: '#9B59B6',
    EXPLOSION: '#790ECB',
    VIBE_TEXT: '#790ECB'
};

const TILE_TYPES = {
    EMPTY: 0,
    INDESTRUCTIBLE: 1,
    DESTRUCTIBLE: 2
};

const GAME_STATES = {
    START: 'start',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver',
    LEVEL_COMPLETE: 'levelComplete'
};

// ===== GAME STATE =====
let canvas, ctx;
let gameState = GAME_STATES.START;
let score = 0;
let lives = CONFIG.STARTING_LIVES;
let frameCount = 0;

let originalArena = [];
let arena = [];
let player = null;
let enemies = [];
let vibes = [];
let explosions = [];

let keys = {};
let playerImage = new Image();
let enemyImage = new Image();
let imagesLoaded = 0;

// Death pause state
let deathPauseStart = null;

// ===== INITIALIZATION =====
function init() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = CONFIG.GRID_WIDTH * CONFIG.TILE_SIZE;
    canvas.height = CONFIG.GRID_HEIGHT * CONFIG.TILE_SIZE;
    ctx = canvas.getContext('2d');
    
    // Load images
    playerImage.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) startGame();
    };
    enemyImage.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === 2) startGame();
    };
    
    playerImage.src = 'kiro-logo.png';
    enemyImage.src = 'enemy.png';
    
    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    createOriginalArena();
    showMessage('arrow keys to move, spacebar to vibe<br>press any arrow key to start');
}

function startGame() {
    if (imagesLoaded < 2) return;
    
    gameState = GAME_STATES.START;
    score = 0;
    lives = CONFIG.STARTING_LIVES;
    
    // Initialize arena before starting game loop
    arena = originalArena.map(row => [...row]);
    
    updateUI();
    gameLoop();
}

function resetLevel() {
    // Copy original arena
    arena = originalArena.map(row => [...row]);
    
    // Reset player
    player = {
        x: 1,
        y: 1,
        moveTimer: 0,
        canPlaceVibe: true
    };
    
    // Reset enemies
    enemies = [];
    spawnEnemies();
    
    // Clear vibes and explosions
    vibes = [];
    explosions = [];
    frameCount = 0;
}

function respawnPlayer() {
    // Only respawn player, keep arena and enemies as they are
    player = {
        x: 1,
        y: 1,
        moveTimer: 0,
        canPlaceVibe: true
    };
    
    // Clear vibes and explosions for safety
    vibes = [];
    explosions = [];
}

// ===== ARENA CREATION =====
function createOriginalArena() {
    originalArena = [];
    
    // Create base grid with indestructible walls in checkerboard pattern
    for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
        originalArena[y] = [];
        for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
            // Border walls
            if (x === 0 || x === CONFIG.GRID_WIDTH - 1 || y === 0 || y === CONFIG.GRID_HEIGHT - 1) {
                originalArena[y][x] = TILE_TYPES.INDESTRUCTIBLE;
            }
            // Checkerboard pattern for indestructible blocks
            else if (x % 2 === 0 && y % 2 === 0) {
                originalArena[y][x] = TILE_TYPES.INDESTRUCTIBLE;
            }
            else {
                originalArena[y][x] = TILE_TYPES.EMPTY;
            }
        }
    }
    
    // Clear spawn area (top-left corner)
    originalArena[1][1] = TILE_TYPES.EMPTY;
    originalArena[1][2] = TILE_TYPES.EMPTY;
    originalArena[2][1] = TILE_TYPES.EMPTY;
    
    // Collect enemy spawn positions to avoid placing blocks there
    const enemySpawnPositions = [
        {x: 11, y: 1}, {x: 11, y: 9}, {x: 1, y: 9},
        {x: 6, y: 1}, {x: 6, y: 9}, {x: 11, y: 5}
    ];
    
    // Add destructible blocks
    const emptyTiles = [];
    for (let y = 1; y < CONFIG.GRID_HEIGHT - 1; y++) {
        for (let x = 1; x < CONFIG.GRID_WIDTH - 1; x++) {
            // Skip player spawn area
            if (x <= 2 && y <= 2) continue;
            
            // Skip enemy spawn positions
            const isEnemySpawn = enemySpawnPositions.some(pos => pos.x === x && pos.y === y);
            if (isEnemySpawn) continue;
            
            if (originalArena[y][x] === TILE_TYPES.EMPTY) {
                emptyTiles.push({x, y});
            }
        }
    }
    
    const blocksToPlace = Math.floor(emptyTiles.length * CONFIG.DESTRUCTIBLE_BLOCK_PERCENTAGE);
    for (let i = 0; i < blocksToPlace; i++) {
        const randomIndex = Math.floor(Math.random() * emptyTiles.length);
        const tile = emptyTiles.splice(randomIndex, 1)[0];
        originalArena[tile.y][tile.x] = TILE_TYPES.DESTRUCTIBLE;
    }
}

function spawnEnemies() {
    const spawnPositions = [
        {x: 11, y: 1}, {x: 11, y: 9}, {x: 1, y: 9},
        {x: 6, y: 1}, {x: 6, y: 9}, {x: 11, y: 5}
    ];
    
    for (let i = 0; i < CONFIG.ENEMY_COUNT; i++) {
        const pos = spawnPositions[i];
        enemies.push({
            x: pos.x,
            y: pos.y,
            moveTimer: 0,
            direction: Math.floor(Math.random() * 4) // 0=up, 1=right, 2=down, 3=left
        });
    }
}

// ===== INPUT HANDLING =====
function handleKeyDown(e) {
    keys[e.key] = true;
    
    if (gameState === GAME_STATES.START && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        gameState = GAME_STATES.PLAYING;
        resetLevel();
        showMessage('');
        hideInstructions();
    }
    
    if (gameState === GAME_STATES.GAME_OVER && (e.key === 'Enter' || e.key === ' ')) {
        // Full restart from beginning
        score = 0;
        lives = CONFIG.STARTING_LIVES;
        gameState = GAME_STATES.PLAYING;
        resetLevel();
        updateUI();
        showMessage('');
        hideInstructions();
    }
    
    if (gameState === GAME_STATES.LEVEL_COMPLETE && (e.key === 'Enter' || e.key === ' ')) {
        // Continue to next level (keeping score and lives)
        gameState = GAME_STATES.PLAYING;
        resetLevel();
        updateUI();
        showMessage('');
    }
    
    e.preventDefault();
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

// ===== UPDATE LOGIC =====
function update() {
    if (gameState !== GAME_STATES.PLAYING) return;
    
    // Check death pause
    if (deathPauseStart !== null) {
        if (Date.now() - deathPauseStart >= CONFIG.DEATH_PAUSE_DURATION) {
            deathPauseStart = null;
            showMessage('');
            respawnPlayer();
        }
        return; // Skip update during pause
    }
    
    frameCount++;
    
    updatePlayer();
    updateEnemies();
    updateVibes();
    updateExplosions();
    checkCollisions();
}

function updatePlayer() {
    // Check for movement input immediately
    let newX = player.x;
    let newY = player.y;
    let wantsToMove = false;
    
    if (keys['ArrowUp']) { newY--; wantsToMove = true; }
    if (keys['ArrowDown']) { newY++; wantsToMove = true; }
    if (keys['ArrowLeft']) { newX--; wantsToMove = true; }
    if (keys['ArrowRight']) { newX++; wantsToMove = true; }
    
    if (wantsToMove) {
        player.moveTimer++;
        
        if (player.moveTimer >= CONFIG.PLAYER_MOVE_FRAMES) {
            if (canMove(newX, newY, player.x, player.y)) {
                player.x = newX;
                player.y = newY;
                player.moveTimer = 0;
            }
        }
    } else {
        // Reset timer when not moving for more responsive input
        player.moveTimer = CONFIG.PLAYER_MOVE_FRAMES;
    }
    
    // Place vibe
    if (keys[' '] && player.canPlaceVibe && vibes.length < CONFIG.MAX_VIBES) {
        vibes.push({
            x: player.x,
            y: player.y,
            timer: Date.now(),
            playerCanEnter: true
        });
        player.canPlaceVibe = false;
    }
    
    if (!keys[' ']) {
        player.canPlaceVibe = true;
    }
}

function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.moveTimer++;
        
        if (enemy.moveTimer >= CONFIG.ENEMY_MOVE_FRAMES) {
            // Random direction change
            if (Math.random() < 0.1) {
                enemy.direction = Math.floor(Math.random() * 4);
            }
            
            let newX = enemy.x;
            let newY = enemy.y;
            
            switch(enemy.direction) {
                case 0: newY--; break;
                case 1: newX++; break;
                case 2: newY++; break;
                case 3: newX--; break;
            }
            
            if (canMove(newX, newY, enemy.x, enemy.y)) {
                enemy.x = newX;
                enemy.y = newY;
                enemy.moveTimer = 0;
            } else {
                enemy.direction = Math.floor(Math.random() * 4);
            }
        }
    });
}

function canMove(newX, newY, oldX, oldY) {
    if (newX < 0 || newX >= CONFIG.GRID_WIDTH || newY < 0 || newY >= CONFIG.GRID_HEIGHT) {
        return false;
    }
    
    if (arena[newY][newX] !== TILE_TYPES.EMPTY) {
        return false;
    }
    
    // Check vibes
    for (let vibe of vibes) {
        if (vibe.x === newX && vibe.y === newY) {
            if (vibe.playerCanEnter && oldX === vibe.x && oldY === vibe.y) {
                continue;
            }
            return false;
        }
    }
    
    // Check explosions
    for (let explosion of explosions) {
        if (explosion.x === newX && explosion.y === newY) {
            return false;
        }
    }
    
    return true;
}

function updateVibes() {
    const now = Date.now();
    
    for (let i = vibes.length - 1; i >= 0; i--) {
        const vibe = vibes[i];
        
        // Check if player left the vibe tile
        if (vibe.playerCanEnter && (player.x !== vibe.x || player.y !== vibe.y)) {
            vibe.playerCanEnter = false;
        }
        
        if (now - vibe.timer >= CONFIG.VIBE_TIMER) {
            explodeVibe(vibe);
            vibes.splice(i, 1);
        }
    }
}

function explodeVibe(vibe) {
    const directions = [{x: 0, y: 0}, {x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
    
    directions.forEach(dir => {
        for (let range = 0; range <= CONFIG.VIBE_RANGE; range++) {
            const x = vibe.x + dir.x * range;
            const y = vibe.y + dir.y * range;
            
            if (x < 0 || x >= CONFIG.GRID_WIDTH || y < 0 || y >= CONFIG.GRID_HEIGHT) break;
            if (arena[y][x] === TILE_TYPES.INDESTRUCTIBLE) break;
            
            explosions.push({
                x: x,
                y: y,
                timer: Date.now()
            });
            
            if (arena[y][x] === TILE_TYPES.DESTRUCTIBLE) {
                arena[y][x] = TILE_TYPES.EMPTY;
                score += CONFIG.SCORE.BRICK;
                updateUI();
                break;
            }
        }
    });
}

function updateExplosions() {
    const now = Date.now();
    explosions = explosions.filter(exp => now - exp.timer < CONFIG.EXPLOSION_DURATION);
}

function checkCollisions() {
    // Player vs enemies
    for (let enemy of enemies) {
        if (player.x === enemy.x && player.y === enemy.y) {
            playerDie();
            return;
        }
    }
    
    // Player vs explosions
    for (let explosion of explosions) {
        if (player.x === explosion.x && player.y === explosion.y) {
            playerDie();
            return;
        }
    }
    
    // Enemies vs explosions
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        for (let explosion of explosions) {
            if (enemy.x === explosion.x && enemy.y === explosion.y) {
                enemies.splice(i, 1);
                score += CONFIG.SCORE.ENEMY;
                updateUI();
                break;
            }
        }
    }
    
    // Check level complete
    if (enemies.length === 0) {
        levelComplete();
    }
}

function startDeathPause() {
    deathPauseStart = Date.now();
    showMessage(''); // Clear bottom message
}

function playerDie() {
    lives = Math.max(0, lives - 1);
    updateUI();
    
    // Always start death pause to show "ouch" animation
    startDeathPause();
    
    if (lives === 0) {
        // Delay game over message until after death animation
        setTimeout(() => {
            gameState = GAME_STATES.GAME_OVER;
            showMessage('game over!<br>press space or enter to restart');
        }, CONFIG.DEATH_PAUSE_DURATION);
    }
}

function levelComplete() {
    score += CONFIG.SCORE.LEVEL_COMPLETE;
    updateUI();
    gameState = GAME_STATES.LEVEL_COMPLETE;
    showMessage('level complete!<br>press space or enter to continue');
}

// ===== RENDERING =====
function render() {
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    renderArena();
    renderVibes();
    renderExplosions();
    
    // Show sprites even before game starts
    if (gameState === GAME_STATES.START) {
        // Render player at starting position
        ctx.drawImage(playerImage, 1 * CONFIG.TILE_SIZE, 1 * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        
        // Render enemies at their spawn positions
        const spawnPositions = [
            {x: 11, y: 1}, {x: 11, y: 9}, {x: 1, y: 9},
            {x: 6, y: 1}, {x: 6, y: 9}, {x: 11, y: 5}
        ];
        spawnPositions.forEach(pos => {
            ctx.drawImage(enemyImage, pos.x * CONFIG.TILE_SIZE, pos.y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        });
    } else {
        renderPlayer();
        renderEnemies();
    }
    
    // Render death message on canvas during death pause
    if (deathPauseStart !== null) {
        renderDeathMessage();
    }
}

function renderArena() {
    for (let y = 0; y < CONFIG.GRID_HEIGHT; y++) {
        for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
            const tile = arena[y][x];
            
            if (tile === TILE_TYPES.INDESTRUCTIBLE) {
                ctx.fillStyle = COLORS.INDESTRUCTIBLE;
                ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            } else if (tile === TILE_TYPES.DESTRUCTIBLE) {
                ctx.fillStyle = COLORS.DESTRUCTIBLE;
                ctx.fillRect(x * CONFIG.TILE_SIZE, y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
            }
        }
    }
}

function renderPlayer() {
    if (!player) return;
    ctx.drawImage(playerImage, player.x * CONFIG.TILE_SIZE, player.y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
}

function renderEnemies() {
    enemies.forEach(enemy => {
        // Remove green background by drawing with transparency
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(enemyImage, enemy.x * CONFIG.TILE_SIZE, enemy.y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        ctx.restore();
    });
}

function renderVibes() {
    const now = Date.now();
    const vibeTexts = ['✨VIBE✨', '~vibe~', '*VIBE*', '≈vibe≈'];
    
    vibes.forEach(vibe => {
        const elapsed = now - vibe.timer;
        const secondsLeft = Math.ceil((CONFIG.VIBE_TIMER - elapsed) / 1000);
        const textIndex = Math.floor(elapsed / 250) % vibeTexts.length;
        
        ctx.fillStyle = COLORS.VIBE_TEXT;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const x = vibe.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        const y = vibe.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
        
        ctx.fillText(vibeTexts[textIndex], x, y - 5);
        ctx.fillText(secondsLeft.toString(), x, y + 8);
    });
}

function renderExplosions() {
    ctx.fillStyle = COLORS.EXPLOSION;
    explosions.forEach(exp => {
        ctx.fillRect(exp.x * CONFIG.TILE_SIZE, exp.y * CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        
        // Add glow effect
        ctx.fillStyle = 'rgba(121, 14, 203, 0.5)';
        ctx.fillRect(exp.x * CONFIG.TILE_SIZE - 2, exp.y * CONFIG.TILE_SIZE - 2, CONFIG.TILE_SIZE + 4, CONFIG.TILE_SIZE + 4);
        ctx.fillStyle = COLORS.EXPLOSION;
    });
}

// ===== UI =====
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    document.getElementById('enemies').textContent = gameState === GAME_STATES.START ? CONFIG.ENEMY_COUNT : enemies.length;
}

function showMessage(msg) {
    document.getElementById('message').innerHTML = msg;
}

function hideInstructions() {
    const instructions = document.querySelector('.instructions');
    if (instructions) {
        instructions.style.visibility = 'hidden';
    }
}

function renderDeathMessage() {
    if (deathPauseStart === null) return;
    
    const deathTexts = ['💀 ouch! 💀', '~ouch~', '*OUCH*', '≈ouch≈'];
    const elapsed = Date.now() - deathPauseStart;
    const textIndex = Math.floor(elapsed / 250) % deathTexts.length;
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const x = player.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    const y = player.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2;
    
    ctx.fillText(deathTexts[textIndex], x, y);
}

// ===== GAME LOOP =====
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
init();
