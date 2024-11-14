import { GAME_CONFIG } from '../config/GameConfig.js';
import { GameState } from './GameState.js';
import { GameRenderer } from './GameRenderer.js';
import { SpaceStation } from '../objects/SpaceStation.js';
import { Projectile } from '../objects/Projectile.js';
import { Enemy } from '../objects/Enemy.js';
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
import { SpatialGrid } from '../utils/SpatialGrid.js';

export class Game {
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
            station: this.station,
            addEnemyProjectile: (projectile) => {
                console.log('Adding enemy projectile:', projectile);
                this.enemyProjectiles.push(projectile);
            }
        };

        this.paused = false; // Add pause state
        window.game = this; // Make game instance globally available

        this.lastAutoShot = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.autoFireEnabled = false;
        this.setupAutoFireToggle();
        this.setupSettingsButton();

        // Aggiungi la griglia spaziale
        this.spatialGrid = new SpatialGrid(this.width, this.height, 100); // Celle 100x100

        this.targetDelta = 1000 / 60; // Target 60 FPS
        this.maxFrameSkip = 5; // Maximum number of frames to skip
        this.accumulator = 0;

        // Add reward system properties
        this.rewardSystem = {
            comboMultiplier: 1,
            consecutiveKills: 0,
            comboTimer: 0,
            comboTimeout: 2000, // 2 seconds to maintain combo
            waveRewards: {
                energyBonus: {
                    interval: 3, // Changed from 7 to 3 waves
                    multiplier: 1.0,
                    bonusBars: 0 // Track number of bonus bars
                }
            },
            lastKillTime: 0
        };
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

        // Mantieni solo il mousemove per tracciare la posizione del mouse
        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = event.clientX - rect.left;
            this.mouseY = event.clientY - rect.top;
        });

        // Add Enter key handler for auto-fire
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Enter') {
                if (this.station.activateAutoFire(this.waveNumber)) {
                    const toggleBtn = document.getElementById('autoFireToggle');
                    if (toggleBtn) {
                        toggleBtn.classList.add('active');
                    }
                }
            }
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
                this.soundManager.play('nova'); // Add this line to play nova sound
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

        const frameTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Add frame time to accumulator
        this.accumulator += Math.min(frameTime, 250); // Cap at 250ms to prevent spiral of death

        // Update game state in fixed time steps
        let skippedFrames = 0;
        while (this.accumulator >= this.targetDelta && skippedFrames < this.maxFrameSkip) {
            this.update(this.targetDelta);
            this.accumulator -= this.targetDelta;
            skippedFrames++;
        }

        // Draw the game state
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
                // Effetti sonori e visivi per l'impatto
                this.soundManager.play('hit');
                
                // Calcola il danno basato sullo scudo
                const damage = projectile.damage;
                const actualDamage = this.station.shield > 0 ? Math.floor(damage / 2) : damage;

                // Mostra il danno come floating text con indicazione dello shield
                this.floatingTexts.push(new FloatingText(
                    this.station.x,
                    this.station.y - 30,
                    `-${actualDamage} ${this.station.shield > 0 ? '🛡️' : ''}`,
                    'damage'
                ));

                // Attiva l'effetto di danno sulla stazione
                this.station.activateDamageEffect();

                // Applica il danno
                if (this.station.shield > 0) {
                    this.station.shield = Math.max(0, this.station.shield - actualDamage);
                } else {
                    this.station.health -= actualDamage;
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

        // Sostituisci la vecchia logica di auto-fire con questa
        if (this.autoFireEnabled) {
            const currentTime = Date.now();
            if (currentTime - this.lastAutoShot >= 1000 / this.station.fireRate) {
                this.fireProjectiles(this.mouseX, this.mouseY);
                this.soundManager.play('shoot'); // Aggiungi questa linea
                this.lastAutoShot = currentTime;
            }
        }

        // Update station auto-fire
        this.station.updateAutoFire(this.waveNumber);
        this.autoFireEnabled = this.station.autoFireActive;

        // Update auto-fire toggle button
        const toggleBtn = document.getElementById('autoFireToggle');
        if (toggleBtn) {
            toggleBtn.textContent = `Auto Fire: ${this.autoFireEnabled ? 'ON' : 'OFF'}`;
            toggleBtn.classList.toggle('active', this.autoFireEnabled);
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
                const x = this.width / 2 + Math.cos(angle) * distance;
                const y = this.height / 2 + Math.sin(angle) * distance;
                this.explosions.push(new Explosion(x, y, '#FFD700', 2));
            }, i * 200);
        }

        // Play celebration sound
        this.soundManager.play('combo');

        // Check for energy bonus reward every 3 waves
        if (this.waveNumber % this.rewardSystem.waveRewards.energyBonus.interval === 0) {
            const bonusAmount = this.station.baseHealth; // Use baseHealth value
            this.station.maxHealth += bonusAmount;
            this.station.health = this.station.maxHealth; // Fill health when getting new bar
            this.rewardSystem.waveRewards.energyBonus.bonusBars++;
            
            this.floatingTexts.push(new FloatingText(
                this.width / 2,
                this.height / 2 + 50,
                `NEW ENERGY BAR UNLOCKED! +${bonusAmount}!`,
                'upgrade'
             ));
            this.soundManager.play('powerup');
        }
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

        // Aggiorna la griglia con le nuove posizioni
        this.spatialGrid.clear();
        this.enemies.forEach(enemy => this.spatialGrid.insert(enemy));
        this.projectiles.forEach(projectile => this.spatialGrid.insert(projectile));
    }

    checkCollisions() {
        // Check projectiles against enemies
        this.projectiles = this.projectiles.filter(projectile => {
            let hit = false;
            
            this.enemies.forEach(enemy => {
                if (!hit && projectile.collidesWith(enemy)) {
                    hit = true;
                    enemy.health -= this.station.projectileDamage;
                    enemy.createCollisionEffect();
                    this.soundManager.play('explosion');

                    
                    if (enemy.health <= 0) {
                        this.handleEnemyDeath(enemy, false);
                        const enemyIndex = this.enemies.indexOf(enemy);
                        if (enemyIndex > -1) {
                            this.enemies.splice(enemyIndex, 1);
                        }
                    }
                }
            });
            
            return !hit;
        });

        // Keep existing station collision checks
        this.checkEnemyCollisions();
    }

    checkEnemyCollisions() {
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.collidesWith(this.station)) {
                if (this.station.invincible) {
                    this.handleEnemyDeath(enemy, true);
                    return false;
                }

                // Danno base aumentato esponenzialmente con la wave
                const baseDamage = 10;
                const waveDamage = Math.floor(baseDamage * Math.pow(1.2, this.waveNumber));
                const actualDamage = this.station.shield > 0 ? Math.floor(waveDamage / 2) : waveDamage;
                
                // Calcolo crediti rubati con scaling più aggressivo
                const baseSteal = 20;
                const stolenCredits = Math.min(
                    this.state.credits,
                    Math.floor(baseSteal * Math.pow(1.3, this.waveNumber))
                );

                // Applica il danno
                if (this.station.shield > 0) {
                    this.station.shield = Math.max(0, this.station.shield - actualDamage);
                } else {
                    this.station.health -= actualDamage;
                }

                // Sottrai i crediti solo se ne abbiamo
                if (this.state.credits > 0 && stolenCredits > 0) {
                    this.state.credits -= stolenCredits;
                    this.floatingTexts.push(new FloatingText(
                        this.station.x,
                        this.station.y - 60,
                        `-${stolenCredits}💰`,
                        'stolen'
                    ));
                }

                // Mostra il danno con indicazione dello shield
                this.floatingTexts.push(new FloatingText(
                    this.station.x,
                    this.station.y - 30,
                    `-${actualDamage}${this.station.shield > 0 ? '🛡️' : ''}❤️`,
                    'damage'
                ));

                this.soundManager.play('coinSpend2');
                
                this.handleEnemyDeath(enemy, true);
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
        // Se è una collisione, non diamo ricompense ma solo effetti visivi
        if (isCollision) {
            // Solo effetti visivi per la morte
            this.explosions.push(new Explosion(enemy.x, enemy.y, enemy.color));
            this.soundManager.play('explosion');
            // Aggiorna il conteggio dei nemici per la wave
            if (this.currentWave) {
                this.currentWave.onEnemyDefeated();
            }
            return;
        }

        const now = Date.now();
        
        // Update combo system
        if (now - this.rewardSystem.lastKillTime < this.rewardSystem.comboTimeout) {
            this.rewardSystem.consecutiveKills++;
            this.rewardSystem.comboMultiplier = Math.min(5, 1 + Math.floor(this.rewardSystem.consecutiveKills / 5) * 0.5);
            
            if (this.rewardSystem.consecutiveKills % 5 === 0) {
                this.floatingTexts.push(new FloatingText(
                    enemy.x,
                    enemy.y - 40,
                    `COMBO x${this.rewardSystem.comboMultiplier.toFixed(1)}!`,
                    'combo'
                ));
                this.soundManager.play('combo');
            }
        } else {
            this.rewardSystem.consecutiveKills = 1;
            this.rewardSystem.comboMultiplier = 1;
        }
        
        this.rewardSystem.lastKillTime = now;

        // Apply combo multiplier to rewards
        const baseCredit = Math.round(enemy.value);
        const baseScore = Math.round(enemy.scoreValue);
        const creditReward = Math.round(baseCredit * this.rewardSystem.comboMultiplier);
        const scoreReward = Math.round(baseScore * this.rewardSystem.comboMultiplier);

        // Add visual effects
        this.explosions.push(new Explosion(enemy.x, enemy.y, enemy.color));

        // Add floating score text
        this.floatingTexts.push(new FloatingText(
            enemy.x,
            enemy.y - 20,
            `+${creditReward}💰`,
            'reward'
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

        // Add kill count for auto-fire charge
        if (!isCollision) {
            this.station.addKill();
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
        this.soundManager.play('fail');
        this.paused = true;
        
        const gameStats = {
            score: this.state.score,
            time: this.formatTime(this.state.gameTime),
            enemiesKilled: this.state.enemiesKilled,
            credits: this.state.credits,
            wave: this.waveNumber // Add wave number
        };

        // Qui è la correzione: passiamo true come terzo parametro per indicare che è Game Over
        new GameOverPopup(gameStats, () => {
            this.resetGame();
        }, true);  // <-- Aggiunto true per isGameOver
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

        // Draw auto-fire UI
        if (this.station) {
            // Draw kills progress bar
            const barX = this.width - 180;
            const barY = this.height / 2 - 30;
            const barWidth = 150;
            const barHeight = 20;

            // Background
            this.ctx.fillStyle = '#304060';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);

            // Progress
            this.ctx.fillStyle = this.station.autoFireActive ? '#ff4444' : '#44ff44';
            this.ctx.fillRect(barX, barY,
                (this.station.autoFireKills / this.station.autoFireKillsRequired) * barWidth,
                barHeight);

            // Text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(
                `Auto-Fire Kills: ${this.station.autoFireKills}/${this.station.autoFireKillsRequired}`,
                barX + 70, barY - 5);

            // Duration bar when active
            if (this.station.autoFireActive) {
                const durationX = barX;
                const durationY = barY + 30;

                this.ctx.fillStyle = '#304060';
                this.ctx.fillRect(durationX, durationY, barWidth, barHeight);

                this.ctx.fillStyle = '#ff4444';
                this.ctx.fillRect(durationX, durationY,
                    (this.station.autoFireDuration / this.station.autoFireMaxDuration) * barWidth,
                    barHeight);

                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText('Duration', durationX + 70, durationY - 5);
            }
        }

        // Draw combo meter if active
        if (this.rewardSystem.comboMultiplier > 1) {
            const comboBarX = this.width - 180;
            const comboBarY = this.height / 2 + 30; // Position below other bars
            const barWidth = 150;
            const barHeight = 15;

            // Background
            this.ctx.fillStyle = '#304060';
            this.ctx.fillRect(comboBarX, comboBarY, barWidth, barHeight);

            // Combo timer progress
            const comboProgress = Math.max(0, 1 - ((Date.now() - this.rewardSystem.lastKillTime) / this.rewardSystem.comboTimeout));
            this.ctx.fillStyle = `hsl(${120 * comboProgress}, 100%, 50%)`;
            this.ctx.fillRect(comboBarX, comboBarY, barWidth * comboProgress, barHeight);

            // Combo text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(
                `Combo x${this.rewardSystem.comboMultiplier.toFixed(1)}`,
                comboBarX + 70, comboBarY - 5
            );
        }

        // Draw base health bar and bonus health bars
        if (this.station) {
            const barX = this.x - 25;
            const baseBarY = this.y + this.radius + 10;
            const barWidth = 50;
            const barHeight = 6;
            const barSpacing = 4;

            // Draw base health bar (first bar)
            this.drawHealthBar(this.ctx, barX, baseBarY, barWidth, barHeight, 
                Math.min(this.station.health, this.station.baseHealth), 
                this.station.baseHealth);

            // Draw bonus health bars
            let remainingHealth = Math.max(0, this.station.health - this.station.baseHealth);
            
            for (let i = 0; i < Math.floor((this.station.maxHealth - this.station.baseHealth) / this.station.baseHealth); i++) {
                const bonusBarY = baseBarY + (barHeight + barSpacing) * (i + 1);
                const segmentHealth = Math.min(this.station.baseHealth, remainingHealth);
                
                // Solo se c'è salute rimanente per questa barra
                if (segmentHealth > 0) {
                    this.drawHealthBar(
                        this.ctx, 
                        barX, 
                        bonusBarY, 
                        barWidth, 
                        barHeight, 
                        segmentHealth,
                        this.station.baseHealth,
                        `hsl(${120 + i * 30}, 100%, 50%)`
                    );
                } else {
                    // Disegna barra vuota
                    this.drawHealthBar(
                        this.ctx, 
                        barX, 
                        bonusBarY, 
                        barWidth, 
                        barHeight, 
                        0,
                        this.station.baseHealth,
                        `hsl(${120 + i * 30}, 100%, 50%)`
                    );
                }
                
                remainingHealth = Math.max(0, remainingHealth - this.station.baseHealth);
            }
        }

        // Aggiungi dopo il disegno di tutti gli altri elementi
        this.drawSpatialGrid();

        // Assicurati che i proiettili nemici vengano disegnati
        if (this.enemyProjectiles && this.enemyProjectiles.length > 0) {
            this.enemyProjectiles.forEach(projectile => {
                if (projectile && typeof projectile.draw === 'function') {
                    projectile.draw(this.ctx);
                }
            });
        }
    }

    drawSpatialGrid() {
        // Disegna le linee della griglia
        this.ctx.strokeStyle = 'rgba(50, 50, 200, 0.2)';
        this.ctx.lineWidth = 1;

        // Linee verticali
        for (let x = 0; x < this.width; x += this.spatialGrid.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Linee orizzontali
        for (let y = 0; y < this.height; y += this.spatialGrid.cellSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Mostra il numero di entità in ogni cella
        this.ctx.font = '12px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        for (let col = 0; col < this.spatialGrid.cols; col++) {
            for (let row = 0; row < this.spatialGrid.rows; row++) {
                const cellCount = this.spatialGrid.grid[col][row].size;
                if (cellCount > 0) {
                    const x = col * this.spatialGrid.cellSize + 5;
                    const y = row * this.spatialGrid.cellSize + 15;
                    this.ctx.fillText(`${cellCount}`, x, y);
                }
            }
        }
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

        switch (spawnSide) {
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

        // Aggiungi logging per debug
        console.log('Spawning enemy of type:', enemyData.type);
        console.log('EntityManager status:', {
            hasEnemyProjectiles: Array.isArray(this.entityManager.enemyProjectiles),
            projectilesCount: this.enemyProjectiles.length
        });

        switch (enemyData.type) {
            case 'speedy':
                enemy = new SpeedyEnemy(spawnPoint.x, spawnPoint.y, this.waveNumber);
                break;
            case 'shooter':
                // Verifica che l'entityManager sia valido prima di crearlo
                if (!this.entityManager || !Array.isArray(this.entityManager.enemyProjectiles)) {
                    console.error('Invalid entityManager:', this.entityManager);
                }
                enemy = new ShooterEnemy(
                    spawnPoint.x, 
                    spawnPoint.y, 
                    this.waveNumber,
                    this.entityManager
                );
                console.log('Created ShooterEnemy with entityManager');
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
                this.enemies = this.enemies.filter(enemy => {
                    const dx = enemy.x - exp.x;
                    const dy = enemy.y - exp.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        // Calcola il danno in base alla distanza
                        const damage = exp.damage * (1 - distance / 150);
                        enemy.health -= damage;

                        // Se il nemico muore per il danno dell'abilità
                        if (enemy.health <= 0) {
                            this.handleEnemyDeath(enemy, false);
                            return false; // Rimuove il nemico dalla lista
                        }

                        if (exp.pullForce) {
                            const angle = Math.atan2(this.station.y - enemy.y, this.station.x - enemy.x);
                            enemy.x += Math.cos(angle) * exp.pullForce;
                            enemy.y += Math.sin(angle) * exp.pullForce;
                        }
                    }
                    return true; // Mantiene il nemico nella lista
                });
            }, exp.delay);
        });
    }

    setupAutoFireToggle() {
        const toggleBtn = document.getElementById('autoFireToggle');
        toggleBtn.addEventListener('click', () => {
            if (this.station.activateAutoFire(this.waveNumber)) {
                toggleBtn.classList.add('active');
            }
        });

        // Update button state in game loop
        this.autoFireEnabled = this.station.autoFireActive;
        toggleBtn.textContent = `Auto Fire: ${this.autoFireEnabled ? 'ON' : 'OFF'}`;
        toggleBtn.classList.toggle('active', this.autoFireEnabled);
    }

    showPausePopup() {
        const gameStats = {
            score: this.state.score,
            time: this.formatTime(this.state.gameTime),
            enemiesKilled: this.state.enemiesKilled,
            credits: this.state.credits,
            wave: this.waveNumber // Add wave number
        };

        new GameOverPopup(gameStats, () => {
            this.paused = false;
            document.getElementById('pauseButton').textContent = 'Pause';
        });
    }

    setupSettingsButton() {
        const settingsBtn = document.querySelector('.settings-btn');
        settingsBtn.addEventListener('click', () => {
            this.paused = true;
            this.showSettingsPopup();
        });
    }

    showSettingsPopup() {
        const gameStats = {
            score: this.state.score,
            time: this.formatTime(this.state.gameTime),
            enemiesKilled: this.state.enemiesKilled,
            credits: this.state.credits,
            wave: this.waveNumber // Add wave number
        };

        // Qui passiamo false perché è solo una pausa
        new GameOverPopup(gameStats, () => {
            this.paused = false;
        }, false);  // <-- Esplicitamente false per la pausa
    }

    drawHealthBar(ctx, x, y, width, height, current, max, color = '#00ff00') {
        // Background
        ctx.fillStyle = '#304060';
        ctx.fillRect(x, y, width, height);

        // Health fill
        const healthPercentage = Math.min(1, current / max);
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width * healthPercentage, height);
    }
}
window.onload = () => new Game();

