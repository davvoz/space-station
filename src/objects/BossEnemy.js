import { Projectile } from './Projectile.js';
import { Enemy } from './Enemy.js';

export class BossEnemy extends Enemy {
    constructor(x, y) {
        super(x, y, 10); // Boss level 10
        this.health = 1000;
        this.damage = 50;
        this.speed = 1;
        this.color = 'red';
    }

    update(station, width, height) {
        // Boss specific movement and attack patterns
        // Example: Move towards the station and shoot projectiles
        const angle = Math.atan2(station.y - this.y, station.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        // Shoot projectiles at intervals
        if (Date.now() - this.lastShot > 2000) {
            this.lastShot = Date.now();
            return new Projectile(this.x, this.y, station.x, station.y, 5, this.damage);
        }
    }
}
