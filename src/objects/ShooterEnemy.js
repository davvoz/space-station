import { Enemy } from './Enemy.js';
import { EnemyProjectile } from './EnemyProjectile.js';

export class ShooterEnemy extends Enemy {
    constructor(x, y, level, entityManager) {
        super(x, y, level);
        
        // Verifica che entityManager sia valido
        if (!entityManager || !Array.isArray(entityManager.enemyProjectiles)) {
            console.error('ShooterEnemy: Invalid entityManager provided:', entityManager);
        }
        
        this.entityManager = entityManager;
        this.type = 'shooter'; // Già presente, ma importante per l'etichetta
        this.radius = 18;
        this.health *= 0.5; // Ridotto la salute
        this.maxHealth = this.health;
        this.speed *= 0.7;
        this.value *= 2;
        this.scoreValue *= 2;
        this.baseColor = `rgb(100,100,${Math.min(255, 150 + level * 20)})`;
        this.color = this.baseColor;
        this.fireRate = Math.max(1000, 1500 - (level * 50)); // Faster fire rate at higher levels
        this.lastShot = 0;
        this.projectileSpeed = 8 + (level * 0.5); // Speed increases with level
        this.projectileDamage = 3 + (level * 1.5); // Damage increases with level
        this.shootingRange = 300 + (level * 10); // Range increases with level
        
        // New properties
        this.rotation = 0;
        this.gunLength = this.radius * 1.2;
        this.pulsePhase = 0;
        this.innerRingRotation = 0;
        this.particles = [];
        this.chargeEffect = 0;
    }

    update(station, canvasWidth, canvasHeight) {
        // Verifica iniziale più dettagliata
        if (!station || !this.entityManager) {
            console.error('ShooterEnemy: missing dependencies', {
                hasStation: !!station,
                hasEntityManager: !!this.entityManager,
                entityManagerState: this.entityManager
            });
            return;
        }

        // Calcola la distanza dalla stazione
        const dx = station.x - this.x;
        const dy = station.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Aggiorna la rotazione
        this.rotation = Math.atan2(dy, dx);

        // Gestione del movimento
        if (distance > this.shootingRange) {
            // Se troppo lontano, avvicinati
            this.dx = (dx / distance) * this.speed;
            this.dy = (dy / distance) * this.speed;
        } else if (distance < this.shootingRange * 0.5) {
            // Se troppo vicino, allontanati
            this.dx = -(dx / distance) * this.speed;
            this.dy = -(dy / distance) * this.speed;
        } else {
            // Mantieni la distanza e muoviti lateralmente
            this.dx = -dy / distance * this.speed * 0.5;
            this.dy = dx / distance * this.speed * 0.5;
        }

        // Aggiorna la posizione
        this.x += this.dx;
        this.y += this.dy;

        // Logica di sparo con verifica aggiuntiva
        const currentTime = Date.now();
        if (currentTime - this.lastShot >= this.fireRate && distance <= this.shootingRange) {
            this.lastShot = currentTime;
            
            if (!this.entityManager.enemyProjectiles) {
                console.error('Missing enemyProjectiles array in entityManager');
                return;
            }

            // Calcola la direzione verso la stazione
            const angle = Math.atan2(station.y - this.y, station.x - this.x);
            
            // Crea un nuovo proiettile con la posizione corretta della canna
            const projectileX = this.x + Math.cos(this.rotation) * this.gunLength;
            const projectileY = this.y + Math.sin(this.rotation) * this.gunLength;
            
            const projectile = new EnemyProjectile(
                projectileX,
                projectileY,
                projectileX + Math.cos(angle) * 1000, // Punto target più lontano nella direzione dello sparo
                projectileY + Math.sin(angle) * 1000,
                this.projectileSpeed,
                this.projectileDamage
            );

            // Usa il metodo addEnemyProjectile invece dell'accesso diretto all'array
            if (typeof this.entityManager.addEnemyProjectile === 'function') {
                this.entityManager.addEnemyProjectile(projectile);
                console.log('Successfully added projectile via entityManager');
            } else {
                console.error('addEnemyProjectile is not a function');
            }
        }

        // Visual effects updates
        this.pulsePhase += 0.05;
        this.innerRingRotation += 0.02;
        
        // Modifica l'effetto di carica per essere molto più sottile
        const timeTillShot = this.fireRate - (currentTime - this.lastShot);
        if (timeTillShot < 500) {
            this.chargeEffect = (1 - (timeTillShot / 500)) * 0.3; // Ridotto a 0.3
            this.color = this.baseColor; // Non cambiare più il colore
        } else {
            this.chargeEffect = 0;
            this.color = this.baseColor;
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

        // Riduci drasticamente l'effetto di carica
        if (this.chargeEffect > 0) {
            ctx.beginPath();
            ctx.arc(this.gunLength, 0, 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,100,100,${this.chargeEffect * 0.5})`;
            ctx.fill();
        }

        ctx.restore();
    }
}