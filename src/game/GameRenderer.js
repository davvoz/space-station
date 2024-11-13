import { GameStats } from '../utils/GameStats.js';
import { UpgradeBars } from '../utils/UpgradeBars.js';
import { AbilityButtons } from '../utils/AbilityButtons.js';
import { StarBackground } from '../utils/StarBackground.js';
import { Timer } from '../utils/Timer.js';
import { WaveIndicator } from '../utils/WaveIndicator.js';

export class GameRenderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.upgradeColors = this.initializeUpgradeColors();
        this.background = new StarBackground(ctx, width, height);
        this.timer = new Timer(ctx, width, height);  // Pass height parameter
        this.waveIndicator = new WaveIndicator(ctx, width);
    }

    initializeUpgradeColors() {
        return [
            ['#4CAF50', '#45a049'],
            ['#9C27B0', '#7B1FA2'],
            ['#FF9800', '#F57C00'],
            ['#2196F3', '#1976D2'],
            ['#F44336', '#D32F2F']
        ];
    }

    clearCanvas() {
        // Instead of just filling with black, draw the animated background
        this.background.draw();
    }

    draw(game) {
        if (!game || !game.state || !game.station) {
            console.warn('Invalid game object passed to renderer');
            return;
        }

        this.clearCanvas();
        
        // Calcola posizioni responsive per gli elementi UI
        const rightMargin = Math.min(200, this.width * 0.15); // Aumentato il margine
        const topMargin = Math.min(20, this.height * 0.03);
        const upgradeBarWidth = Math.min(180, this.width * 0.18); // Aumentato la larghezza
        
        this.timer.draw(game.state.gameTime);
        
        const gameStats = new GameStats(this.ctx, this.width);
        gameStats.draw(game.state);

        const upgradeBars = new UpgradeBars(this.ctx, this.width, this.upgradeColors);
        upgradeBars.draw(
            game.state, 
            game.upgradeManager, 
            this.width - upgradeBarWidth - rightMargin - 50, // Spostato più a sinistra
            topMargin, 
            upgradeBarWidth, 
            15, 
            25
        );

        const abilityButtons = new AbilityButtons(this.ctx);
        abilityButtons.draw(
            game.station, 
            this.width - upgradeBarWidth - rightMargin - 50, // Spostato più a sinistra
            topMargin + Object.keys(game.upgradeManager.upgrades).length * 25 + 40, 
            80, 
            20
        );

        // Add wave indicator drawing
        if (game.currentWave) {
            this.waveIndicator.draw(
                game.waveNumber,
                game.currentWave.getWaveProgress(),
                game.currentWave.isComplete
            );
        }
    }
}
