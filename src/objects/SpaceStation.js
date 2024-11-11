import { GameObject } from './GameObject.js';

export class SpaceStation extends GameObject {
    constructor(x, y) {
        super(x, y, 30);
        this.health = 150;
        this.maxHealth = 150;
        this.level = 1;
        this.turrets = Math.min(2, 10); // Ensure initial turrets don't exceed max
        this.maxTurrets = 10; // Add max turrets constant
        this.fireRate = 1.5;
        this.projectileSpeed = 6;
        this.projectileDamage = 15;
        this.shield = 50;
        this.maxShield = 50;
        this.turretAngle = 0;
        this.invincible = false;
        this.invincibilityDuration = 0;
        this.invincibilityMaxDuration = 10000; // 10 seconds in milliseconds
        this.invincibilityAlpha = 1.0; // Add this for fade effect
        this.speed = 5; // Increased for more responsive movement
        this.screenWidth = window.innerWidth;  // Add screen bounds
        this.screenHeight = window.innerHeight;
        this.vx = 0;    // Horizontal velocity
        this.vy = 0;    // Vertical velocity
        this.maxSpeed = 5;
        this.lastUpdate = Date.now();

        // New properties for abilities
        this.autoFireActive = false;
        this.autoFireDuration = 0;
        this.autoFireMaxDuration = 15000; // 15 secondi
        this.autoFireTimer = 0;
        this.autoFireRate = 5;
        this.autoFireCooldown = 0;
        this.autoFireCooldownTime = 10000; // 10 secondi
        this.autoFireCharge = 0; // Aggiungi questa proprietà

        // Replace super ability properties with twin system
        this.abilityCharge = 100; // Start fully charged
        this.abilityMaxCharge = 100;
        this.abilityChargeRate = 50; // Much faster charge rate
        this.abilityCooldown = 0;
        this.abilityCooldownTime = 3000; // 3 seconds cooldown (was 15000)

        // Nova ability (expanding)
        this.novaActive = false;
        this.novaDuration = 0;
        this.novaMaxDuration = 2000; // 2 seconds (was 5000)
        
        // Vortex ability (contracting)
        this.vortexActive = false;
        this.vortexDuration = 0;
        this.vortexMaxDuration = 2000; // 2 seconds (was 5000)
        this.vortexRadius = 0;
        this.vortexMaxRadius = Math.max(this.screenWidth, this.screenHeight) / 2;

        // Modify/add these movement properties
        this.speed = 5;
        this.dx = 0;
        this.dy = 0;
        this.maxSpeed = 5;

        // Aggiungi sistema power-up
        this.activePowerUps = new Map();
        this.baseSpeed = this.speed;
        this.baseDamage = this.projectileDamage;
        this.baseTurrets = this.turrets;
        this.bonusShield = false;
    }

    applyInvincibility(duration) {
        this.invincible = true;
        this.invincibilityDuration = duration;
        this.invincibilityAlpha = 1.0;
    }

    update(currentTime) {
        const keys = this.getKeys();
        
        
        // Calculate movement based on arrow keys
        this.dx = 0;
        this.dy = 0;
        if (keys.ArrowLeft) this.dx = -this.speed;
        if (keys.ArrowRight) this.dx = this.speed;
        if (keys.ArrowUp) this.dy = -this.speed;
        if (keys.ArrowDown) this.dy = this.speed;

        // Apply movement
        this.x += this.dx;
        this.y += this.dy;

        // Keep within screen bounds
        this.x = Math.max(this.radius, Math.min(this.screenWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(this.screenHeight - this.radius, this.y));

        const deltaTime = currentTime - this.lastUpdate;

        if (this.invincible) {
            this.invincibilityDuration -= deltaTime;

            // Calculate alpha based on remaining duration (0 to 1)
            this.invincibilityAlpha = Math.max(0, this.invincibilityDuration / this.invincibilityMaxDuration);

            if (this.invincibilityDuration <= 0) {
                this.invincible = false;
                this.invincibilityDuration = 0;
                this.invincibilityAlpha = 0;
            }
        }

        // Update auto-fire
        if (this.autoFireActive) {
            this.autoFireDuration = Math.max(0, this.autoFireDuration - deltaTime);
            if (this.autoFireDuration <= 0) {
                this.autoFireActive = false;
                this.autoFireCooldown = this.autoFireCooldownTime;
                this.autoFireCharge = 0;
            }
        } else if (this.autoFireCooldown > 0) {
            this.autoFireCooldown = Math.max(0, this.autoFireCooldown - deltaTime);
            if (this.autoFireCooldown === 0) {
                this.autoFireCharge = 100; // Ricarica completa dopo il cooldown
            }
        } else {
            this.autoFireCharge = 100; // Mantieni carico quando non in uso
        }

        // Update ability states
        if (this.novaActive) {
            this.novaDuration -= deltaTime;
            if (this.novaDuration <= 0) {
                this.deactivateAbility('nova');
            }
        }
        
        if (this.vortexActive) {
            this.vortexDuration -= deltaTime;
            if (this.vortexDuration <= 0) {
                this.deactivateAbility('vortex');
            }
        }

        if (!this.novaActive && !this.vortexActive) {
            if (this.abilityCooldown > 0) {
                this.abilityCooldown = Math.max(0, this.abilityCooldown - deltaTime);
            } else if (this.abilityCharge < this.abilityMaxCharge) {
                this.abilityCharge = Math.min(
                    this.abilityMaxCharge,
                    this.abilityCharge + (this.abilityChargeRate * deltaTime / 500) // Faster charge rate
                );
            }
        }

        // Update auto-fire cooldown
        if (this.autoFireCooldown > 0) {
            this.autoFireCooldown = Math.max(0, this.autoFireCooldown - 16.67); // Roughly 60 FPS
        }

        // Charge super ability over time
        if (this.superAbilityCharge < this.superAbilityMaxCharge) {
            this.superAbilityCharge += 0.1; // Adjust charge rate as needed
        }

        // Update power-ups
        for (const [type, powerUp] of this.activePowerUps.entries()) {
            powerUp.remainingTime -= deltaTime;
            if (powerUp.remainingTime <= 0) {
                powerUp.remove(this);
                this.activePowerUps.delete(type);
            }
        }

        this.lastUpdate = currentTime;
    }

    getKeys() {
        return {
            ArrowLeft: !!window.keysPressed?.['ArrowLeft'] || !!window.keysPressed?.['KeyA'],
            ArrowRight: !!window.keysPressed?.['ArrowRight'] || !!window.keysPressed?.['KeyD'],
            ArrowUp: !!window.keysPressed?.['ArrowUp'] || !!window.keysPressed?.['KeyW'],
            ArrowDown: !!window.keysPressed?.['ArrowDown'] || !!window.keysPressed?.['KeyS']
        };
    }

    takeDamage(amount) {
        if (this.invincible) {
            return false; // No damage taken
        }
        if (this.shield > 0) {
            this.shield -= amount;
            if (this.shield < 0) {
                this.health += this.shield;
                this.shield = 0;
            }
        } else {
            this.health -= amount;
        }
        return true; // Damage was applied
    }

    draw(ctx) {
        // Shield effect
        if (this.shield > 0) {
            const gradient = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, this.radius + 20);
            gradient.addColorStop(0, `rgba(100, 200, 255, 0.1)`);
            gradient.addColorStop(0.5, `rgba(100, 200, 255, ${this.shield / 100})`);
            gradient.addColorStop(1, `rgba(100, 200, 255, 0.1)`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 20, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        // Invincibility effect
        if (this.invincible) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 30, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 215, 0, ${this.invincibilityAlpha})`;
            ctx.lineWidth = 5;
            ctx.stroke();

            // Add glow effect
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 35, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 215, 0, ${this.invincibilityAlpha * 0.5})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Main station body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const mainGradient = ctx.createRadialGradient(this.x - this.radius / 3, this.y - this.radius / 3, 0, this.x, this.y, this.radius);
        mainGradient.addColorStop(0, '#44ccff');
        mainGradient.addColorStop(1, '#002244');
        ctx.fillStyle = mainGradient;
        ctx.fill();
        ctx.strokeStyle = '#80e0ff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner details
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = '#80e0ff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Docking ports
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const px = this.x + Math.cos(angle) * this.radius;
            const py = this.y + Math.sin(angle) * this.radius;

            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#202030';
            ctx.fill();
            ctx.strokeStyle = '#80e0ff';
            ctx.stroke();
        }

        // Turrets
        for (let i = 0; i < this.turrets; i++) {
            const angle = (i / this.turrets) * Math.PI * 2 + this.turretAngle;
            const tx = this.x + Math.cos(angle) * this.radius;
            const ty = this.y + Math.sin(angle) * this.radius;

            // Turret base
            ctx.beginPath();
            ctx.arc(tx, ty, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#304060';
            ctx.fill();
            ctx.strokeStyle = '#80e0ff';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Turret cannon
            ctx.beginPath();
            ctx.moveTo(tx, ty);
            ctx.lineTo(
                tx + Math.cos(angle) * 12,
                ty + Math.sin(angle) * 12
            );
            ctx.strokeStyle = '#ff55ff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Central antenna
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius * 0.7);
        ctx.lineTo(this.x, this.y + this.radius * 0.7);
        ctx.moveTo(this.x - this.radius * 0.7, this.y);
        ctx.lineTo(this.x + this.radius * 0.7, this.y);
        ctx.strokeStyle = '#80e0ff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Health bar with better styling
        const healthBarWidth = 50;
        const healthBarHeight = 6;
        const healthPercentage = this.health / this.maxHealth;

        // Health bar background
        ctx.fillStyle = '#304060';
        ctx.fillRect(this.x - healthBarWidth / 2, this.y + this.radius + 10,
            healthBarWidth, healthBarHeight);

        // Health bar fill
        const healthGradient = ctx.createLinearGradient(
            this.x - healthBarWidth / 2, 0,
            this.x + healthBarWidth / 2, 0
        );
        healthGradient.addColorStop(0, '#00ff00');
        healthGradient.addColorStop(1, '#80ff80');
        ctx.fillStyle = healthGradient;
        ctx.fillRect(this.x - healthBarWidth / 2, this.y + this.radius + 10,
            healthBarWidth * healthPercentage, healthBarHeight);

        // Draw power-up status bars
        let offsetY = -50;
        for (const [type, powerUp] of this.activePowerUps.entries()) {
            const progress = powerUp.remainingTime / powerUp.duration;
            const barWidth = 60;
            const barHeight = 6;

            // Draw bar background
            ctx.fillStyle = '#304060';
            ctx.fillRect(this.x - barWidth/2, this.y + offsetY, barWidth, barHeight);

            // Draw progress bar
            ctx.fillStyle = powerUp.color;
            ctx.fillRect(this.x - barWidth/2, this.y + offsetY, barWidth * progress, barHeight);

            // Draw icon
            ctx.font = '12px Arial';
            ctx.fillText(powerUp.icon, this.x - barWidth/2 - 15, this.y + offsetY + barHeight);

            offsetY += 10;
        }
    }

    activateAutoFire(duration) {
        if (!this.autoFireActive && this.autoFireCooldown <= 0) {
            this.autoFireActive = true;
            this.autoFireDuration = duration;
            
            // Create three concentric laser rings
            const rings = [];
            for (let ring = 0; ring < 3; ring++) {
                const points = 36; // number of points per ring
                const radius = (ring + 1) * Math.max(this.screenWidth, this.screenHeight) / 3;
                
                for (let i = 0; i < points; i++) {
                    const angle = (i / points) * Math.PI * 2;
                    rings.push({
                        x: this.x + Math.cos(angle) * radius,
                        y: this.y + Math.sin(angle) * radius,
                        delay: ring * 200, // delay between rings
                        damage: this.projectileDamage,
                        color: '#FF4444'
                    });
                }
            }
            return rings;
        }
        return null;
    }

    autoFire() {
        //deve sparare un proiettile ogni ottavo di secondo
        if (this.autoFireActive) {
            this.autoFireTimer += 16.67; // 60 FPS
            if (this.autoFireTimer >= 125) {
                this.autoFireTimer = 0;
                return true;
            }
        }
        return false;
    }

    activateAbility(type = 'nova') {
        if (this.abilityCharge < this.abilityMaxCharge || this.abilityCooldown > 0) return null;

        const explosions = [];
        const points = 200;
        const maxRadius = Math.max(this.screenWidth, this.screenHeight);

        if (type === 'nova') {
            // Expanding nova effect from station
            for (let i = 0; i < points; i++) {
                const progress = i / points;
                const angle = progress * Math.PI * 2 * 4; // 4 full rotations
                const radius = progress * maxRadius;
                explosions.push({
                    x: this.x + Math.cos(angle) * radius,
                    y: this.y + Math.sin(angle) * radius,
                    delay: i * 20,
                    color: '#44AAFF',
                    damage: 50
                });
            }
            this.novaActive = true;
            this.novaDuration = this.novaMaxDuration;
        } else {
            // Vortex effect (also starts from station)
            for (let i = 0; i < points; i++) {
                const progress = i / points;
                const angle = progress * Math.PI * 2 * 4;
                const radius = (1 - progress) * maxRadius; // Inverted radius for inward effect
                explosions.push({
                    x: this.x + Math.cos(angle) * radius,
                    y: this.y + Math.sin(angle) * radius,
                    delay: i * 20,
                    color: '#FF44AA',
                    damage: 30,
                    pullForce: 8 * progress // Stronger pull as it gets closer
                });
            }
            this.vortexActive = true;
            this.vortexDuration = this.vortexMaxDuration;
        }

        this.abilityCharge = 0;
        this.abilityCooldown = this.abilityCooldownTime;
        return explosions;
    }

    deactivateAbility(type = 'nova') {
        if (type === 'nova') {
            this.novaActive = false;
            this.novaDuration = 0;
        } else {
            this.vortexActive = false;
            this.vortexDuration = 0;
            this.vortexRadius = 0;
        }
    }

    getAbilityProgress() {
        if (this.novaActive || this.vortexActive) {
            return Math.max(
                this.novaDuration / this.novaMaxDuration,
                this.vortexDuration / this.vortexMaxDuration
            );
        }
        if (this.abilityCooldown > 0) {
            return 1 - (this.abilityCooldown / this.abilityCooldownTime);
        }
        return this.abilityCharge / this.abilityMaxCharge;
    }

    getAutoFireProgress() {
        if (this.autoFireActive) {
            return this.autoFireDuration / this.autoFireMaxDuration;
        } else if (this.autoFireCooldown > 0) {
            return this.autoFireCooldown / this.autoFireCooldownTime;
        }
        return this.autoFireCharge / 100;
    }

    getChargeProgress() {
        if (this.superAbilityActive) {
            return this.superAbilityDuration / this.superAbilityMaxDuration;
        }
        if (this.superAbilityCooldown > 0) {
            return 1 - (this.superAbilityCooldown / this.superAbilityCooldownTime);
        }
        return this.superAbilityCharge / this.superAbilityMaxCharge;
    }

    isInCooldown() {
        return this.superAbilityCooldown > 0;
    }

    addPowerUp(type, effect, duration, color, icon, remove) {
        // Rimuovi il vecchio power-up dello stesso tipo se esiste
        if (this.activePowerUps.has(type)) {
            this.activePowerUps.get(type).remove(this);
        }

        if (duration > 0) {
            this.activePowerUps.set(type, {
                remainingTime: duration,
                duration: duration,
                color: color,
                icon: icon,
                remove: remove
            });
        }

        // Applica l'effetto
        effect(this);
    }
}