export class FloatingText {
    constructor(x, y, text, type = 'default') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.type = type;
        this.alpha = 1;
        this.scale = 1.5;
        this.lifetime = 0;
        this.maxLifetime = 1000; // 1 second
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: -2
        };
    }

    update() {
        this.lifetime += 16; // Assuming ~60fps
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha = Math.max(0, 1 - (this.lifetime / this.maxLifetime));
        
        // Special effects based on type
        switch(this.type) {
            case 'wave':
            case 'wave-complete':
                this.scale = 1 + Math.sin(this.lifetime / 100) * 0.2;
                this.maxLifetime = 2000;
                break;
            case 'super':
                this.scale = 2 - (this.lifetime / this.maxLifetime);
                this.maxLifetime = 1500;
                break;
            case 'powerup':
                this.velocity.y = -3;
                this.scale = 1.2;
                break;
        }

        return this.lifetime < this.maxLifetime;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Style based on type
        switch(this.type) {
            case 'damage':
                ctx.fillStyle = '#ff4444';
                ctx.font = `${16 * this.scale}px Arial`;
                break;
            case 'reward':
                ctx.fillStyle = '#ffdd44';
                ctx.font = `bold ${18 * this.scale}px Arial`;
                break;
            case 'wave':
            case 'wave-complete':
                ctx.fillStyle = '#44ffdd';
                ctx.font = `bold ${24 * this.scale}px Arial`;
                break;
            case 'super':
                ctx.fillStyle = '#ff44ff';
                ctx.font = `bold ${28 * this.scale}px Arial`;
                break;
            case 'stolen':
                ctx.fillStyle = '#ff0000';
                ctx.font = `bold ${20 * this.scale}px Arial`;
                break;
            case 'powerup':
                ctx.fillStyle = '#44ff44';
                ctx.font = `bold ${20 * this.scale}px Arial`;
                break;
            default:
                ctx.fillStyle = 'white';
                ctx.font = `${16 * this.scale}px Arial`;
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.text, this.x, this.y);
        
        ctx.restore();
    }
}
