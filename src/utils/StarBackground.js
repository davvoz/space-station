export class StarBackground {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.stars = [];
        this.clouds = [];
        this.initStars();
        this.initClouds();
    }

    initStars() {
        // Crea 100 stelle di sfondo base
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 1.5 + 0.5,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }

    initClouds() {
        // Colori più trasparenti e delicati
        const colors = [
            ['rgba(41, 98, 255, 0.015)', 'rgba(0, 89, 255, 0.025)'], // Blu
            ['rgba(255, 61, 87, 0.015)', 'rgba(255, 0, 0, 0.025)'], // Rosso
            ['rgba(255, 123, 0, 0.015)', 'rgba(255, 81, 0, 0.025)'] // Arancione
        ];

        for (let i = 0; i < 8; i++) { // Aumentiamo il numero di nuvole
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                width: Math.random() * 600 + 400, // Nuvole più larghe
                height: Math.random() * 400 + 200, // Nuvole più alte
                speed: Math.random() * 0.15 + 0.05, // Movimento più lento
                color: color,
                noise: Math.random() * 50 // Valore per deformare la forma
            });
        }
    }

    drawCloud(cloud) {
        const centerX = cloud.x + cloud.width / 2;
        const centerY = cloud.y + cloud.height / 2;

        // Crea più gradienti sovrapposti per un effetto più organico
        for (let i = 0; i < 3; i++) {
            const gradient = this.ctx.createRadialGradient(
                centerX + Math.sin(Date.now() / 2000 + i) * cloud.noise,
                centerY + Math.cos(Date.now() / 2000 + i) * cloud.noise,
                0,
                centerX,
                centerY,
                (cloud.width + cloud.height) / 4
            );

            gradient.addColorStop(0, cloud.color[0]);
            gradient.addColorStop(0.5, cloud.color[1]);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();

            // Forma più organica usando sin/cos
            this.ctx.ellipse(
                centerX + Math.sin(Date.now() / 3000) * cloud.noise,
                centerY + Math.cos(Date.now() / 3000) * cloud.noise,
                cloud.width / 2 + Math.sin(Date.now() / 2000) * 20,
                cloud.height / 2 + Math.cos(Date.now() / 2000) * 20,
                Math.sin(Date.now() / 5000) * Math.PI,
                0,
                Math.PI * 2
            );

            this.ctx.fill();
        }
    }

    draw() {
        // Sfondo base scuro
        this.ctx.save();
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Disegna le nuvole
        this.clouds.forEach(cloud => {
            this.drawCloud(cloud);
            cloud.y += cloud.speed;

            if (cloud.y > this.height + cloud.height / 2) {
                cloud.y = -cloud.height;
                cloud.x = Math.random() * this.width;
            }
        });

        // Disegna le stelle sopra le nuvole
        this.stars.forEach(star => {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.7})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);

            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
        this.ctx.restore();
    }
}
