import { GameObject } from './GameObject.js';

export class SpaceStation extends GameObject {
    constructor(x, y) {
        super(x, y, 30);
        this.health = 150;
        this.maxHealth = 150;
        this.level = 1;
        this.turrets = 2;
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

        // Reset super ability properties correttamente
        this.superAbilityCharge = 0;          // Parte da 0
        this.superAbilityMaxCharge = 100;     // Massimo 100
        this.superAbilityChargeRate = 15;     // Velocità di ricarica
        this.superAbilityActive = false;
        this.superAbilityDuration = 0;
        this.superAbilityMaxDuration = 5000;
        this.superAbilityCooldown = 0;
        this.superAbilityCooldownTime = 15000;

        // Modify/add these movement properties
        this.speed = 5;
        this.dx = 0;
        this.dy = 0;
        this.maxSpeed = 5;
    }

    applyInvincibility(duration) {
        this.invincible = true;
        this.invincibilityDuration = duration;
        this.invincibilityAlpha = 1.0;
    }

    update(currentTime) {
        const keys = this.getKeys();
        
        // Add debug logging
        if (Object.values(keys).some(key => key)) {
            console.log('Keys pressed:', keys);
            console.log('Current position:', this.x, this.y);
        }
        
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

        // Update super ability state
        if (this.superAbilityActive) {
            // During activation
            this.superAbilityDuration -= deltaTime;
            if (this.superAbilityDuration <= 0) {
                this.deactivateSuperAbility();
            }
        } else if (this.superAbilityCooldown > 0) {
            // During cooldown
            this.superAbilityCooldown = Math.max(0, this.superAbilityCooldown - deltaTime);
            if (this.superAbilityCooldown <= 0) {
                this.superAbilityCharge = 0; // Reset charge when cooldown ends
            }
        } else {
            // During normal charging
            if (this.superAbilityCharge < this.superAbilityMaxCharge) {
                this.superAbilityCharge = Math.min(
                    this.superAbilityMaxCharge,
                    this.superAbilityCharge + (this.superAbilityChargeRate * deltaTime / 1000)
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
    }

    activateAutoFire(duration) {
        if (!this.autoFireActive && this.autoFireCooldown <= 0) {
            this.autoFireActive = true;
            this.autoFireDuration = duration;
            this.autoFireTimer = 0;
            return true;
        }
        return false;
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

    activateSuperAbility() {
        if (!this.superAbilityActive && this.superAbilityCooldown <= 0 &&
            this.superAbilityCharge >= this.superAbilityMaxCharge) {

            this.superAbilityActive = true;
            this.superAbilityDuration = this.superAbilityMaxDuration;
            this.superAbilityCharge = 0;

            // Create a more impressive explosion wave
            const explosions = [];
            // Inner ring
            for (let i = 0; i < 360; i += 10) {
                const rad = i * Math.PI / 180;
                explosions.push({
                    x: this.x + Math.cos(rad) * (this.radius * 2),
                    y: this.y + Math.sin(rad) * (this.radius * 2),
                    delay: i * 5
                });
            }
            // Outer ring
            for (let i = 0; i < 360; i += 15) {
                const rad = i * Math.PI / 180;
                explosions.push({
                    x: this.x + Math.cos(rad) * (this.radius * 3),
                    y: this.y + Math.sin(rad) * (this.radius * 3),
                    delay: i * 5 + 500
                });
            }
            // Spiral pattern
            for (let i = 0; i < 720; i += 20) {
                const rad = i * Math.PI / 180;
                const distance = this.radius * (1 + i / 360);
                explosions.push({
                    x: this.x + Math.cos(rad) * distance,
                    y: this.y + Math.sin(rad) * distance,
                    delay: i * 2
                });
            }
            return explosions;
        }
        return null;
    }

    deactivateSuperAbility() {
        this.superAbilityActive = false;
        this.superAbilityDuration = 0;
        this.superAbilityCooldown = this.superAbilityCooldownTime;
        this.superAbilityCharge = 0;
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
}