export class GameUpgradeManager {
    constructor(station) {
        this.station = station;
        this.upgradeCounts = this.initializeUpgradeCounts();
        this.upgradeStats = this.initializeUpgradeStats();
        this.upgrades = this.initializeUpgrades();
    }

    initializeUpgradeCounts() {
        return {
            'Turret': 0,
            'Health': 0,
            'Fire Rate': 0,
            'Damage': 0,
            'Shield': 0,
            'Speed': 0,
            'Auto-Fire': 0,
            'Super Charge': 0
        };
    }

    initializeUpgradeStats() {
        return Object.keys(this.initializeUpgradeCounts()).reduce((acc, key) => {
            acc[key] = { count: 0, bonus: 0 };
            return acc;
        }, {});
    }

    initializeUpgrades() {
        return {
            'Turret': {
                key: '1',
                cost: 80,
                maxLevel: 8,
                action: () => this.station.turrets++
            },
            'Health': {
                key: '2',
                cost: 100,
                action: () => {
                    this.station.maxHealth += 30;
                    this.station.health = this.station.maxHealth;
                }
            },
            'Fire Rate': {
                key: '3',
                cost: 150,
                maxLevel: 5,
                action: () => this.station.fireRate *= 1.25
            },
            'Damage': {
                key: '4',
                cost: 200,
                maxLevel: 5,
                action: () => this.station.projectileDamage += 8
            },
            'Shield': {
                key: '5',
                cost: 250,
                action: () => this.station.shield = 100
            },
            'Speed': {
                key: '6',
                cost: 150,
                maxLevel: 3,
                action: () => this.station.projectileSpeed += 2
            },
            'Auto-Fire': {
                key: '7',
                cost: 200,
                duration: 15000,
                action: () => this.station.activateAutoFire(15000)
            },
            'Super Charge': {
                key: '8',
                cost: 300,
                action: () => this.station.superAbilityCharge = this.station.superAbilityMaxCharge
            }
        };
    }

    applyUpgrade(upgradeName) {
        const upgrade = this.upgrades[upgradeName];
        if (upgrade) {
            // Eseguiamo l'azione prima di incrementare i contatori
            upgrade.action();
            
            // Aggiorniamo i contatori dopo aver verificato che l'azione sia stata eseguita
            if (upgradeName === 'Turret' && this.station.turrets > this.upgradeCounts[upgradeName] + 1) {
                this.upgradeStats[upgradeName].count++;
                this.upgradeCounts[upgradeName]++;
                return true;
            }
            
            this.upgradeStats[upgradeName].count++;
            this.upgradeCounts[upgradeName]++;
            return true;
        }
        return false;
    }

    applyPrestigeBonus() {
        Object.keys(this.upgrades).forEach(key => {
            this.upgradeStats[key].bonus++;
            this.applyPrestigeBonusByType(key);
        });
    }

    applyPrestigeBonusByType(upgradeType) {
        const bonusActions = {
            'Damage': () => this.station.projectileDamage *= 1.05,
            'Fire Rate': () => this.station.fireRate *= 1.05,
            'Speed': () => {
                this.station.projectileSpeed = Math.min(15, this.station.projectileSpeed * 1.05);
            }
        };

        const action = bonusActions[upgradeType];
        if (action) {
            action();
        }
    }

    getUpgradeButton(upgradeName) {
        const upgrade = this.upgrades[upgradeName];
        if (upgrade) {
            return upgrade.key;
        }
        return '';
    }
}