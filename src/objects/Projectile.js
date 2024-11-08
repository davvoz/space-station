import { GameObject } from './GameObject.js';
export class Projectile extends GameObject {
    constructor(x, y, targetX, targetY, speed, damage) {
        super(x, y, 3);
        const angle = Math.atan2(targetY - y, targetX - x);
        this.dx = Math.cos(angle) * speed;
        this.dy = Math.sin(angle) * speed;
        this.damage = damage;
        this.color = '#ffffff'; // Change to white hex for consistency
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }

    draw(ctx) {
        // Draw main projectile
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}