import { GameObject } from './GameObject.js';

export class Enemy extends GameObject {
    constructor(x, y, level) {
        // Increased size range: 0.8 to 2.5 (was 0.8 to 1.3)
        const sizeMultiplier = Math.random() * 1.7 + 0.8;
        super(x, y, 15 * sizeMultiplier);
        
        // Adjust stats for larger enemies
        this.health = (15 + (level * 5)) * (sizeMultiplier * 1.5); // More health for bigger enemies
        this.maxHealth = this.health;
        this.damage = (3 + (level * 1)) * Math.sqrt(sizeMultiplier); // Slightly reduced damage scaling
        // Significantly slower for larger sizes
        this.baseSpeed = 0.3 + (level * 0.08);
        this.speed = this.baseSpeed * (1.5 - (sizeMultiplier * 0.4));
        // Better rewards for larger enemies
        this.value = Math.round((10 + (level * 5)) * (sizeMultiplier * 1.2));
        this.scoreValue = Math.round((100 + (level * 50)) * (sizeMultiplier * 1.2));
        this.level = level;
        this.type = 'basic';
        this.color = `rgb(200,${Math.max(0, 200 - level * 20)},${Math.max(0, 200 - level * 20)})`;
        this.behaviorType = Math.floor(Math.random() * 7); // 0-6: different movement patterns
        this.behaviorTimer = 0;
        this.points = Math.floor(Math.random() * 3) + 3; // 3-5 points for polygons

        // Add visual properties
        this.glowIntensity = 0;
        this.baseColor = `rgb(200,${Math.max(0, 200 - level * 20)},${Math.max(0, 200 - level * 20)})`;
        this.accentColor = `hsla(${Math.random() * 360}, 70%, 50%, `; // Note: removed closing parenthesis
        this.rotationSpeed = (Math.random() * 0.02 + 0.01) * (1.5 - sizeMultiplier * 0.4); // Slower rotation for larger enemies
        this.particleCount = Math.floor(3 * Math.sqrt(sizeMultiplier) + 2); // More particles for larger enemies
        this.trailEffect = [];

        // New property for size category
        this.sizeCategory = sizeMultiplier > 1.8 ? 'huge' : 
                           sizeMultiplier > 1.4 ? 'large' : 
                           sizeMultiplier > 1.1 ? 'medium' : 'small';
    }

    update(station, canvasWidth, canvasHeight) {
        // Aggiunge controllo della salute
        if (this.health <= 0) return;
        
        this.moveTowardsTarget(station, canvasWidth, canvasHeight);
        
        // Update trail effect
        if (this.behaviorType >= 3) {
            this.trailEffect.unshift({ x: this.x, y: this.y, age: 0 });
            if (this.trailEffect.length > 10) this.trailEffect.pop();
            this.trailEffect.forEach(p => p.age++);
        }
    }

    moveTowardsTarget(station, canvasWidth, canvasHeight) {
        const dx = station.x - this.x;
        const dy = station.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        switch(this.behaviorType) {
            case 0: // Direct approach (easy)
                if (distance > 0) {
                    this.dx = (dx / distance) * (this.speed * 0.6);
                    this.dy = (dy / distance) * (this.speed * 0.6);
                }
                break;
            case 1: // Wide circling (moderate)
                const angle = Math.atan2(dy, dx) + Math.cos(this.behaviorTimer * 0.05);
                this.dx = Math.cos(angle) * this.speed;
                this.dy = Math.sin(angle) * this.speed;
                this.behaviorTimer++;
                break;
            case 2: // Zigzag approach (moderate)
                if (distance > 0) {
                    this.dx = (dx / distance) * this.speed + Math.sin(this.behaviorTimer * 0.1) * this.speed;
                    this.dy = (dy / distance) * this.speed;
                    this.behaviorTimer++;
                }
                break;
            case 3: // Spiral approach (hard)
                const spiralAngle = Math.atan2(dy, dx) + this.behaviorTimer * 0.02;
                this.dx = Math.cos(spiralAngle) * this.speed * 1.2;
                this.dy = Math.sin(spiralAngle) * this.speed * 1.2;
                this.behaviorTimer++;
                break;
            case 4: // Stop and go (easy)
                if (Math.sin(this.behaviorTimer * 0.05) > 0) {
                    this.dx = (dx / distance) * (this.speed * 0.7);
                    this.dy = (dy / distance) * (this.speed * 0.7);
                } else {
                    this.dx = this.dy = 0;
                }
                this.behaviorTimer++;
                break;
            case 5: // old slow approach (moderate)
                if (distance > 0) {
                    this.dx = (dx / distance) * this.speed * 0.5;
                    this.dy = (dy / distance) * this.speed * 0.5;
                }
                this.behaviorTimer++;
                break;
            case 6: // Figure-8 pattern (hard)
                const t = this.behaviorTimer * 0.03;
                this.dx = Math.cos(t) * this.speed * 1.3;
                this.dy = Math.sin(2 * t) * this.speed * 0.7;
                this.behaviorTimer++;
                break;
        }

        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x + this.dx));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y + this.dy));
    }

    draw(ctx) {
        this.drawBody(ctx);
        this.drawHealthBar(ctx);
    }

    drawBody(ctx) {
        // Adjust trail effect size for larger enemies
        if (this.behaviorType >= 3) {
            this.trailEffect.forEach((p, i) => {
                const alpha = (10 - p.age) / 10;
                const trailSize = this.radius * (this.sizeCategory === 'huge' ? 0.3 : 0.5);
                ctx.beginPath();
                ctx.arc(p.x, p.y, trailSize * alpha, 0, Math.PI * 2);
                ctx.fillStyle = `${this.accentColor}${alpha * 0.3})`;
                ctx.fill();
            });
        }

        // Enhance glow effect for larger enemies
        const glowSize = this.sizeCategory === 'huge' ? 2.5 : 
                        this.sizeCategory === 'large' ? 2.2 : 2;
        const pulseIntensity = Math.sin(this.behaviorTimer * 0.05) * 0.3 + 0.7;
        const glow = ctx.createRadialGradient(
            this.x, this.y, this.radius * 0.5,
            this.x, this.y, this.radius * glowSize
        );
        glow.addColorStop(0, `${this.accentColor}${0.3 * pulseIntensity})`);
        glow.addColorStop(1, `${this.accentColor}0)`);
        ctx.fillStyle = glow;
        ctx.fillRect(this.x - this.radius * 2, this.y - this.radius * 2, 
                    this.radius * 4, this.radius * 4);

        // Main body with behavior-specific effects
        ctx.beginPath();
        if (this.behaviorType <= 2) {
            // Basic enemies with pulsing effect
            const pulseSize = 1 + Math.sin(this.behaviorTimer * 0.1) * 0.1;
            ctx.arc(this.x, this.y, this.radius * pulseSize, 0, Math.PI * 2);
            ctx.fillStyle = this.baseColor;
            ctx.fill();
            
            // Multiple decorative rings
            for (let i = 0; i < 2; i++) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * (0.7 - i * 0.2), 0, Math.PI * 2);
                ctx.strokeStyle = `${this.accentColor}${0.8 - i * 0.3})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        } else {
            // Advanced enemies with dynamic patterns
            this.drawAdvancedEnemy(ctx);
        }

        // Enhanced particle effects
        this.drawParticles(ctx);
    }

    drawAdvancedEnemy(ctx) {
        const rotation = this.behaviorTimer * this.rotationSpeed;
        const waveEffect = Math.sin(this.behaviorTimer * 0.1) * 0.2;
        
        // Outer shape
        ctx.beginPath();
        for (let i = 0; i < this.points; i++) {
            const angle = rotation + (i * 2 * Math.PI / this.points);
            const radiusOffset = this.radius * (1 + waveEffect * Math.sin(angle * 3));
            const px = this.x + Math.cos(angle) * radiusOffset;
            const py = this.y + Math.sin(angle) * radiusOffset;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = this.baseColor;
        ctx.fill();
        ctx.strokeStyle = `${this.accentColor}0.8)`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add extra detail for huge enemies
        if (this.sizeCategory === 'huge') {
            // Extra inner rings
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * (0.8 - i * 0.2), 0, Math.PI * 2);
                ctx.strokeStyle = `${this.accentColor}${0.5 - i * 0.1})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }
    }

    drawParticles(ctx) {
        for (let i = 0; i < this.particleCount; i++) {
            const particleAngle = this.behaviorTimer * 0.1 + (i * Math.PI * 2 / this.particleCount);
            const orbitSize = this.radius * (1.2 + Math.sin(this.behaviorTimer * 0.2) * 0.2);
            const px = this.x + Math.cos(particleAngle) * orbitSize;
            const py = this.y + Math.sin(particleAngle) * orbitSize;
            
            const particleSize = 2 + Math.sin(this.behaviorTimer * 0.2 + i) * 1;
            ctx.beginPath();
            ctx.arc(px, py, particleSize, 0, Math.PI * 2);
            ctx.fillStyle = `${this.accentColor}0.8)`;
            ctx.fill();
        }
    }

    drawHealthBar(ctx) {
        const barWidth = this.radius * 2;
        const barHeight = 3;
        const healthPercent = this.health / this.maxHealth;
        
        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, 
                    barWidth, barHeight);
        
        // Health bar (red only)
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8,
                    barWidth * healthPercent, barHeight);
    }

    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius + other.radius) {
            if (other.invincible) {
                // Bounce effect
                const angle = Math.atan2(dy, dx);
                this.dx = Math.cos(angle) * this.speed * 2;
                this.dy = Math.sin(angle) * this.speed * 2;
                
                // Visual effect
                this.createCollisionEffect();
            }
            return true;
        }
        return false;
    }

    createCollisionEffect() {
        // Visual feedback for shield collision
        this.color = '#FFD700';
        setTimeout(() => {
            this.color = this.baseColor;
        }, 100);
    }
}