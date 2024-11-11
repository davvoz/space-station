export class Timer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height; // Store height
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    draw(gameTime) {
        const time = this.formatTime(gameTime);
        const fontSize = Math.min(56, this.width * 0.05);

        // Position in bottom right with padding
        const xPosition = this.width - 30;
        const yPosition = this.height - 30;

        // Draw flashy tamarro text with neon effect
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'bottom';

        // Multiple layer glow effect
        for (let i = 4; i >= 0; i--) {
            this.ctx.shadowBlur = 15 + i * 2;
            this.ctx.shadowColor = '#0066FF';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 4 - i;
            this.ctx.font = `bold ${fontSize}px "Arial Black"`;
            this.ctx.strokeText(`⏱️ ${time}`, xPosition, yPosition);
        }

        // Chrome gradient fill
        const gradient = this.ctx.createLinearGradient(
            xPosition,
            yPosition - fontSize,
            xPosition,
            yPosition
        );
        gradient.addColorStop(0, '#00FFFF');
        gradient.addColorStop(0.5, '#FFFFFF');
        gradient.addColorStop(1, '#00FFFF');

        this.ctx.fillStyle = gradient;
        this.ctx.fillText(`⏱️ ${time}`, xPosition, yPosition);

        // Pulsating effect
        const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
        this.ctx.globalAlpha = pulse;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00FFFF';
        this.ctx.fillText(`⏱️ ${time}`, xPosition, yPosition);

        // Reset effects
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
}
