import { Projectile } from './Projectile.js';
export class EnemyProjectile extends Projectile {
    constructor(x, y, targetX, targetY, speed, damage) {
        super(x, y, targetX, targetY, speed, damage);
        this.radius = 4;
        this.color = '#ff0000'; // Change to red hex for consistency
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f00';
        ctx.fill();
    }
}

