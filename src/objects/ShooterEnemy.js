import { Enemy } from './Enemy.js';
import { EnemyProjectile } from './EnemyProjectile.js';

export class ShooterEnemy extends Enemy {
    constructor(x, y, level, entityManager) {
        super(x, y, level);
        this.type = 'shooter';
        this.radius = 18;
        this.health *= 1.2;
        this.maxHealth = this.health;
        this.speed *= 0.7;
        this.value *= 2;
        this.scoreValue *= 2;
        this.baseColor = `rgb(100,100,${Math.min(255, 150 + level * 20)})`;
        this.color = this.baseColor;
        this.fireRate = 2000;
        this.lastShot = 0;
        this.projectileSpeed = 3;
        this.projectileDamage = 5 + level;
        this.entityManager = entityManager; // Assign entityManager
        
        // New properties
        this.rotation = 0;
        this.gunLength = this.radius * 1.2;
        this.pulsePhase = 0;
        this.innerRingRotation = 0;
        this.particles = [];
        this.chargeEffect = 0;
    }

    update(station, canvasWidth, canvasHeight) {
        super.update(station, canvasWidth, canvasHeight);

        // Rotate towards station
        const dx = station.x - this.x;
        const dy = station.y - this.y;
        this.rotation = Math.atan2(dy, dx);
        
        // Keep optimal shooting distance
        const distance = Math.sqrt(dx * dx + dy * dy);
        const optimalDistance = 250;
        if (distance < optimalDistance) {
            this.dx += -dx / distance * 0.1;
            this.dy += -dy / distance * 0.1;
        } else if (distance > optimalDistance + 100) {
            this.dx += dx / distance * 0.1;
            this.dy += dy / distance * 0.1;
        }

        // Visual effects updates
        this.pulsePhase += 0.05;
        this.innerRingRotation += 0.02;
        
        // Charging effect before shooting
        const currentTime = Date.now();
        const timeTillShot = this.fireRate - (currentTime - this.lastShot);
        if (timeTillShot < 500) {
            this.chargeEffect = 1 - (timeTillShot / 500);
            this.color = `rgb(${100 + 155 * this.chargeEffect},100,${Math.min(255, 150 + this.level * 20)})`;
        } else {
            this.chargeEffect = 0;
            this.color = this.baseColor;
        }

        // Shooting logic
        if (currentTime - this.lastShot >= this.fireRate && this.entityManager) {
            this.lastShot = currentTime;
            const projectile = new EnemyProjectile(
                this.x + Math.cos(this.rotation) * this.gunLength,
                this.y + Math.sin(this.rotation) * this.gunLength,
                station.x, station.y,
                this.projectileSpeed,
                this.projectileDamage
            );
            this.entityManager.enemyProjectiles.push(projectile); // Add projectile to entity manager
        }
    }

    drawBody(ctx) {
        // Main body
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Pulse effect
        const pulseSize = Math.sin(this.pulsePhase) * 2;
        
        // Outer ring
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + pulseSize, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${100 + 155 * this.chargeEffect},100,255,0.5)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Main body
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Inner rotating ring
        ctx.rotate(this.innerRingRotation);
        for (let i = 0; i < 8; i++) {
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(this.radius * 0.4, 0);
            ctx.lineTo(this.radius * 0.7, 0);
            ctx.strokeStyle = '#444';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Gun barrel
        ctx.rotate(-this.innerRingRotation);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#444';
        ctx.fillRect(0, -4, this.gunLength, 8);
        
        // Gun core
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = '#444';
        ctx.fill();

        // Charge effect
        if (this.chargeEffect > 0) {
            ctx.beginPath();
            ctx.arc(this.gunLength, 0, 4 + this.chargeEffect * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,100,100,${this.chargeEffect})`;
            ctx.fill();
        }

        ctx.restore();
    }
}