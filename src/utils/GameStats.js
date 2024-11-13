export class GameStats {
    constructor(ctx, width) {
        this.ctx = ctx;
        this.width = width;
    }

    draw(gameState) {
        const fontSize = 48; // Aumentato significativamente
        this.drawStatsBackground();
        this.drawBigStats(gameState, fontSize);
        this.drawSmallStats(gameState, fontSize);
    }

    drawStatsBackground() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.roundRect(40, 10, 400, 150, 15); // Aumentato width da 300 a 400 e spostato a destra
        this.ctx.fill();
    }

    drawBigStats(gameState, fontSize) {
        // Helper function for drawing flashy text with neon effect
        const drawTamarroText = (text, x, y, mainColor, glowColor, scale = 1) => {
            const adjustedSize = fontSize * scale;
            this.ctx.font = `bold ${adjustedSize}px "Arial Black"`;

            // Multiple layer glow effect
            for (let i = 4; i >= 0; i--) {
                this.ctx.shadowBlur = 15 + i * 2;
                this.ctx.shadowColor = glowColor;
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 4 - i;
                this.ctx.strokeText(text, x, y);
            }

            // Chrome gradient fill
            const gradient = this.ctx.createLinearGradient(x, y - adjustedSize, x, y);
            gradient.addColorStop(0, mainColor);
            gradient.addColorStop(0.5, '#FFFFFF');
            gradient.addColorStop(1, mainColor);

            this.ctx.fillStyle = gradient;
            this.ctx.fillText(text, x, y);

            // Reset shadow
            this.ctx.shadowBlur = 0;
        };

        // Fixed positions for alignment - spostati più a destra
        const iconX = 80;  // da 30 a 80
        const numberX = 170; // da 120 a 170
        const baseY = 80;
        const spacing = 60;

        // Set alignment for icons
        this.ctx.textAlign = 'center';
        // Draw icons with tamarro effect
        drawTamarroText(
            '🎯',
            iconX,
            baseY,
            '#00FFFF',
            '#0066FF',
            0.8
        );

        drawTamarroText(
            '💰',
            iconX,
            baseY + spacing,
            '#FFD700',
            '#FF6600',
            0.8
        );

        // Set alignment for numbers
        this.ctx.textAlign = 'left';
        // Draw score and credits
        drawTamarroText(
            this.formatNumber(gameState.score),
            numberX,
            baseY,
            '#00FFFF',
            '#0066FF',
            0.8
        );

        drawTamarroText(
            this.formatNumber(gameState.credits),
            numberX,
            baseY + spacing,
            '#FFD700',
            '#FF6600',
            0.8
        );

        // Add pulsating effect for large numbers
        if (gameState.score > 10000 || gameState.credits > 1000) {
            const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
            this.ctx.globalAlpha = pulse;
        }
    }

    drawSmallStats(gameState,  fontSize) {
        const stats = [
            `⚡ ${gameState.difficultyScaling.toFixed(1)}x`,
            `👾 ${gameState.enemies.length}/${gameState.maxEnemies}`,
            `⚔️ ${(1000 / gameState.enemySpawnCooldown).toFixed(1)}/s`
        ];

        this.ctx.font = `bold ${fontSize * 0.3}px Arial`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 3;

        stats.forEach((stat, index) => {
            this.ctx.fillText(stat, 350, 70 + (index * 25)); // Spostato da 290 a 350
        });

        this.ctx.shadowBlur = 0;
    }

    formatNumber(num) {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    }
}
