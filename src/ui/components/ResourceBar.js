import { UIComponent } from './UIComponent.js';
import { ColorUtils } from '../../utils/ColorUtils.js';
import { RenderUtils } from '../../utils/RenderUtils.js';
import { GAME_CONFIG } from '../../config/GameConfig.js';

export class ResourceBar extends UIComponent {
    constructor(ctx, x, y, width, height, colors) {
        super(ctx, x, y, width, height);
        this.colors = colors;
        this.borderRadius = height / 2;
    }

    draw(props) {
        const { label, value, text, icon = '' } = props;
        const normalizedValue = Math.max(0, Math.min(1, value));
        
        this.drawBackground();
        this.drawForeground(normalizedValue);
        this.drawIcon(icon, normalizedValue);
        this.drawText(text, icon);
        this.drawLabel(label);
    }

    drawBackground() {
        this.ctx.fillStyle = GAME_CONFIG.UI_CONFIG.COLORS.BACKGROUND;
        RenderUtils.roundRect(
            this.ctx, 
            this.x, 
            this.y, 
            this.width, 
            this.height, 
            this.borderRadius
        );
        this.ctx.fill();
    }

    drawForeground(value) {
        if (value <= 0) return;

        try {
            const gradient = ColorUtils.createGradient(
                this.ctx,
                this.x,
                this.y,
                this.width,
                this.height,
                this.colors
            );
            
            this.ctx.fillStyle = gradient;
            RenderUtils.roundRect(
                this.ctx,
                this.x,
                this.y,
                this.width * value,
                this.height,
                this.borderRadius
            );
            this.ctx.fill();
        } catch (error) {
            console.warn('Error drawing foreground:', error);
            this.drawFallbackForeground(value);
        }
    }

    drawFallbackForeground(value) {
        this.ctx.fillStyle = this.colors[0];
        RenderUtils.roundRect(
            this.ctx,
            this.x,
            this.y,
            this.width * value,
            this.height,
            this.borderRadius
        );
        this.ctx.fill();
    }

    drawIcon(icon, value) {
        if (!icon) return;

        const iconSize = value === 1 ? this.height * 1.5 : this.height;
        const iconColor = value === 1 ? this.colors[1] : GAME_CONFIG.UI_CONFIG.COLORS.WHITE;
        const iconX = this.x + this.width / 2;
        const iconY = this.y + this.height / 2;

        if (value === 1) {
            // Add glow effect for full value
            this.ctx.save();
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.colors[1];
        }

        RenderUtils.drawText(this.ctx, {
            text: icon,
            x: iconX,
            y: iconY,
            font: `${iconSize}px Arial`,
            color: iconColor,
            align: 'center',
            baseline: 'middle'
        });

        if (value === 1) {
            this.ctx.restore();
        }
    }

    drawText(text, icon) {
        if (!text) return;

        const displayText = icon ? `${icon} ${text}` : text;
        const textX = this.x + this.width + 10;
        const textY = this.y + this.height - 2;

        RenderUtils.drawText(this.ctx, {
            text: displayText,
            x: textX,
            y: textY,
            font: GAME_CONFIG.UI_CONFIG.FONTS.SMALL,
            color: GAME_CONFIG.UI_CONFIG.COLORS.WHITE
        });
    }

    drawLabel(label) {
        if (!label) return;

        const labelX = this.x - 5;
        const labelY = this.y + this.height / 2;

        RenderUtils.drawText(this.ctx, {
            text: label,
            x: labelX,
            y: labelY,
            font: GAME_CONFIG.UI_CONFIG.FONTS.SMALL,
            color: GAME_CONFIG.UI_CONFIG.COLORS.WHITE,
            align: 'right',
            baseline: 'middle'
        });
    }

    /**
     * Updates the colors of the resource bar
     * @param {string[]} colors Array of two colors for gradient
     */
    updateColors(colors) {
        this.colors = colors;
    }

    /**
     * Sets the bar to pulse (useful for highlighting)
     * @param {boolean} shouldPulse Whether the bar should pulse
     */
    setPulsing(shouldPulse) {
        if (shouldPulse) {
            this.pulseStart = Date.now();
        } else {
            this.pulseStart = null;
        }
    }
}
