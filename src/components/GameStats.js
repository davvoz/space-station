import { UIComponent } from '../ui/components/UIComponent.js';
import { RenderUtils } from '../utils/RenderUtils.js';

export class GameStats extends UIComponent {
    constructor(ctx) {
        super(ctx, 10, 10, 300, 120);
        this.fontSize = 48;
    }

    draw(gameState) {
        if (!gameState) {
            console.warn('GameState not provided to GameStats.draw');
            return;
        }

        try {
            // Save context state
            this.ctx.save();
            
            this.drawStatsBackground();
            this.drawBigStats(gameState);
            
            // Restore context state
            this.ctx.restore();
        } catch (error) {
            console.error('Error drawing GameStats:', error);
            this.ctx.restore();
        }
    }

    drawStatsBackground() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        RenderUtils.roundRect(this.ctx, this.x, this.y, this.width, this.height, 15);
        this.ctx.fill();
    }

    drawBigStats(gameState) {
        // Score
        this.drawTamarroText(
            `🎯 ${this.formatNumber(gameState.score)}`,
            this.x + 20,  // Adjusted position
            this.y + 50,
            '#00FFFF',
            '#0066FF',
            0.8
        );

        // Credits
        this.drawTamarroText(
            `💰 ${this.formatNumber(gameState.credits)}`,
            this.x + 20,  // Adjusted position
            this.y + 100,
            '#FFD700',
            '#FF6600',
            0.8
        );
    }

    drawTamarroText(text, x, y, mainColor, glowColor, scale = 1) {
        const adjustedSize = Math.floor(this.fontSize * scale);
        this.ctx.font = `bold ${adjustedSize}px Arial`;
        
        // Clear any existing shadows
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
        
        // Draw text outline
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(text, x, y);

        // Draw glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = glowColor;
        
        // Draw main text
        this.ctx.fillStyle = mainColor;
        this.ctx.fillText(text, x, y);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
    }

    formatNumber(num) {
        try {
            if (!Number.isFinite(num)) return '0';
            if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
            if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
            if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
            return Math.floor(num).toString();
        } catch (error) {
            console.error('Error formatting number:', error);
            return '0';
        }
    }
}
