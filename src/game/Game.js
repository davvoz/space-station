import { GAME_CONFIG } from '../config/GameConfig.js';
import { GameState } from './GameState.js';
import { GameRenderer } from './GameRenderer.js';
import { SpaceStation } from '../objects/SpaceStation.js';
import { Projectile } from '../objects/Projectile.js';
import { Enemy} from '../objects/Enemy.js';
import { ShooterEnemy } from '../objects/ShooterEnemy.js';
import { SpeedyEnemy } from '../objects/SpeedyEnemy.js';
import { Explosion } from '../objects/Explosion.js';
import { GameUpgradeManager } from './GameUpgradeManager.js';
import { PowerUp } from '../objects/PowerUp.js';
import { BossEnemy } from '../objects/BossEnemy.js'; // Add this import
import { FloatingText } from '../objects/FloatingText.js';

class Game {
    constructor() {
        this.initializeCanvas();
        this.state = new GameState();
        this.renderer = new GameRenderer(this.ctx, this.width, this.height);
        this.station = new SpaceStation(this.width / 2, this.height / 2);
        this.upgradeManager = new GameUpgradeManager(this.station);

        this.enemies = [];
        this.projectiles = [];
        this.explosions = [];
        this.sounds = this.initializeSounds();
        this.enemyProjectiles = [];
        this.floatingTexts = [];  // Add this line

        this.setupEventListeners();
        // Initialize key tracking
        window.keysPressed = {};
        this.startGameLoop();
        
        // Add enemy spawning interval
        this.enemySpawnInterval = setInterval(() => this.spawnEnemy(), 1000);
        
        this.comboCounter = 0; // Add combo counter
        this.comboTimer = 0; // Add combo timer
        this.bossSpawned = false; // Track if boss is spawned

        // Create an entityManager object
        this.entityManager = {
            enemies: this.enemies,
            projectiles: this.projectiles,
            enemyProjectiles: this.enemyProjectiles,
            station: this.station
        };

        this.paused = false; // Add pause state
    }

    initializeCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to window size
        const updateCanvasSize = () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            
            // Update station position when resize
            if (this.station) {
                this.station.x = this.width / 2;
                this.station.y = this.height / 2;
            }
        };
        
        // Initial size
        updateCanvasSize();
        
        // Update on resize
        window.addEventListener('resize', updateCanvasSize);
    }

    initializeSounds() {
        const sounds = {
            shoot: document.getElementById('shootSound'),
            explosion: document.getElementById('explosionSound'),
            coinEarn: document.getElementById('coinEarnSound'),
            coinSpend: document.getElementById('coinSpendSound'),
            combo: document.getElementById('comboSound'), // Add combo sound
            bossMusic: document.getElementById('bossMusic'), // Add boss music
            background: document.getElementById('background'), // Aggiungi background music qui
            fail: document.getElementById('failSound')
        };

        Object.values(sounds).forEach(sound => {
            if (sound) {
                sound.volume = GAME_CONFIG.SOUND_VOLUME;
                if (sound.id === 'background') {
                    sound.volume = 0.3; // Volume specifico per la musica di background
                    sound.loop = true;
                }
                sound.addEventListener('error', this.handleSoundError);
                sound.addEventListener('loadeddata', () => {
                    console.log(`Sound ${sound.id} loaded successfully`);
                });
            }
        });

        return sounds;
    }

    handleSoundError(error) {
        console.warn('Error loading sound:', error);
        // Aggiungere fallback per il suono
        return null;
    }

    setupEventListeners() {
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Add key event listeners
        window.addEventListener('keydown', (e) => {
            window.keysPressed[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            window.keysPressed[e.code] = false;
        });
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        // Check if click is on ability buttons
        if (this.isClickOnAbilityButtons(clickX, clickY)) {
            return; // Don't process as normal shot if clicking abilities
        }

        const currentTime = Date.now();
        if (currentTime - this.lastShot < 1000 / this.station.fireRate) return;

        this.lastShot = currentTime;
        this.playSound('shoot');

        const targetX = event.clientX - rect.left;
        const targetY = event.clientY - rect.top;

        this.fireProjectiles(targetX, targetY);
    }

    isClickOnAbilityButtons(x, y) {
        const buttonSize = 80;
        const buttonSpacing = 20;
        const upgradesHeight = Object.keys(this.upgradeManager.upgrades).length * 25 + 20;
        const startY = 20 + upgradesHeight + buttonSpacing;
        const startX = this.width - 170; // Adjust based on your layout

        // Check Auto-Fire button
        if (this.isPointInButton(x, y, startX, startY, buttonSize)) {
            this.activateAutoFire();
            return true;
        }

        // Check Super Nova button
        if (this.isPointInButton(x, y, startX + buttonSize + buttonSpacing, startY, buttonSize)) {
            this.activateSuperAbility();
            return true;
        }

        return false;
    }

    isPointInButton(x, y, buttonX, buttonY, buttonSize) {
        return x >= buttonX && x <= buttonX + buttonSize &&
               y >= buttonY && y <= buttonY + buttonSize;
    }

    fireProjectiles(targetX, targetY) {
        for (let i = 0; i < this.station.turrets; i++) {
            const angle = (i / this.station.turrets) * Math.PI * 2 + this.station.turretAngle;
            const startX = this.station.x + Math.cos(angle) * this.station.radius;
            const startY = this.station.y + Math.sin(angle) * this.station.radius;

            this.projectiles.push(new Projectile(
                startX, startY, targetX, targetY,
                this.station.projectileSpeed,
                this.station.projectileDamage
            ));
        }
    }

    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        this.station.turretAngle = Math.atan2(mouseY - this.station.y, mouseX - this.station.x);
    }

    handleKeyDown(event) {
        // Add ability key bindings
        if (event.code === 'Space') {
            this.activateAutoFire();
        }
        if (event.code === 'KeyQ') {
            this.activateSuperAbility();
        }

        // Add number key handlers for abilities
        if (event.key === '7') {
            this.activateAutoFire();
        }
        if (event.key === '8') {
            this.activateSuperAbility();
        }

        Object.entries(this.upgradeManager.upgrades).forEach(([name, upgrade]) => {
            if (event.key === upgrade.key && this.state.credits >= upgrade.cost) {
                // Verifichiamo che l'upgrade sia stato applicato correttamente
                if (this.upgradeManager.applyUpgrade(name)) {
                    this.state.credits -= upgrade.cost;
                    this.playSound('coinSpend');
                }
            }
        });
    }

    activateAutoFire() {
        if (!this.station.autoFireActive && this.state.credits >= 100) {
            if (this.station.activateAutoFire(15000)) {
                this.state.credits -= 100;
                this.playSound('powerup');
                
                this.floatingTexts.push(new FloatingText(
                    this.station.x,
                    this.station.y,
                    "Auto-Fire Activated!",
                    'special'
                ));
            }
        }
    }

    activateSuperAbility() {
        if (this.station.superAbilityCharge >= this.station.superAbilityMaxCharge) {
            const explosions = this.station.activateSuperAbility();
            if (explosions) {
                explosions.forEach(exp => {
                    setTimeout(() => {
                        this.explosions.push(new Explosion(exp.x, exp.y, '#44AAFF', 2));
                        
                        // Damage nearby enemies
                        this.enemies.forEach(enemy => {
                            const dx = enemy.x - exp.x;
                            const dy = enemy.y - exp.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance < 100) {
                                enemy.health -= 50 * (1 - distance / 100);
                            }
                        });
                    }, exp.delay);
                });
                
                this.playSound('superAbility');
                
                // Add visual effect
                this.floatingTexts.push(new FloatingText(
                    this.station.x,
                    this.station.y,
                    "SUPER NOVA!",
                    'super'
                ));
            }
        }
    }

    startGameLoop() {
        this.lastTime = performance.now();
        window.requestAnimationFrame(this.gameLoop.bind(this));
        this.playBackgroundMusic();
    }

    gameLoop(timestamp) {
        if (this.paused) {
            // Only redraw while paused, don't update game state
            this.draw();
            window.requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }

        const deltaTime = Math.min(timestamp - this.lastTime, GAME_CONFIG.MAX_DELTA_TIME);
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        this.state.gameTime += deltaTime;
        this.updateGameState(deltaTime);
        this.updateGameObjects();
        this.checkCollisions();
        this.cleanupObjects();
        
        // Update difficulty scaling - modificato per una progressione più graduale
        this.state.difficultyScaling = Math.min(3.0, 0.5 + (this.state.gameTime / 120000));
        
        // Update spawn rate - reso più graduale
        this.state.enemySpawnCooldown = Math.max(200, 2000 - (this.state.gameTime / 1000)); // Faster spawn rate over time
        
        // Aumenta gradualmente il numero massimo di nemici
        this.state.maxEnemies = Math.min(50, 12 + Math.floor(this.state.gameTime / 30000)); // Increase max enemies over time

        // Update and handle enemy projectiles
        this.enemies.forEach(enemy => {
            if (enemy instanceof ShooterEnemy) {
                const projectile = enemy.update(this.station, this.width, this.height);
                if (projectile) this.enemyProjectiles.push(projectile);
            } else {
                enemy.update(this.station, this.width, this.height);
            }
        });
        
        this.enemyProjectiles.forEach(projectile => projectile.update());
        
        // Check enemy projectile collisions
        this.enemyProjectiles = this.enemyProjectiles.filter(projectile => {
            if (projectile.collidesWith(this.station) && this.state.invulnerableTime <= 0) {
                if (this.station.shield > 0) {
                    this.station.shield = Math.max(0, this.station.shield - projectile.damage);
                } else {
                    this.station.health -= projectile.damage;
                }
                return false;
            }
            return this.isProjectileOnScreen(projectile);
        });

        // Spawn powerups
        this.state.powerupTimer += deltaTime;
        if (this.state.powerupTimer >= this.state.powerupInterval) {
            this.state.powerupTimer = 0;
            this.spawnPowerUp();
        }

        // Update and check powerup collisions
        this.state.activePowerups.forEach(powerup => powerup.update());
        this.state.activePowerups = this.state.activePowerups.filter(powerup => {
            if (powerup.collidesWith(this.station)) {
                this.handlePowerUpCollection(powerup);
                return false;
            }
            return true;
        });
        
        this.updateComboSystem(deltaTime); // Update combo system
        this.checkBossSpawn(); // Check if boss should spawn

        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.station, this.width, this.height);
        });

        // Update enemy projectiles
        this.enemyProjectiles = this.enemyProjectiles.filter(projectile => {
            projectile.update();
            return this.isProjectileOnScreen(projectile);
        });

        // Update floating texts
        this.floatingTexts = this.floatingTexts.filter(text => text.update());
    }

    updateGameState(deltaTime) {
        if (this.state.invulnerableTime > 0) {
            this.state.invulnerableTime = Math.max(0, this.state.invulnerableTime - deltaTime);
        }

        if (this.state.gameTime % GAME_CONFIG.SHIELD_DECREASE_INTERVAL < deltaTime) {
            this.station.shield = Math.max(0, this.station.shield - GAME_CONFIG.SHIELD_DECREASE_AMOUNT);
        }
    }

    updateGameObjects() {
        const currentTime = performance.now(); // Use performance.now() instead of Date.now()
        this.station.update(currentTime);
        this.projectiles.forEach(projectile => projectile.update());
        this.enemies.forEach(enemy => enemy.update(this.station, this.width, this.height));
        this.explosions.forEach(explosion => explosion.update());
    }

    checkCollisions() {
        this.checkEnemyCollisions();
        this.checkProjectileCollisions();
    }

    checkEnemyCollisions() {
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.collidesWith(this.station)) {
                if (this.station.invincible) {
                    // Enemy takes damage and bounces off
                    enemy.health -= 50;
                    const dx = enemy.x - this.station.x;
                    const dy = enemy.y - this.station.y;
                    const angle = Math.atan2(dy, dx);
                    enemy.dx = Math.cos(angle) * enemy.speed * 2;
                    enemy.dy = Math.sin(angle) * enemy.speed * 2;
                    
                    if (enemy.health <= 0) {
                        // Use reduced rewards for collision kills
                        this.handleEnemyDeath(enemy, true);
                        return false;
                    }
                    return true;
                }
                
                const damageTaken = this.station.takeDamage(enemy.damage);
                if (damageTaken) {
                    // Use reduced rewards for collision kills
                    this.handleEnemyDeath(enemy, true);
                }
                return false;
            }
            return true;
        });
    }

    checkProjectileCollisions() {
        this.projectiles = this.projectiles.filter(projectile => {
            let hit = false;
            
            // Check collisions with enemies
            this.enemies = this.enemies.filter(enemy => {
                if (!hit && projectile.collidesWith(enemy)) {
                    hit = true;
                    this.handleProjectileHit(enemy);
                    return enemy.health > 0;
                }
                return true;
            });

            // Remove projectile if it hit something
            return !hit;
        });
    }

    handleEnemyDeath(enemy, isCollision = false) {
        // Reduce rewards by 50% for collision kills
        const rewardMultiplier = isCollision ? 0.5 : 1;
        const creditReward = Math.round(enemy.value * rewardMultiplier);
        const scoreReward = Math.round(enemy.scoreValue * rewardMultiplier);

        // Add floating reward text
        this.floatingTexts.push(new FloatingText(
            enemy.x,
            enemy.y - 20, 
            `+${creditReward}💰`,
            isCollision ? 'collision' : 'reward'
        ));

        // Add explosion
        this.explosions.push(new Explosion(enemy.x, enemy.y, enemy.color));
        
        // Add rounded points and credits
        this.state.credits += creditReward;
        this.state.score += scoreReward;
        this.state.enemiesKilled++; // Increment kill count for ALL enemy deaths
        
        // Play sound effects
        this.playSound('explosion');
        this.playSound('coinEarn');
    }

    handleProjectileHit(enemy) {
        // Add floating damage text with rounded damage
        const damageDealt = Math.round(this.station.projectileDamage);
        this.floatingTexts.push(new FloatingText(
            enemy.x,
            enemy.y, 
            damageDealt.toString(),
            'damage'
        ));

        enemy.health -= damageDealt;
        if (enemy.health <= 0) {
            // Normal rewards for projectile kills
            this.handleEnemyDeath(enemy, false);
        }
        
        this.comboCounter++;
        this.comboTimer = 0;
        if (this.comboCounter % GAME_CONFIG.COMBO_THRESHOLD === 0) {
            this.playSound('combo');
            this.state.score += GAME_CONFIG.COMBO_BONUS;
        }
    }

    cleanupObjects() {
        this.projectiles = this.projectiles.filter(this.isProjectileOnScreen.bind(this));
        this.explosions = this.explosions.filter(explosion => !explosion.isDead());

        if (this.station.health <= 0 && this.state.invulnerableTime <= 0) {
            this.handleGameOver();
        }
    }

    isProjectileOnScreen(projectile) {
        return projectile.x > 0 && projectile.x < this.width &&
            projectile.y > 0 && projectile.y < this.height;
    }

    handleGameOver() {
        this.playSound('fail'); // Add this line at the start of handleGameOver
        this.showGameOverPopup(); // Aggiungi questa chiamata
        
        // Sposta la logica di reset in un metodo separato
        this.resetGame();
    }

    resetGame() {
        this.state = new GameState();
        this.station = new SpaceStation(this.width / 2, this.height / 2);
        this.enemies = [];
        this.projectiles = [];
        this.explosions = [];
        this.comboCounter = 0;
        this.comboTimer = 0;
        this.bossSpawned = false;
        
        if (this.sounds.background) {
            this.sounds.background.pause();
            this.sounds.background.currentTime = 0;
        }
    }

    showGameOverPopup() {
        this.paused = true; // Pause the game
        const gameStats = {
            score: this.state.score,
            time: this.formatTime(this.state.gameTime),
            enemiesKilled: this.state.enemiesKilled,
            credits: this.state.credits,
            difficulty: this.state.difficultyScaling.toFixed(1)
        };

        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            z-index: 1000;
            min-width: 300px;
        `;

        // Create stats table
        const statsHtml = `
            <h2 style="color: white; font-size: 2.5em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                Game Over!
            </h2>
            <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <table style="width: 100%; color: white; font-size: 1.2em; text-align: left;">
                    <tr>
                        <td>🎯 Final Score:</td>
                        <td>${gameStats.score}</td>
                    </tr>
                    <tr>
                        <td>⏱️ Survival Time:</td>
                        <td>${gameStats.time}</td>
                    </tr>
                    <tr>
                        <td>💀 Enemies Defeated:</td>
                        <td>${gameStats.enemiesKilled}</td>
                    </tr>
                    <tr>
                        <td>💰 Credits Earned:</td>
                        <td>${gameStats.credits}</td>
                    </tr>
                    <tr>
                        <td>⚡ Final Difficulty:</td>
                        <td>${gameStats.difficulty}x</td>
                    </tr>
                </table>
            </div>
        `;

        popup.innerHTML = statsHtml;

        const retryButton = document.createElement('button');
        retryButton.textContent = 'Play Again';
        retryButton.style.cssText = `
            background: #ffd93d;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.2em;
            cursor: pointer;
            transition: transform 0.2s;
            &:hover {
                transform: scale(1.1);
            }
        `;

        retryButton.addEventListener('click', () => {
            document.body.removeChild(popup);
            this.paused = false; // Unpause before reset
            this.resetGame();
        });

        popup.appendChild(retryButton);
        document.body.appendChild(popup);
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    draw() {
        this.renderer.draw(this);  // Pass the entire game instance
        this.station.draw(this.ctx);
        this.projectiles.forEach(projectile => projectile.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.explosions.forEach(explosion => explosion.draw(this.ctx));
        this.enemyProjectiles.forEach(projectile => projectile.draw(this.ctx));
        this.state.activePowerups.forEach(powerup => powerup.draw(this.ctx));
        
        // Draw floating texts after everything else
        this.floatingTexts.forEach(text => text.draw(this.ctx));

        // Rimuovi il vecchio codice di rendering del testo
        // this.ctx.font = '20px Arial';
        // this.ctx.fillStyle = 'white';
        // this.ctx.fillText('Score: ' + ...);
        // this.ctx.fillText('Credits: ' + ...);

        // Aggiungi questo nuovo codice per il rendering del testo
    }

    playSound(soundName) {
        if (!this.state.muted && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }

    playBackgroundMusic() {
        if (!this.sounds.background) return;
    
        const playPromise = this.sounds.background.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Auto-play was prevented:', error);
                // Aggiungere logica di recovery
                const startAudio = () => {
                    // ...existing code...
                };
            });
        }
    }

    roundRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
    }
    
    spawnEnemy() {
        if (this.enemies.length >= this.state.maxEnemies) return;
        
        const currentTime = Date.now();
        if (currentTime - this.state.lastEnemySpawn < this.state.enemySpawnCooldown) return;
        
        this.state.lastEnemySpawn = currentTime;
        
        const spawnPoint = this.getRandomSpawnPoint();
        const enemyLevel = Math.max(1, Math.floor(this.state.gameTime / 30000));
        
        // Choose enemy type based on game progress and randomness
        const enemyTypes = [Enemy];
        if (this.state.gameTime > 30000) enemyTypes.push(SpeedyEnemy);
        if (this.state.gameTime > 60000) enemyTypes.push(ShooterEnemy);
        
        const EnemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        // Pass entityManager when creating ShooterEnemy
        const enemy = EnemyType === ShooterEnemy 
            ? new EnemyType(spawnPoint.x, spawnPoint.y, enemyLevel, this.entityManager)
            : new EnemyType(spawnPoint.x, spawnPoint.y, enemyLevel);
        
        // Increase enemy strength over time
        enemy.health *= 1 + (this.state.gameTime / 60000);
        enemy.damage *= 1 + (this.state.gameTime / 60000);
        enemy.speed *= 1 + (this.state.gameTime / 60000);
        
        this.enemies.push(enemy);
    }

    getRandomSpawnPoint() {
        const spawnSide = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(spawnSide) {
            case 0: x = Math.random() * this.width; y = -20; break;
            case 1: x = this.width + 20; y = Math.random() * this.height; break;
            case 2: x = Math.random() * this.width; y = this.height + 20; break;
            case 3: x = -20; y = Math.random() * this.height; break;
        }
        
        return { x, y };
    }

    spawnPowerUp() {
        const types = ['speed', 'shield', 'damage', 'multi', 'health', 'invincibility']; // Add new power-ups
        const type = types[Math.floor(Math.random() * types.length)]; // Fix the type variable reference
        // Spawn strategico: più lontano dalla stazione
        let x, y;
        do {
            x = Math.random() * (this.width - 100) + 50;
            y = Math.random() * (this.height - 100) + 50;
        } while (Math.hypot(x - this.station.x, y - this.station.y) < 200);
        
        this.state.activePowerups.push(new PowerUp(x, y, type));
    }

    handlePowerUpCollection(powerup) {
        if (powerup.type === 'invincibility') {
            this.station.applyInvincibility(10000); // 10 seconds
        }
        powerup.apply(this.station);
        
        // Visual effects
        this.explosions.push(new Explosion(powerup.x, powerup.y, powerup.powerupInfo.color));
        
        // Sound effects
        this.playSound('coinEarn');
        
        // Update score
        this.state.score += 500;
    }
    
    updateComboSystem(deltaTime) {
        if (this.comboCounter > 0) {
            this.comboTimer += deltaTime;
            if (this.comboTimer > GAME_CONFIG.COMBO_RESET_TIME) {
                this.comboCounter = 0;
                this.comboTimer = 0;
            }
        }
    }

    checkBossSpawn() {
        if (this.state.gameTime > GAME_CONFIG.BOSS_SPAWN_TIME && !this.bossSpawned) {
            this.spawnBoss();
            this.bossSpawned = true;
        }
    }

    spawnBoss() {
        const boss = new BossEnemy(this.width / 2, -100);
        this.enemies.push(boss);
        this.playSound('bossMusic');
    }
}

window.onload = () => new Game();