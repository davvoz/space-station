export class GameObject {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.dx = 0;
        this.dy = 0;
        this.isActive = true;
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        this.x += this.dx * deltaTime;
        this.y += this.dy * deltaTime;
        if (canvasWidth && canvasHeight) {
            this.constrainToCanvas(canvasWidth, canvasHeight);
        }
    }

    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + other.radius);
    }

    constrainToCanvas(canvasWidth, canvasHeight) {
        this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
    }
}

export default GameObject;