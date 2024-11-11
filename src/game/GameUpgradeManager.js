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
            'Speed': 0
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
                cost: 200, // Costo fisso invece che dinamico
                maxLevel: 10,
                getCurrentCost: () => 200 * (this.upgradeCounts['Turret'] + 1), // Nuovo metodo per calcolare il costo attuale
                action: () => {
                    if (this.station.turrets >= 10) {
                        this.showMaxTurretsMessage();
                        return false;
                    }
                    this.station.turrets++;
                    return true;
                }
            },
            'Health': {
                key: '2',
                baseCost: 100,
                getCurrentCost: (waveNumber) => {
                    const baseMultiplier = 1.5;
                    const waveMultiplier = Math.max(1, waveNumber * 0.2);
                    const upgradeMultiplier = Math.pow(baseMultiplier, this.upgradeCounts['Health']);
                    // Aggiungiamo un limite massimo al costo
                    const maxCost = 2000;
                    const calculatedCost = Math.floor(this.upgrades['Health'].baseCost * upgradeMultiplier * waveMultiplier);
                    return Math.min(calculatedCost, maxCost);
                },
                action: () => {
                    const healthIncrease = 30;
                    this.station.maxHealth += healthIncrease;
                    this.station.health = this.station.maxHealth;
                    
                    // Aggiungi floating text per mostrare l'aumento di salute
                    if (window.game && window.game.floatingTexts) {
                        window.game.floatingTexts.push({
                            x: this.station.x,
                            y: this.station.y - 40,
                            text: `+${healthIncrease}❤️`,
                            type: 'heal',
                            alpha: 1,
                            scale: 1.2,
                            life: 2000,
                            color: '#44FF44',
                            update: function() {
                                this.y -= 0.5;
                                this.alpha -= 0.01;
                                return this.alpha > 0;
                            }
                        });
                    }
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
            }
        };
    }

    // Aggiungi questo nuovo metodo
    getUpgradeCost(upgradeName) {
        const upgrade = this.upgrades[upgradeName];
        if (upgrade.getCurrentCost) {
            // Pass the wave number if it's available in the game state
            const waveNumber = window.game?.waveNumber || 1;
            return upgrade.getCurrentCost(waveNumber);
        }
        return upgrade.cost;
    }

    showMaxTurretsMessage() {
        if (window.game && window.game.floatingTexts) {
            // Creiamo un testo fluttuante più elaborato e contenuto nello schermo
            window.game.floatingTexts.push({
                x: Math.min(Math.max(this.station.x, 200), window.innerWidth - 200), // Mantiene il testo entro i bordi
                y: Math.max(40, this.station.y - 40), // Mantiene il testo nella parte superiore ma visibile
                text: `MAX TURRETS REACHED! (${this.station.turrets}/10) 🔫`,
                type: 'warning',
                alpha: 1,
                scale: 1.5, // Dimensione maggiore
                life: 3000, // Durata maggiore
                color: '#FF4444', // Colore rosso per enfatizzare
                update: function() {
                    this.y = Math.max(30, this.y - 0.3); // Movimento più lento verso l'alto
                    this.alpha -= 0.005; // Dissolvenza più lenta
                    this.scale = Math.max(1, this.scale - 0.01); // Effetto di riduzione graduale
                    return this.alpha > 0;
                }
            });
        }
    }

    applyUpgrade(upgradeName) { // Rimosso il parametro currentWave
        const upgrade = this.upgrades[upgradeName];
        if (upgrade) {
            // Check if it's a turret upgrade
            if (upgradeName === 'Turret') {
                // Check max turrets
                if (this.station.turrets >= 10) {
                    this.showMaxTurretsMessage();
                    return false;
                }
            }
            
            const success = upgrade.action();
            if (success) {
                this.upgradeStats[upgradeName].count++;
                this.upgradeCounts[upgradeName]++;
                return true;
            }
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