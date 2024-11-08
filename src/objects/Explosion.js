import { GameObject } from './GameObject.js';
export class Explosion extends GameObject {
    constructor(x, y, color) {
        super(x, y, 15);
        this.particles = [];
        this.lifetime = 500; // durata in ms
        this.startTime = Date.now();
        this.color = color;

        // Crea particelle
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 2 + Math.random();
            this.particles.push({
                x: this.x,
                y: this.y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 4
            });
        }
    }

    update() {
        this.particles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
            p.size *= 0.95;
        });
    }

    draw(ctx) {
        const progress = (Date.now() - this.startTime) / this.lifetime;
        const alpha = 1 - progress;

        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.getRGBValues(this.color)},${alpha})`;
            ctx.fill();
        });
    }

    isDead() {
        return Date.now() - this.startTime > this.lifetime;
    }

    getRGBValues(color) {
        const match = color.match(/\d+/g);
        return match ? match.slice(0, 3).join(',') : '255,255,255';
    }
}