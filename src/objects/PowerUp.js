import { GameObject } from './GameObject.js';
export class PowerUp extends GameObject {
    constructor(x, y, type) {
        super(x, y, 30); // Increased radius to 30 for larger icons
        this.type = type;
        this.powerupInfo = this.getPowerUpInfo(type); // Ensure powerupInfo is defined
        this.duration = 10000;
        this.animationAngle = 0;
        this.pulseSize = 0;

        // Add movement properties
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1;
        this.amplitude = 20;
        this.baseY = y;
        this.time = 0;
    }

    getPowerUpInfo(type) {
        const powerupTypes = {
            speed: { 
                color: 'blue', 
                icon: '⚡', 
                duration: 10000,
                effect: (station) => {
                    station.baseSpeed = station.speed;
                    station.speed *= 1.5;
                },
                remove: (station) => {
                    station.speed = station.baseSpeed;
                }
            },
            shield: { 
                color: 'cyan', 
                icon: '🛡️', 
                duration: 15000,
                effect: (station) => {
                    station.shield += 50;
                    station.bonusShield = true;
                },
                remove: (station) => {
                    station.bonusShield = false;
                }
            },
            damage: { 
                color: 'red', 
                icon: '💥', 
                duration: 8000,
                effect: (station) => {
                    station.baseDamage = station.projectileDamage;
                    station.projectileDamage *= 2;
                },
                remove: (station) => {
                    station.projectileDamage = station.baseDamage;
                }
            },
            multi: { 
                color: 'purple', 
                icon: '🔫', 
                duration: 12000,
                effect: (station) => {
                    station.baseTurrets = station.turrets;
                    station.turrets += 2;
                },
                remove: (station) => {
                    station.turrets = station.baseTurrets;
                }
            },
            health: { 
                color: 'green', 
                icon: '❤️',
                duration: 0, // istantaneo
                effect: (station) => {
                    station.health = Math.min(station.maxHealth, station.health + 50);
                }
            },
            invincibility: { 
                color: 'yellow', 
                icon: '⭐', 
                duration: 5000,
                effect: (station) => station.applyInvincibility(5000),
                remove: () => {} // La rimozione è già gestita da applyInvincibility
            }
        };
        return powerupTypes[type];
    }

    update() {
        // Float in a circular pattern
        this.time += 0.02;
        this.x += Math.cos(this.angle) * this.speed;
        this.y = this.baseY + Math.sin(this.time) * this.amplitude;

        // Bounce off screen edges
        if (this.x < this.radius || this.x > window.innerWidth - this.radius) {
            this.angle = Math.PI - this.angle;
        }
        if (this.y < this.radius || this.y > window.innerHeight - this.radius) {
            this.baseY = Math.max(this.radius, Math.min(window.innerHeight - this.radius, this.baseY));
        }
    }

    draw(ctx) {
        // Update animation
        this.animationAngle += 0.02;
        this.pulseSize = Math.sin(this.animationAngle) * 5;

        // Draw glow effect
        ctx.save();
        ctx.shadowColor = this.powerupInfo.color;
        ctx.shadowBlur = 15;
        
        // Draw outer rotating halo
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = this.animationAngle + (Math.PI * 2 * i / 8);
            const x = this.x + Math.cos(angle) * (this.radius + 8); // Adjusted halo distance
            const y = this.y + Math.sin(angle) * (this.radius + 8);
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2); // Slightly larger halo dots
            ctx.fillStyle = this.powerupInfo.color;
            ctx.fill();
        }

        // Draw main powerup circle with pulse effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + this.pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = this.powerupInfo.color;
        ctx.fill();

        // Draw inner circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff33';
        ctx.fill();

        // Draw icon with larger size
        ctx.shadowBlur = 0;
        ctx.font = 'bold 32px Arial'; // Increased font size to 32px
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.powerupInfo.icon, this.x, this.y);
        
        ctx.restore();
    }

    apply(station) {
        this.powerupInfo.effect(station);
    }
}
