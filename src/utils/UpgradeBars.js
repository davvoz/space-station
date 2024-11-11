import { ResourceBar } from "../ui/components/ResourceBar.js";
import { TextUtils } from "../utils/TextUtils.js";

export class UpgradeBars {
    constructor(ctx, width, upgradeColors) {
        this.ctx = ctx;
        this.width = width;
        this.upgradeColors = upgradeColors;
    }

    draw(gameState, upgradeManager, startX, startY, barWidth, barHeight, spacing) {
        const icons = {
            'Turret': '🔫',
            'Health': '❤️',
            'Fire Rate': '🔥',
            'Damage': '💥',
            'Shield': '🛡️',
            'Speed': '⚡'
        };

        let displayIndex = 0;
        const displayedUpgrades = Object.entries(upgradeManager.upgrades)
            .filter(([name, _]) => name !== 'Auto-Fire' && name !== 'Super Charge');

        displayedUpgrades.forEach(([name, upgrade], index) => {
            const y = startY + (spacing * displayIndex);
            const currentCost = upgradeManager.getUpgradeCost(name);
            const progress = Math.min(1, gameState.credits / currentCost);
            const canAfford = gameState.credits >= currentCost;

            const resourceBar = new ResourceBar(
                this.ctx,
                startX,
                y,
                barWidth,
                barHeight,
                canAfford ? this.upgradeColors[displayIndex % this.upgradeColors.length] : ['#666', '#444']
            );

            // Modifica il testo per mostrare il moltiplicatore per l'health
            let displayText;
            if (name === 'Health') {
                const waveNumber = window.game?.waveNumber || 1;
                const waveMultiplier = Math.max(1, waveNumber * 0.2).toFixed(1);
                displayText = `[${index + 1}] ${name} (${currentCost}💰) x${waveMultiplier}`;
            } else if (name === 'Turret') {
                displayText = `[${index + 1}] ${name} (${currentCost}💰) ${upgradeManager.upgradeCounts[name]}/10`;
            } else {
                displayText = `[${index + 1}] ${name} (${currentCost}💰)`;
            }

            resourceBar.draw(
                name,
                progress,
                displayText,
                icons[name]
            );

            this.drawUpgradeCount(upgradeManager, name, startX, y, barHeight);
            this.drawButtonNumber(index, startX, y, barHeight);

            displayIndex++;
        });
    }

    drawUpgradeCount(upgradeManager, name, startX, y, barHeight) {
        const count = upgradeManager.upgradeCounts[name];
        if (count > 0) {
            TextUtils.drawText(this.ctx, `x${count}`, startX - 50, y + barHeight - 2, 'bold 14px Arial', '#fff', 'right');
        }
    }

    drawButtonNumber(index, startX, y, barHeight) {
        TextUtils.drawText(this.ctx, index + 1, startX - 20, y + barHeight / 2, 'bold 14px Arial', '#fff', 'right', 'middle');
    }
}
