export class Wave {
    static ENEMY_TYPES = {
        BASIC: {
            type: 'basic',
            baseHealth: 100,
            baseDamage: 10,
            baseSpeed: 1,
            baseValue: 10,
            unlockWave: 1,
            distribution: 0.5
        },
        SPEEDY: {
            type: 'speedy',
            baseHealth: 75,
            baseDamage: 15,
            baseSpeed: 2,
            baseValue: 15,
            unlockWave: 2,
            distribution: 0.3
        },
        SHOOTER: {
            type: 'shooter',
            baseHealth: 125,
            baseDamage: 20,
            baseSpeed: 1,
            baseValue: 20,
            unlockWave: 3,
            distribution: 0.2,
            projectileStats: {
                baseDamage: 3,
                baseSpeed: 8,
                baseFireRate: 1500,
                baseRange: 300
            }
        },
        BOSS: {
            type: 'boss',
            baseHealth: 1000,
            baseDamage: 30,
            baseSpeed: 0.8,
            baseValue: 200,
            unlockWave: 5,
            distribution: 0
        }
    };

    constructor(waveNumber) {
        this.waveNumber = waveNumber;
        this.enemies = [];
        this.spawnQueue = [];
        this.isComplete = false;
        this.spawnDelay = this.calculateSpawnDelay();
        this.lastSpawnTime = 0;
        this.enemiesDefeated = 0;
        this.totalEnemies = 0;
        
        this.setupWave();
    }

    calculateSpawnDelay() {
        return Math.max(500, 2000 - (this.waveNumber * 100));
    }

    setupWave() {
        const baseCount = 5 + (this.waveNumber * 2);
        this.spawnQueue = this.generateEnemyDistribution(baseCount);
        this.totalEnemies = this.calculateTotalEnemies();
    }

    generateEnemyDistribution(baseCount) {
        const distribution = [];
        
        // Add basic enemies first (always present)
        distribution.push(this.createEnemyType('BASIC', Wave.ENEMY_TYPES.BASIC, baseCount));
        
        // Add speedy enemies if unlocked
        if (this.waveNumber >= Wave.ENEMY_TYPES.SPEEDY.unlockWave) {
            distribution.push(this.createEnemyType('SPEEDY', Wave.ENEMY_TYPES.SPEEDY, baseCount));
        }
        
        // Add shooter enemies if unlocked
        if (this.waveNumber >= Wave.ENEMY_TYPES.SHOOTER.unlockWave) {
            distribution.push(this.createEnemyType('SHOOTER', Wave.ENEMY_TYPES.SHOOTER, baseCount));
        }
        
        // Add boss every 5 waves
        if (this.waveNumber % 5 === 0 && this.waveNumber >= Wave.ENEMY_TYPES.BOSS.unlockWave) {
            distribution.push({
                type: 'boss',
                count: 1,
                stats: this.calculateEnemyStats(Wave.ENEMY_TYPES.BOSS)
            });
        }

        return distribution;
    }

    createEnemyType(typeName, config, baseCount) {
        return {
            type: config.type,
            count: Math.ceil(baseCount * config.distribution),
            stats: this.calculateEnemyStats(config)
        };
    }

    calculateEnemyStats(config) {
        const stats = {
            health: config.baseHealth * Math.pow(1.1, this.waveNumber - 1),
            damage: config.baseDamage * Math.pow(1.05, this.waveNumber - 1),
            speed: Math.min(config.baseSpeed * 1.5, config.baseSpeed + (this.waveNumber * 0.1)),
            value: config.baseValue * Math.pow(1.1, this.waveNumber - 1)
        };

        // Add projectile stats scaling for shooter enemies
        if (config.type === 'shooter' && config.projectileStats) {
            stats.projectile = {
                damage: config.projectileStats.baseDamage * Math.pow(1.2, this.waveNumber - 1),
                speed: config.projectileStats.baseSpeed + (this.waveNumber * 0.5),
                fireRate: Math.max(500, config.projectileStats.baseFireRate - (this.waveNumber * 50)),
                range: config.projectileStats.baseRange + (this.waveNumber * 10)
            };
        }

        return stats;
    }

    getTypeDistribution(type) {
        switch (type) {
            case 'basic':
                return 0.5;
            case 'speedy':
                return 0.3;
            case 'shooter':
                return 0.2;
            default:
                return 0;
        }
    }

    calculateTotalEnemies() {
        return this.spawnQueue.reduce((sum, type) => sum + type.count, 0);
    }

    canSpawnEnemy(currentTime) {
        return currentTime - this.lastSpawnTime >= this.spawnDelay;
    }

    getNextEnemy() {
        if (this.isComplete) return null;
        
        const activeType = this.spawnQueue.find(type => type.count > 0);
        if (!activeType) return null;

        activeType.count--;
        this.lastSpawnTime = Date.now();
        
        return {
            type: activeType.type,
            stats: activeType.stats
        };
    }

    onEnemyDefeated() {
        this.enemiesDefeated++;
        if (this.enemiesDefeated >= this.totalEnemies) {
            this.isComplete = true;
        }
    }

    getWaveProgress() {
        return this.enemiesDefeated / this.totalEnemies;
    }
}
