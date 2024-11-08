export class GameState {
    constructor() {
        // Basic stats
        this.score = 0;
        this.credits = 100;
        this.enemiesKilled = 0;
        
        // Game settings
        this.difficulty = 0.3;
        this.gameTime = 0;
        this.prestigeLevel = 0;
        this.invulnerableTime = 3000;
        this.lastFrameTime = Date.now();
        this.muted = false;
        
        // Enemy management
        this.enemies = [];
        this.maxEnemies = 12;
        this.enemySpawnCooldown = 2000;
        this.difficultyScaling = 0.5;
        this.lastEnemySpawn = 0;
        
        // Powerups
        this.powerupTimer = 0;
        this.powerupInterval = 15000;
        this.activePowerups = [];
        
        // Game state flags
        this.isGameOver = false;
        this.isPaused = false;
        
        // UI positioning
        this.textPadding = 20;
        this.lineHeight = 35;
        this.fontSize = 24;
        this.scoreX = this.textPadding;
        this.scoreY = this.textPadding + this.fontSize;
        this.creditsX = this.textPadding;
        this.creditsY = this.scoreY + this.lineHeight;
        
        // Upgrades and abilities
        this.upgrades = new Map();
        this.abilities = new Map();

        // Upgrade bars configuration
        this.upgradeBars = {
            damage: { level: 1, cost: 100, maxLevel: 10 },
            speed: { level: 1, cost: 100, maxLevel: 10 },
            health: { level: 1, cost: 100, maxLevel: 10 }
        };

        // Ability buttons configuration
        this.abilityButtons = {
            shield: { 
                cooldown: 10000,
                lastUsed: 0,
                isActive: false,
                duration: 5000
            },
            boost: {
                cooldown: 15000,
                lastUsed: 0,
                isActive: false,
                duration: 3000
            }
        };
    }

    // Game state methods
    update(deltaTime) {
        if (this.isGameOver || this.isPaused) return;
        this.gameTime += deltaTime / 1000;
        // Update game state logic
    }

    // Score and credits methods
    addScore(points) {
        this.score += points;
    }

    addCredits(amount) {
        this.credits += amount;
    }

    // Upgrade methods
    canAffordUpgrade(cost) {
        return this.credits >= cost;
    }

    purchaseUpgrade(cost) {
        if (this.canAffordUpgrade(cost)) {
            this.credits -= cost;
            return true;
        }
        return false;
    }

    // Utility methods
    formatNumber(num) {
        if (num >= 1000000) {
            return (num/1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num/1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // New methods for upgrade bars and ability buttons
    upgradeBar(type) {
        const bar = this.upgradeBars[type];
        if (bar && bar.level < bar.maxLevel && this.purchaseUpgrade(bar.cost)) {
            bar.level++;
            bar.cost = Math.floor(bar.cost * 1.5); // Increase cost for next level
            return true;
        }
        return false;
    }

    getUpgradeLevel(type) {
        return this.upgradeBars[type]?.level || 1;
    }

    getUpgradeCost(type) {
        return this.upgradeBars[type]?.cost || 0;
    }

    activateAbility(type) {
        const ability = this.abilityButtons[type];
        if (!ability) {
            console.warn(`Ability ${type} not found`);
            return false;
        }

        const currentTime = Date.now();
        if (currentTime - ability.lastUsed < ability.cooldown) {
            return false;
        }

        try {
            ability.isActive = true;
            ability.lastUsed = currentTime;
            
            setTimeout(() => {
                ability.isActive = false;
            }, ability.duration);
            
            return true;
        } catch (error) {
            console.error(`Error activating ability ${type}:`, error);
            return false;
        }
    }

    isAbilityReady(type) {
        const ability = this.abilityButtons[type];
        return ability && (Date.now() - ability.lastUsed >= ability.cooldown);
    }

    isAbilityActive(type) {
        return this.abilityButtons[type]?.isActive || false;
    }

    getRemainingCooldown(type) {
        const ability = this.abilityButtons[type];
        if (!ability) return 0;
        
        const elapsed = Date.now() - ability.lastUsed;
        return Math.max(0, ability.cooldown - elapsed);
    }
}
