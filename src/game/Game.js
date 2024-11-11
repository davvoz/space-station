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
import { BossEnemy } from '../objects/BossEnemy.js';
import { FloatingText } from '../objects/FloatingText.js';
import { Wave } from '../objects/Wave.js';
import { GameOverPopup } from '../ui/components/GameOverPopup.js';
import { SoundManager } from './managers/SoundManager.js'; 

class Game {
    constructor() {
        this.initializeCanvas();
        this.state = new GameState();
        this.renderer = new GameRenderer(this.ctx, this.width, this.height);
        this.station = new SpaceStation(this.width / 2, this.height / 2);
        this.upgradeManager = new GameUpgradeManager(this.station);
        this.soundManager = new SoundManager();

        this.enemies = [];
        this.projectiles = [];
        this.explosions = [];
        this.enemyProjectiles = [];
        this.floatingTexts = [];  // Add this line

        this.setupEventListeners();
        // Initialize key tracking
        window.keysPressed = {};
        this.startGameLoop();
        
        // Replace enemy spawn interval with wave system
        this.currentWave = null;
        this.waveNumber = 0;
        this.waveCooldown = 5000; // 5 seconds between waves
        this.waveTimer = 0;
        this.startNextWave();
        
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
        window.game = this; // Make game instance globally available
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

    handleSoundError(error) {
        console.warn('Error loading sound:', error);
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


        const currentTime = Date.now();
        if (currentTime - this.lastShot < 1000 / this.station.fireRate) return;

        this.lastShot = currentTime;
        this.soundManager.play('shoot');

        const targetX = event.clientX - rect.left;
        const targetY = event.clientY - rect.top;

        this.fireProjectiles(targetX, targetY);
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

        if (event.code === 'Space') {
            const explosions = this.station.activateAbility('nova');
            if (explosions) {
                this.handleAbilityEffects(explosions);
                this.floatingTexts.push(new FloatingText(
                    this.station.x,
                    this.station.y,
                    "NOVA BLAST!",
                    'super'
                ));
            }
        }
        if (event.key === 'Control') {
            const explosions = this.station.activateAbility('vortex');
            if (explosions) {
                this.handleAbilityEffects(explosions);
                this.floatingTexts.push(new FloatingText(
                    this.station.x,
                    this.station.y,
                    "GRAVITY VORTEX!",
                    'super'
                ));
            }
        }

        Object.entries(this.upgradeManager.upgrades).forEach(([name, upgrade]) => {
            if (event.key === upgrade.key) {
                const currentCost = this.upgradeManager.getUpgradeCost(name);
                if (this.state.credits >= currentCost) {
                    if (this.upgradeManager.applyUpgrade(name)) {
                        this.state.credits -= currentCost;
                        this.soundManager.play('coinSpend');
                    }
                }
            }
        });
    }

    startGameLoop() {
        this.lastTime = performance.now();
        window.requestAnimationFrame(this.gameLoop.bind(this));
        this.soundManager.playBackgroundMusic();
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
        
        this.state.difficultyScaling = Math.min(3.0, 0.5 + (this.state.gameTime / 120000));
        
        this.state.enemySpawnCooldown = Math.max(200, 2000 - (this.state.gameTime / 1000)); // Faster spawn rate over time
        
        this.state.maxEnemies = Math.min(50, 12 + Math.floor(this.state.gameTime / 30000)); // Increase max enemies over time

        this.enemies.forEach(enemy => {
            if (enemy instanceof ShooterEnemy) {
                const projectile = enemy.update(this.station, this.width, this.height);
                if (projectile) this.enemyProjectiles.push(projectile);
            } else {
                enemy.update(this.station, this.width, this.height);
            }
        });
        
        this.enemyProjectiles.forEach(projectile => projectile.update());
        
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

        this.state.powerupTimer += deltaTime;
        if (this.state.powerupTimer >= this.state.powerupInterval) {
            this.state.powerupTimer = 0;
            this.spawnPowerUp();
        }

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

        if (this.currentWave) {
            if (this.currentWave.isComplete) {
                this.waveTimer += deltaTime;
                if (this.waveTimer >= this.waveCooldown) {
                    this.startNextWave();
                }
            } else if (this.currentWave.canSpawnEnemy(Date.now())) {
                const enemyData = this.currentWave.getNextEnemy();
                if (enemyData) {
                    this.spawnWaveEnemy(enemyData);
                    console.log(`Spawned ${enemyData.type} enemy`); // Debug log
                }
            }
        }

        // Add wave completion effects
        if (this.currentWave && this.currentWave.isComplete && !this.currentWave.rewardGiven) {
            this.handleWaveCompletion();
            this.currentWave.rewardGiven = true;
        }
    }

    handleWaveCompletion() {
        // Give wave completion rewards
        const waveReward = Math.floor(100 * Math.pow(1.1, this.waveNumber));
        this.state.credits += waveReward;
        
        // Add visual effects
        this.floatingTexts.push(new FloatingText(
            this.width / 2,
            this.height / 2 - 50,
            `Wave ${this.waveNumber} Complete!`,
            'wave-complete'
        ));
        
        this.floatingTexts.push(new FloatingText(
            this.width / 2,
            this.height / 2,
            `+${waveReward} 💰`,
            'reward'
        ));

        // Add celebration explosions
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const angle = (i / 8) * Math.PI * 2;
                const distance = 100;
                const x = this.width/2 + Math.cos(angle) * distance;
                const y = this.height/2 + Math.sin(angle) * distance;
                this.explosions.push(new Explosion(x, y, '#FFD700', 2));
            }, i * 200);
        }

        // Play celebration sound
        this.soundManager.play('combo');
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
        const currentTime = performance.now();
        this.station.update(currentTime);
        this.projectiles.forEach(projectile => projectile.update());
        
        // Pass canvas dimensions to enemy updates
        this.enemies.forEach(enemy => {
            if (enemy instanceof ShooterEnemy) {
                const projectile = enemy.update(this.station, this.width, this.height);
                if (projectile) this.enemyProjectiles.push(projectile);
            } else {
                enemy.update(this.station, this.width, this.height);
            }
        });
        
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
                    // Enemy dies immediately when hitting invincible station
                    this.handleEnemyDeath(enemy, true);
                    return false;
                }
                
                // Calcola il danno in base alla wave
                const waveDamage = Math.min(25, 10 + this.waveNumber * 2);
                
                // Applica il danno
                const damageTaken = this.station.takeDamage(waveDamage);
                
                if (damageTaken) {
                    // Ruba crediti
                    const stolenCredits = Math.min(
                        this.state.credits,
                        Math.floor(20 * Math.sqrt(this.waveNumber))
                    );
                    
                    if (stolenCredits > 0) {
                        this.state.credits -= stolenCredits;
                        this.floatingTexts.push(new FloatingText(
                            this.station.x,
                            this.station.y - 40,
                            `-${stolenCredits}💰 stolen`,
                            'stolen'
                        ));
                    }

                    this.floatingTexts.push(new FloatingText(
                        this.station.x,
                        this.station.y - 20,
                        `-${waveDamage}❤️ damage`,
                        'damage'
                    ));
                    
                    this.soundManager.play('fail');
                    
                    // Enemy dies after dealing damage
                    this.handleEnemyDeath(enemy, true);
                    return false; // Remove the enemy
                }
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
        // Calculate rewards
        const rewardMultiplier = isCollision ? 0.5 : 1;
        const creditReward = Math.round(enemy.value * rewardMultiplier);
        const scoreReward = Math.round(enemy.scoreValue * rewardMultiplier);

        // Add visual effects
        this.explosions.push(new Explosion(enemy.x, enemy.y, enemy.color));
        
        // Add floating score text
        this.floatingTexts.push(new FloatingText(
            enemy.x,
            enemy.y - 20,
            `+${creditReward}💰`,
            isCollision ? 'collision' : 'reward'
        ));

        // Update game state
        this.state.credits += creditReward;
        this.state.score += scoreReward;
        this.state.enemiesKilled++;

        // Play sound effects
        this.soundManager.play('explosion');
        this.soundManager.play('coinEarn');

        // Update wave tracking if needed
        if (this.currentWave) {
            this.currentWave.onEnemyDefeated();
        }
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
            this.soundManager.play('combo');
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
        this.soundManager.play('fail'); // Add this line at the start of handleGameOver
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
        
        this.soundManager.stopBackgroundMusic();
    }

    showGameOverPopup() {
        this.paused = true;
        const gameStats = {
            score: this.state.score,
            time: this.formatTime(this.state.gameTime),
            enemiesKilled: this.state.enemiesKilled,
            credits: this.state.credits,
            difficulty: this.state.difficultyScaling.toFixed(1)
        };

        new GameOverPopup(gameStats, () => {
            this.paused = false;
            this.resetGame();
        });
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
        
        // Add debugging for floating texts
        this.floatingTexts.forEach((text, index) => {
            if (!text || typeof text.draw !== 'function') {
                console.error('Invalid floating text at index', index, ':', text);
            } else {
                text.draw(this.ctx);
            }
        });

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
        const info = powerup.powerupInfo;
        
        this.station.addPowerUp(
            powerup.type,
            info.effect,
            info.duration,
            info.color,
            info.icon,
            info.remove
        );
        
        // Visual effects
        this.explosions.push(new Explosion(powerup.x, powerup.y, info.color));
        
        // Sound effects
        this.soundManager.play('coinEarn');
        
        // Update score
        this.state.score += 500;
        
        // Floating text
        this.floatingTexts.push(new FloatingText(
            powerup.x,
            powerup.y - 20,
            powerup.type.toUpperCase(),
            'powerup'
        ));
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
        this.soundManager.play('bossMusic');
    }

    startNextWave() {
        this.waveNumber++;
        this.currentWave = new Wave(this.waveNumber);
        this.waveTimer = 0;
        
        // Show wave announcement
        this.floatingTexts.push(new FloatingText(
            this.width / 2,
            this.height / 2,
            `Wave ${this.waveNumber}`,
            'wave'
        ));
    }

    spawnWaveEnemy(enemyData) {
        const spawnPoint = this.getRandomSpawnPoint();
        let enemy;

        // Create the appropriate enemy type
        switch(enemyData.type) {
            case 'speedy':
                enemy = new SpeedyEnemy(spawnPoint.x, spawnPoint.y, this.waveNumber);
                break;
            case 'shooter':
                enemy = new ShooterEnemy(spawnPoint.x, spawnPoint.y, this.waveNumber, this.entityManager);
                break;
            case 'boss':
                enemy = new BossEnemy(spawnPoint.x, spawnPoint.y);
                break;
            default: // basic enemy
                enemy = new Enemy(spawnPoint.x, spawnPoint.y, this.waveNumber);
        }

        // Apply wave-specific stats
        enemy.health = enemyData.stats.health;
        enemy.maxHealth = enemyData.stats.health;
        enemy.damage = enemyData.stats.damage;
        enemy.speed = enemyData.stats.speed;
        enemy.value = enemyData.stats.value;

        this.enemies.push(enemy);
    }

    handleAbilityEffects(explosions) {
        explosions.forEach(exp => {
            setTimeout(() => {
                this.explosions.push(new Explosion(exp.x, exp.y, exp.color, 2));
                
                // Apply effects to enemies
                this.enemies.forEach(enemy => {
                    const dx = enemy.x - exp.x;
                    const dy = enemy.y - exp.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                        enemy.health -= exp.damage * (1 - distance / 150);
                        
                        if (exp.pullForce) {
                            const angle = Math.atan2(this.station.y - enemy.y, this.station.x - enemy.x);
                            enemy.x += Math.cos(angle) * exp.pullForce;
                            enemy.y += Math.sin(angle) * exp.pullForce;
                        }
                    }
                });
            }, exp.delay);
        });
    }
}
window.onload = () => new Game();

