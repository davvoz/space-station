export class AbilityButtons {
    constructor(gameState) {
        this.gameState = gameState;
        this.buttonSize = 50;
        this.padding = 10;
        this.startX = 10;
        this.startY = 200;
    }

    draw(ctx) {
        const abilities = ['shield', 'boost'];
        const icons = {
            shield: '🛡️',
            boost: '⚡'
        };

        abilities.forEach((type, index) => {
            const x = this.startX;
            const y = this.startY + (this.buttonSize + this.padding) * index;
            
            // Draw button background
            ctx.fillStyle = this.gameState.isAbilityActive(type) ? '#44ff44' : '#333333';
            if (!this.gameState.isAbilityReady(type)) {
                ctx.fillStyle = '#666666';
            }
            ctx.fillRect(x, y, this.buttonSize, this.buttonSize);

            // Draw cooldown overlay
            const cooldownPercent = this.gameState.getRemainingCooldown(type) / this.gameState.abilityButtons[type].cooldown;
            if (cooldownPercent > 0) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(x, y + this.buttonSize * (1 - cooldownPercent), 
                           this.buttonSize, this.buttonSize * cooldownPercent);
            }

            // Draw border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, this.buttonSize, this.buttonSize);

            // Draw icon
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icons[type], x + this.buttonSize/2, y + this.buttonSize/2);

            // Draw ability name
            ctx.font = '14px Arial';
            ctx.fillText(type.charAt(0).toUpperCase() + type.slice(1), 
                        x + this.buttonSize/2, y + this.buttonSize + 15);
        });
    }

    handleClick(x, y) {
        const abilities = ['shield', 'boost'];
        
        abilities.forEach((type, index) => {
            const buttonX = this.startX;
            const buttonY = this.startY + (this.buttonSize + this.padding) * index;
            
            if (x >= buttonX && x <= buttonX + this.buttonSize &&
                y >= buttonY && y <= buttonY + this.buttonSize) {
                this.gameState.activateAbility(type);
            }
        });
    }
}
