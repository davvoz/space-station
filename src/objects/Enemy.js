import { GameObject } from './GameObject.js';

export class Enemy extends GameObject {
    static BEHAVIORS = {
        DIRECT: 0,
        CIRCLING: 1,
        ZIGZAG: 2,
        SPIRAL: 3,
        STOP_GO: 4,
        SLOW: 5,
        FIGURE_EIGHT: 6
    };

    static SIZE_CATEGORIES = {
        SMALL: { min: 0.8, max: 1.1, speedMod: 1.2, healthMod: 0.8 },
        MEDIUM: { min: 1.1, max: 1.4, speedMod: 1.0, healthMod: 1.0 },
        LARGE: { min: 1.4, max: 1.8, speedMod: 0.8, healthMod: 1.3 },
        HUGE: { min: 1.8, max: 2.5, speedMod: 0.6, healthMod: 1.8 }
    };

    constructor(x, y, level) {
        const sizeMultiplier = Enemy.calculateSizeMultiplier();
        super(x, y, 15 * sizeMultiplier);

        this.sizeMultiplier = sizeMultiplier; // Store it as instance property
        this.level = level || 1; // Ensure level has a default value
        
        this.initializeStats(this.level, this.sizeMultiplier);
        this.initializeVisuals(this.level);
        this.sizeCategory = this.determineCategory(this.sizeMultiplier);
        this.behaviorType = Math.floor(Math.random() * Object.keys(Enemy.BEHAVIORS).length);
        this.behaviorTimer = 0;
        this.points = Math.floor(Math.random() * 3) + 3;
        this.trailEffect = [];
    }

    static calculateSizeMultiplier() {
        return Math.random() * 1.7 + 0.8;
    }

    initializeStats(level, sizeMultiplier) {
        const category = this.determineCategory(sizeMultiplier);
        const { speedMod, healthMod } = Enemy.SIZE_CATEGORIES[category];

        this.level = level;
        this.baseSpeed = 0.3 + (level * 0.08);
        this.speed = this.baseSpeed * speedMod;
        this.health = (15 + (level * 5)) * healthMod;
        this.maxHealth = this.health;
        this.damage = (3 + level) * Math.sqrt(sizeMultiplier);
        this.value = Math.round((10 + (level * 5)) * (sizeMultiplier * 1.2));
        this.scoreValue = Math.round((100 + (level * 50)) * (sizeMultiplier * 1.2));
    }

    initializeVisuals(level) {
        const greenValue = Math.max(0, 200 - level * 20);
        this.color = `rgb(200,${greenValue},${greenValue})`;
        this.glowIntensity = 0;
        this.baseColor = this.color;
        this.accentColor = `hsla(${Math.random() * 360}, 70%, 50%, `;
        this.rotationSpeed = (Math.random() * 0.02 + 0.01) * (1.5 - this.sizeMultiplier * 0.4);
        this.particleCount = Math.floor(3 * Math.sqrt(this.sizeMultiplier) + 2);
    }

    determineCategory(size) {
        for (const [category, values] of Object.entries(Enemy.SIZE_CATEGORIES)) {
            if (size >= values.min && size < values.max) return category;
        }
        return 'MEDIUM';
    }

    update(station, canvasWidth, canvasHeight) {
        if (this.health <= 0) return;
        
        super.update(1, canvasWidth, canvasHeight); // Pass canvas dimensions to super.update
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
            case Enemy.BEHAVIORS.DIRECT:
                if (distance > 0) {
                    this.dx = (dx / distance) * (this.speed * 0.6);
                    this.dy = (dy / distance) * (this.speed * 0.6);
                }
                break;
            case Enemy.BEHAVIORS.CIRCLING:
                const angle = Math.atan2(dy, dx) + Math.cos(this.behaviorTimer * 0.05);
                this.dx = Math.cos(angle) * this.speed;
                this.dy = Math.sin(angle) * this.speed;
                this.behaviorTimer++;
                break;
            case Enemy.BEHAVIORS.ZIGZAG:
                if (distance > 0) {
                    this.dx = (dx / distance) * this.speed + Math.sin(this.behaviorTimer * 0.1) * this.speed;
                    this.dy = (dy / distance) * this.speed;
                    this.behaviorTimer++;
                }
                break;
            case Enemy.BEHAVIORS.SPIRAL:
                const spiralAngle = Math.atan2(dy, dx) + this.behaviorTimer * 0.02;
                this.dx = Math.cos(spiralAngle) * this.speed * 1.2;
                this.dy = Math.sin(spiralAngle) * this.speed * 1.2;
                this.behaviorTimer++;
                break;
            case Enemy.BEHAVIORS.STOP_GO:
                if (Math.sin(this.behaviorTimer * 0.05) > 0) {
                    this.dx = (dx / distance) * (this.speed * 0.7);
                    this.dy = (dy / distance) * (this.speed * 0.7);
                } else {
                    this.dx = this.dy = 0;
                }
                this.behaviorTimer++;
                break;
            case Enemy.BEHAVIORS.SLOW:
                if (distance > 0) {
                    this.dx = (dx / distance) * this.speed * 0.5;
                    this.dy = (dy / distance) * this.speed * 0.5;
                }
                this.behaviorTimer++;
                break;
            case Enemy.BEHAVIORS.FIGURE_EIGHT:
                const t = this.behaviorTimer * 0.03;
                this.dx = Math.cos(t) * this.speed * 1.3;
                this.dy = Math.sin(2 * t) * this.speed * 0.7;
                this.behaviorTimer++;
                break;
        }

        // Use the constrainToCanvas method from GameObject
        this.constrainToCanvas(canvasWidth, canvasHeight);
    }

    draw(ctx) {
        this.drawBody(ctx);
        this.drawHealthBar(ctx);
    }

    drawBody(ctx) {
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

        ctx.beginPath();
        if (this.behaviorType <= 2) {
            const pulseSize = 1 + Math.sin(this.behaviorTimer * 0.1) * 0.1;
            ctx.arc(this.x, this.y, this.radius * pulseSize, 0, Math.PI * 2);
            ctx.fillStyle = this.baseColor;
            ctx.fill();
            
            for (let i = 0; i < 2; i++) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * (0.7 - i * 0.2), 0, Math.PI * 2);
                ctx.strokeStyle = `${this.accentColor}${0.8 - i * 0.3})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        } else {
            this.drawAdvancedEnemy(ctx);
        }

        this.drawParticles(ctx);
    }

    drawAdvancedEnemy(ctx) {
        const rotation = this.behaviorTimer * this.rotationSpeed;
        const waveEffect = Math.sin(this.behaviorTimer * 0.1) * 0.2;
        
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

        if (this.sizeCategory === 'huge') {
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
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, 
                    barWidth, barHeight);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8,
                    barWidth * healthPercent, barHeight);
    }

    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.radius + other.radius) {
            // Remove bounce-off behavior and just return true
            return true;
        }
        return false;
    }

    createCollisionEffect() {
        this.color = '#FFD700';
        setTimeout(() => {
            this.color = this.baseColor;
        }, 100);
    }
}