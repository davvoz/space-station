import { Enemy } from './Enemy.js';
export class SpeedyEnemy extends Enemy {
    constructor(x, y, level) {
        super(x, y, level);
        this.type = 'speedy';
        this.radius = 12;
        this.health *= 0.7;
        this.maxHealth = this.health;
        this.speed = this.baseSpeed * 2; // Use baseSpeed instead of direct multiplication
        this.value *= 1.5;
        this.scoreValue *= 1.5;
        this.color = `rgb(255,${Math.max(0, 200 - level * 20)},0)`;
        this.angle = 0; // For rotation animation
        this.mutationFactor = 1; // For mutation effect
    }

    drawBody(ctx) {
        this.angle += 0.02; // Rotate pattern
        this.mutationFactor = 1 + 0.1 * Math.sin(this.angle * 5); // Mutation effect

        // Main body
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius * this.mutationFactor);
        ctx.lineTo(this.x + this.radius * this.mutationFactor, this.y + this.radius * this.mutationFactor);
        ctx.lineTo(this.x - this.radius * this.mutationFactor, this.y + this.radius * this.mutationFactor);
        ctx.closePath();
        
        // Create gradient for inner glow
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * this.mutationFactor
        );
        gradient.addColorStop(0, 'rgba(0, 0, 255, 0.8)');
        gradient.addColorStop(1, this.color);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Sharp edges
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner pattern
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.translate(-this.x, -this.y);
        
        // Draw inner lines
        ctx.beginPath();
        for(let i = 0; i < 3; i++) {
            const lineY = this.y - this.radius * this.mutationFactor + (i * this.radius * this.mutationFactor / 1.5);
            ctx.moveTo(this.x - this.radius * this.mutationFactor / 2, lineY);
            ctx.lineTo(this.x + this.radius * this.mutationFactor / 2, lineY);
        }
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();

        // Energy particles
        for(let i = 0; i < 3; i++) {
            const particleAngle = (this.angle + i * Math.PI * 2/3) % (Math.PI * 2);
            const px = this.x + Math.cos(particleAngle) * (this.radius * 0.7 * this.mutationFactor);
            const py = this.y + Math.sin(particleAngle) * (this.radius * 0.7 * this.mutationFactor);
            
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            ctx.fill();
        }
    }
}