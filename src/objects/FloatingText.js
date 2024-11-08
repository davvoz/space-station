export class FloatingText {
    constructor(x, y, text, type = 'damage') {
        this.x = x;
        this.y = y;
        this.text = text;
        this.type = type; // 'damage' or 'reward'
        this.life = 1.0; // From 1.0 to 0.0
        this.velocity = {
            x: (Math.random() - 0.5) * 2,
            y: -2
        };
        
        // Size based on value
        const value = parseInt(text);
        this.size = Math.min(40, Math.max(20, 20 + value / 10));
        
        // Color based on type
        this.color = type === 'damage' ? '#ff4444' : '#ffdd44';
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.1; // Gravity effect
        this.life -= 0.02;
        return this.life > 0;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        const alpha = Math.min(1, this.life * 2);
        
        // Draw text outline
        ctx.font = `bold ${this.size}px Arial`;
        ctx.strokeStyle = 'rgba(0,0,0,' + alpha + ')';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText(this.text, this.x, this.y);
        
        // Draw text
        ctx.fillStyle = `rgba(${this.color},${alpha})`;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}
