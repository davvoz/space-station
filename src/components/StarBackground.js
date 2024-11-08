import { UIComponent } from '../ui/components/UIComponent.js';
import { ColorUtils } from '../utils/ColorUtils.js';

export class StarBackground extends UIComponent {
    constructor(ctx, width, height) {
        super(ctx, 0, 0, width, height);
        this.stars = [];
        this.clouds = [];
        this.lastTime = performance.now();
        this.initializeBackground();
    }

    initializeBackground() {
        this.initStars();
        this.initClouds();
    }

    initStars() {
        const STAR_COUNT = 100;
        this.stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 5.5 + 0.5,
            speed: Math.random() * 2 + 0.2,
            brightness: 0.3 + Math.random() * 0.7
        }));
    }

    initClouds() {
        const CLOUD_COUNT = 8;
        const CLOUD_COLORS = [
            ['rgba(41, 98, 255, 0.015)', 'rgba(0, 89, 255, 0.025)'],    // Blue
            ['rgba(255, 61, 87, 0.015)', 'rgba(255, 0, 0, 0.025)'],     // Red
            ['rgba(255, 123, 0, 0.015)', 'rgba(255, 81, 0, 0.025)']     // Orange
        ];

        this.clouds = Array.from({ length: CLOUD_COUNT }, () => ({
            x: (Math.random() - 0.5) * this.width * 2,
            y: (Math.random() - 0.5) * this.height * 2,
            z: Math.random() * 1000 + 500,
            width: Math.random() * 600 + 400,
            height: Math.random() * 400 + 200,
            speed: Math.random() * 0.15 + 0.05,
            color: CLOUD_COLORS[Math.floor(Math.random() * CLOUD_COLORS.length)],
            noise: Math.random() * 50,
            phase: Math.random() * Math.PI * 2,
            scale: 1
        }));
    }

    project(x, y, z) {
        const factor = this.perspective / (this.perspective + z);
        return {
            x: this.width / 2 + x * factor,
            y: this.height / 2 + y * factor,
            scale: factor
        };
    }

    draw() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Save context state
        this.ctx.save();

        // Clear the canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Update and draw stars
        this.updateStars(deltaTime);
        this.drawStars();
        
        // Update and draw clouds
        this.updateClouds(deltaTime);
        this.drawClouds(currentTime);

        // Restore context state
        this.ctx.restore();
    }

    updateStars(deltaTime) {
        this.stars.forEach(star => {
            star.y += star.speed * deltaTime * 60;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
                star.brightness = 0.3 + Math.random() * 0.7;
            }
        });
    }

    updateClouds(deltaTime) {
        this.clouds.forEach(cloud => {
            cloud.y += cloud.speed * deltaTime * 60;
            if (cloud.y > this.height + cloud.height / 2) {
                cloud.y = -cloud.height;
                cloud.x = Math.random() * this.width;
                cloud.phase = Math.random() * Math.PI * 2;
            }
        });
    }

    drawStars() {
        this.ctx.save();
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fillRect(
                Math.round(star.x),
                Math.round(star.y),
                star.size,
                star.size
            );
        });
        this.ctx.restore();
    }

    drawClouds(currentTime) {
        this.ctx.save();
        this.clouds.sort((a, b) => b.z - a.z); // Draw far clouds first
        this.clouds.forEach(cloud => {
            const projected = this.project(cloud.x, cloud.y, cloud.z);
            const scale = projected.scale;
            const pulse = Math.sin(currentTime * this.pulseSpeed) * 0.2 + 1;
            const currentWidth = cloud.width * pulse;
            const currentHeight = cloud.height * pulse;
            
            const centerX = projected.x;
            const centerY = projected.y;
            const timeOffset = currentTime / 2000;
            
            const gradient = this.ctx.createRadialGradient(
                centerX + Math.sin(timeOffset + cloud.phase) * cloud.noise * scale,
                centerY + Math.cos(timeOffset + cloud.phase) * cloud.noise * scale,
                0,
                centerX,
                centerY,
                (cloud.width + cloud.height) / 4 * scale
            );
            
            gradient.addColorStop(0, cloud.color[0]);
            gradient.addColorStop(0.5, cloud.color[1]);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.ellipse(
                centerX,
                centerY,
                currentWidth / 2 * scale,
                currentHeight / 2 * scale,
                0,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
        });
        this.ctx.restore();
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.initializeBackground();
    }

    setColorScheme(scheme) {
        // Potential future enhancement for different color schemes
        // Example: 'space', 'sunset', 'aurora', etc.
    }
}
