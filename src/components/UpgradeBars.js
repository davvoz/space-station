export class UpgradeBars {
    constructor(gameState) {
        this.gameState = gameState;
        this.barWidth = 150;
        this.barHeight = 20;
        this.padding = 10;
        this.startY = 100;
    }

    draw(ctx, canvas) {
        const types = ['damage', 'speed', 'health'];
        const colors = {
            damage: '#ff4444',
            speed: '#44ff44',
            health: '#4444ff'
        };

        ctx.font = '16px Arial';
        
        types.forEach((type, index) => {
            const y = this.startY + (this.barHeight + this.padding) * index;
            const level = this.gameState.getUpgradeLevel(type);
            const cost = this.gameState.getUpgradeCost(type);
            const maxLevel = this.gameState.upgradeBars[type].maxLevel;

            // Draw bar background
            ctx.fillStyle = '#333333';
            ctx.fillRect(canvas.width - this.barWidth - 10, y, this.barWidth, this.barHeight);

            // Draw progress
            ctx.fillStyle = colors[type];
            const progress = (level / maxLevel) * this.barWidth;
            ctx.fillRect(canvas.width - this.barWidth - 10, y, progress, this.barHeight);

            // Draw text
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'right';
            ctx.fillText(
                `${type.charAt(0).toUpperCase() + type.slice(1)} (${level}/${maxLevel}) - ${this.gameState.formatNumber(cost)}c`,
                canvas.width - this.barWidth - 15,
                y + 15
            );
        });
    }

    handleClick(x, y, canvas) {
        const types = ['damage', 'speed', 'health'];
        
        types.forEach((type, index) => {
            const barY = this.startY + (this.barHeight + this.padding) * index;
            
            if (x >= canvas.width - this.barWidth - 10 &&
                x <= canvas.width - 10 &&
                y >= barY &&
                y <= barY + this.barHeight) {
                this.gameState.upgradeBar(type);
            }
        });
    }
}
