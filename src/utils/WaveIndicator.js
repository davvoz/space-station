export class WaveIndicator {
    constructor(ctx, width) {
        this.ctx = ctx;
        this.width = width;
    }

    draw(waveNumber, waveProgress, isComplete) {
        const x = this.width / 2;
        const y = 50;
        const barWidth = 300;
        const barHeight = 30;

        // Background shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x - barWidth / 2 - 2, y - 32, barWidth + 4, 64);

        // Wave number
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText(`Wave ${waveNumber}`, x, y - 10);

        // Progress bar background
        this.ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        this.ctx.fillRect(x - barWidth / 2, y + 5, barWidth, barHeight);

        // Progress bar fill
        const gradient = this.ctx.createLinearGradient(x - barWidth / 2, 0, x + barWidth / 2, 0);
        if (isComplete) {
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#45a049');
        } else {
            gradient.addColorStop(0, '#2196F3');
            gradient.addColorStop(1, '#1976D2');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - barWidth / 2, y + 5, barWidth * waveProgress, barHeight);

        // Progress percentage
        const percentage = Math.floor(waveProgress * 100);
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillStyle = '#FFF';
        this.ctx.fillText(`${percentage}%`, x, y + 25);

        // Status text
        const status = isComplete ? 'WAVE COMPLETE!' : 'IN PROGRESS';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = isComplete ? '#4CAF50' : '#FFF';
        this.ctx.fillText(status, x, y + 50);
    }
}
