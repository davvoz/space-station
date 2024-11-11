//importa tutto ciò che serve
import { GAME_CONFIG } from '../../config/GameConfig.js';
import { ColorUtils } from '../../utils/ColorUtils.js';
import { ShapeUtils } from '../../utils/ShapeUtils.js';
import { TextUtils } from '../../utils/TextUtils.js';

export class ResourceBar {
    constructor(ctx, x, y, width, height, colors) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colors = colors;
    }

    draw(label, value, text, icon = '') {
        value = Math.max(0, Math.min(1, value));
        this.drawBackground();
        this.drawForeground(value);
        this.drawIcon(icon, value);
        this.drawText(text, icon);
    }

    drawBackground() {
        this.ctx.fillStyle = GAME_CONFIG.UI_CONFIG.COLORS.BACKGROUND;
        ShapeUtils.roundRect(this.ctx, this.x, this.y, this.width, this.height, this.height / 2);
        this.ctx.fill();
    }

    drawForeground(value) {
        if (value > 0) {
            try {
                this.ctx.fillStyle = ColorUtils.createGradient(this.ctx, this.x, this.y, this.width, this.height, this.colors);
                ShapeUtils.roundRect(this.ctx, this.x, this.y, this.width * value, this.height, this.height / 2);
                this.ctx.fill();
            } catch (error) {
                console.error('Error creating gradient:', error);
                this.ctx.fillStyle = this.colors[0];
                this.ctx.fillRect(this.x, this.y, this.width * value, this.height);
            }
        }
    }

    drawIcon(icon, value) {
        if (icon) {
            const iconSize = value === 1 ? this.height * 1.5 : this.height;
            const iconColor = value === 1 ? this.colors[1] : '#fff';
            TextUtils.drawText(this.ctx, icon, this.x + this.width / 2, this.y + this.height / 2, `${iconSize}px Arial`, iconColor, 'center', 'middle');
        }
    }

    drawText(text, icon) {
        if (text) {
            const displayText = icon ? `${icon} ${text}` : text;
            TextUtils.drawText(this.ctx, displayText, this.x + this.width + 10, this.y + this.height - 2, GAME_CONFIG.UI_CONFIG.FONTS.SMALL, GAME_CONFIG.UI_CONFIG.COLORS.WHITE);
        }
    }
}