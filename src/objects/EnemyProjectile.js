import { Projectile } from './Projectile.js';

export class EnemyProjectile extends Projectile {
    constructor(x, y, targetX, targetY, speed, damage) {
        super(x, y, targetX, targetY, speed, damage);
        this.radius = 6;  // Aumentato il raggio
        this.baseColor = '#ff0000';
        this.glowColor = 'rgba(255, 0, 0, 0.3)';
        this.angle = Math.atan2(targetY - y, targetX - x);
    }

    draw(ctx) {
        // Salva il contesto corrente
        ctx.save();
        
        // Disegna l'effetto glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = this.glowColor;
        ctx.fill();

        // Disegna il proiettile principale
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.baseColor;
        ctx.fill();

        // Disegna una linea luminosa che attraversa il proiettile
        ctx.beginPath();
        ctx.moveTo(
            this.x - Math.cos(this.angle) * this.radius,
            this.y - Math.sin(this.angle) * this.radius
        );
        ctx.lineTo(
            this.x + Math.cos(this.angle) * this.radius,
            this.y + Math.sin(this.angle) * this.radius
        );
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Disegna il bordo del proiettile
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ripristina il contesto
        ctx.restore();
    }
}

