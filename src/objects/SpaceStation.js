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
        this.autoFireKills = 0;           // Current kill count
        this.autoFireKillsRequired = 10;  // Kills needed to activate
        this.autoFireDuration = 0;
        this.autoFireMaxDuration = 0;
        this.autoFireCharge = 0;
        this.autoFireMaxCharge = 10;   // Requires 10 kills to charge
        this.killCount = 0;

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

        // Add autoFireTimer to the constructor
        this.autoFireTimer = 0;

        // Add damage effect properties
        this.damageEffectDuration = 0;
        this.maxDamageEffectDuration = 500; // 500ms di effetto rosso
        this.baseHealth = 150; // Add base health value
    }

    applyInvincibility(duration) {
        this.invincible = true;
        this.invincibilityDuration = duration;
        this.invincibilityAlpha = 1.0;
    }

    update(currentTime) {
        const deltaTime = currentTime - this.lastUpdate;
        
        this.updateMovement();
        this.updateInvincibility(deltaTime);
        this.updateAbilities(deltaTime);
        this.updatePowerUps(deltaTime);
        
        // Aggiorna l'effetto di danno
        if (this.damageEffectDuration > 0) {
            this.damageEffectDuration = Math.max(0, this.damageEffectDuration - 16.67); // 60fps
        }

        this.lastUpdate = currentTime;
    }

    updateMovement() {
        const keys = this.getKeys();
        
        // Calculate movement vector
        this.dx = (keys.ArrowRight ? this.speed : 0) - (keys.ArrowLeft ? this.speed : 0);
        this.dy = (keys.ArrowDown ? this.speed : 0) - (keys.ArrowUp ? this.speed : 0);

        // Apply movement
        this.x = Math.max(this.radius, Math.min(this.screenWidth - this.radius, this.x + this.dx));
        this.y = Math.max(this.radius, Math.min(this.screenHeight - this.radius, this.y + this.dy));
    }

    updateInvincibility(deltaTime) {
        if (!this.invincible) return;
        
        this.invincibilityDuration -= deltaTime;
        this.invincibilityAlpha = Math.max(0, this.invincibilityDuration / this.invincibilityMaxDuration);

        if (this.invincibilityDuration <= 0) {
            this.invincible = false;
            this.invincibilityDuration = 0;
            this.invincibilityAlpha = 0;
        }
    }

    updateAbilities(deltaTime) {
        this.updateAutoFire(deltaTime);
        this.updateNovaAndVortex(deltaTime);
        this.updateAbilityCharge(deltaTime);
    }

    updateAutoFire(deltaTime) {
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
                this.autoFireCharge = 100;
            }
        } else {
            this.autoFireCharge = 100;
        }
    }

    updateNovaAndVortex(deltaTime) {
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
    }

    updateAbilityCharge(deltaTime) {
        if (!this.novaActive && !this.vortexActive) {
            if (this.abilityCooldown > 0) {
                this.abilityCooldown = Math.max(0, this.abilityCooldown - deltaTime);
            } else if (this.abilityCharge < this.abilityMaxCharge) {
                this.abilityCharge = Math.min(
                    this.abilityMaxCharge,
                    this.abilityCharge + (this.abilityChargeRate * deltaTime / 500)
                );
            }
        }

        if (this.superAbilityCharge < this.superAbilityMaxCharge) {
            this.superAbilityCharge += 0.1;
        }
    }

    updatePowerUps(deltaTime) {
        for (const [type, powerUp] of this.activePowerUps.entries()) {
            powerUp.remainingTime -= deltaTime;
            if (powerUp.remainingTime <= 0) {
                powerUp.remove(this);
                this.activePowerUps.delete(type);
            }
        }
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
        this.activateDamageEffect();
        return true; // Damage was applied
    }

    draw(ctx) {
        this.drawShield(ctx);
        this.drawInvincibility(ctx);
        this.drawMainBody(ctx);
        this.drawInnerDetails(ctx);
        this.drawDockingPorts(ctx);
        this.drawTurrets(ctx);
        this.drawCentralAntenna(ctx);
        this.drawHealthBar(ctx);
        this.drawPowerUpStatusBars(ctx);

        // Disegna l'effetto di danno se attivo
        if (this.damageEffectDuration > 0) {
            const alpha = (this.damageEffectDuration / this.maxDamageEffectDuration) * 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Secondo cerchio per un effetto più intenso
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 0, 0, ${alpha * 1.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    drawShield(ctx) {
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
    }

    drawInvincibility(ctx) {
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
    }

    drawMainBody(ctx) {
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
    }

    drawInnerDetails(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = '#80e0ff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawDockingPorts(ctx) {
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
    }

    drawTurrets(ctx) {
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
    }

    drawCentralAntenna(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius * 0.7);
        ctx.lineTo(this.x, this.y + this.radius * 0.7);
        ctx.moveTo(this.x - this.radius * 0.7, this.y);
        ctx.lineTo(this.x + this.radius * 0.7, this.y);
        ctx.strokeStyle = '#80e0ff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawHealthBar(ctx) {
        const barWidth = 50;
        const barHeight = 6;
        const barSpacing = 4;
        const baseY = this.y + this.radius + 10;

        // Draw base health bar (first 150 HP)
        const baseHealthAmount = Math.min(this.health, this.baseHealth);
        ctx.fillStyle = '#304060';
        ctx.fillRect(this.x - barWidth / 2, baseY, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth / 2, baseY, barWidth * (baseHealthAmount / this.baseHealth), barHeight);

        // Draw bonus health bars
        let remainingHealth = Math.max(0, this.health - this.baseHealth);
        for (let i = 0; i < Math.floor((this.maxHealth - this.baseHealth) / this.baseHealth); i++) {
            const currentBarHealth = Math.min(remainingHealth, this.baseHealth);
            const barY = baseY + (barHeight + barSpacing) * (i + 1);
            
            // Background
            ctx.fillStyle = '#304060';
            ctx.fillRect(this.x - barWidth / 2, barY, barWidth, barHeight);
            
            // Health fill with different colors for each bar
            ctx.fillStyle = `hsl(${120 + i * 30}, 100%, 50%)`;
            ctx.fillRect(
                this.x - barWidth / 2, 
                barY, 
                barWidth * (currentBarHealth / this.baseHealth), 
                barHeight
            );
            
            remainingHealth -= this.baseHealth;
        }
    }

    drawPowerUpStatusBars(ctx) {
        let offsetY = -50;
        for (const [type, powerUp] of this.activePowerUps.entries()) {
            const progress = powerUp.remainingTime / powerUp.duration;
            const barWidth = 60;
            const barHeight = 6;

            // Draw bar background
            ctx.fillStyle = '#304060';
            ctx.fillRect(this.x - barWidth / 2, this.y + offsetY, barWidth, barHeight);

            // Draw progress bar
            ctx.fillStyle = powerUp.color;
            ctx.fillRect(this.x - barWidth / 2, this.y + offsetY, barWidth * progress, barHeight);

            // Draw icon
            ctx.font = '12px Arial';
            ctx.fillText(powerUp.icon, this.x - barWidth / 2 - 15, this.y + offsetY + barHeight);

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
        if (this.autoFireActive) {
            this.autoFireTimer += 16.67; // Assuming 60 FPS
            // Convert fireRate to milliseconds (fireRate is shots per second)
            const fireInterval = 1000 / this.fireRate;
            if (this.autoFireTimer >= fireInterval) {
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

    addKill() {
        if (!this.autoFireActive) {
            this.autoFireKills = Math.min(this.autoFireKillsRequired, this.autoFireKills + 1);
        }
    }

    activateAutoFire(waveNumber) {
        if (this.autoFireKills >= this.autoFireKillsRequired && !this.autoFireActive) {
            this.autoFireActive = true;
            // Modifica qui: base 5 secondi + 1 secondo per wave, massimo 15 secondi
            this.autoFireDuration = Math.min(15000, 5000 + waveNumber * 1000);
            this.autoFireMaxDuration = this.autoFireDuration;
            this.autoFireKills = 0; // Reset kills after activation
            return true;
        }
        return false;
    }

    activateDamageEffect() {
        this.damageEffectDuration = this.maxDamageEffectDuration;
    }
}