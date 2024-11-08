import { GAME_CONFIG } from '../config/GameConfig.js';

class ColorUtils {
    static createGradient(ctx, x, y, width, height, colors) {
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        return gradient;
    }
}

class TextUtils {
    static drawText(ctx, text, x, y, font, color, align = 'left', baseline = 'middle') {
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        ctx.fillText(text, x, y);
    }
}

class ShapeUtils {
    static roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y + height, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
    }
}

class ResourceBar {
    constructor(ctx, x, y, width, height, colors) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colors = colors;
    }

    draw(label, value, text, icon = '') {
        value = Math.max(0, Math.min(1, value));
        this.drawBackground();
        this.drawForeground(value);
        this.drawIcon(icon, value);
        this.drawText(text, icon);
    }

    drawBackground() {
        this.ctx.fillStyle = GAME_CONFIG.UI_CONFIG.COLORS.BACKGROUND;
        ShapeUtils.roundRect(this.ctx, this.x, this.y, this.width, this.height, this.height / 2);
        this.ctx.fill();
    }

    drawForeground(value) {
        if (value > 0) {
            try {
                this.ctx.fillStyle = ColorUtils.createGradient(this.ctx, this.x, this.y, this.width, this.height, this.colors);
                ShapeUtils.roundRect(this.ctx, this.x, this.y, this.width * value, this.height, this.height / 2);
                this.ctx.fill();
            } catch (error) {
                console.error('Error creating gradient:', error);
                this.ctx.fillStyle = this.colors[0];
                this.ctx.fillRect(this.x, this.y, this.width * value, this.height);
            }
        }
    }

    drawIcon(icon, value) {
        if (icon) {
            const iconSize = value === 1 ? this.height * 1.5 : this.height;
            const iconColor = value === 1 ? this.colors[1] : '#fff';
            TextUtils.drawText(this.ctx, icon, this.x + this.width / 2, this.y + this.height / 2, `${iconSize}px Arial`, iconColor, 'center', 'middle');
        }
    }

    drawText(text, icon) {
        if (text) {
            const displayText = icon ? `${icon} ${text}` : text;
            TextUtils.drawText(this.ctx, displayText, this.x + this.width + 10, this.y + this.height - 2, GAME_CONFIG.UI_CONFIG.FONTS.SMALL, GAME_CONFIG.UI_CONFIG.COLORS.WHITE);
        }
    }
}

class GameStats {
    constructor(ctx, width) {
        this.ctx = ctx;
        this.width = width;
    }

    draw(gameState, station) {
        const fontSize = 48; // Aumentato significativamente
        this.drawStatsBackground();
        this.drawBigStats(gameState, fontSize);
        this.drawSmallStats(gameState, station, fontSize);
    }

    drawStatsBackground() {
        // Background panel più grande e trasparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.roundRect(10, 10, 300, 120, 15);
        this.ctx.fill();
    }

    drawBigStats(gameState, fontSize) {
        // Helper function for drawing flashy text with neon effect
        const drawTamarroText = (text, x, y, mainColor, glowColor, scale = 1) => {
            const adjustedSize = fontSize * scale;
            this.ctx.font = `bold ${adjustedSize}px "Arial Black"`;
            
            // Multiple layer glow effect
            for (let i = 4; i >= 0; i--) {
                this.ctx.shadowBlur = 15 + i * 2;
                this.ctx.shadowColor = glowColor;
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 4 - i;
                this.ctx.strokeText(text, x, y);
            }
            
            // Chrome gradient fill
            const gradient = this.ctx.createLinearGradient(x, y - adjustedSize, x, y);
            gradient.addColorStop(0, mainColor);
            gradient.addColorStop(0.5, '#FFFFFF');
            gradient.addColorStop(1, mainColor);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillText(text, x, y);
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
        };

        // Position stats in the top-left corner with proper padding
        const baseX = 80;
        const baseY = 60;
        const spacing = 50;
        
        // Draw score with electric blue effect
        drawTamarroText(
            `🎯 ${this.formatNumber(gameState.score)}`,
            baseX,
            baseY,
            '#00FFFF',
            '#0066FF',
            0.8
        );
        
        // Draw credits with golden effect
        drawTamarroText(
            `💰 ${this.formatNumber(gameState.credits)}`,
            baseX,
            baseY + spacing,
            '#FFD700',
            '#FF6600',
            0.8
        );

        // Add pulsating effect for large numbers
        if (gameState.score > 10000 || gameState.credits > 1000) {
            const pulse = Math.sin(Date.now() / 200) * 0.2 + 0.8;
            this.ctx.globalAlpha = pulse;
        }
    }

    drawSmallStats(gameState, station, fontSize) {
        const stats = [
            `⚡ ${gameState.difficultyScaling.toFixed(1)}x`,
            `👾 ${gameState.enemies.length}/${gameState.maxEnemies}`,
            `⚔️ ${(1000/gameState.enemySpawnCooldown).toFixed(1)}/s`
        ];

        this.ctx.font = `bold ${fontSize * 0.3}px Arial`;
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 3;
        
        stats.forEach((stat, index) => {
            this.ctx.fillText(stat, 150, 200 + (index * 25)); // Spostato a sinistra
        }); 
        
        this.ctx.shadowBlur = 0;
    }

    formatNumber(num) {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toFixed(0);
    }
}

class UpgradeBars {
    constructor(ctx, width, upgradeColors) {
        this.ctx = ctx;
        this.width = width;
        this.upgradeColors = upgradeColors;
    }

    draw(gameState, upgradeManager, startX, startY, barWidth, barHeight, spacing) {
        const icons = {
            'Turret': '🔫',
            'Health': '❤️',
            'Fire Rate': '🔥',
            'Damage': '💥',
            'Shield': '🛡️',
            'Speed': '⚡'
        };

        let displayIndex = 0;
        const displayedUpgrades = Object.entries(upgradeManager.upgrades)
            .filter(([name, _]) => name !== 'Auto-Fire' && name !== 'Super Charge');

        displayedUpgrades.forEach(([name, upgrade], index) => {
            const y = startY + (spacing * displayIndex);
            const progress = Math.min(1, gameState.credits / upgrade.cost);
            const canAfford = gameState.credits >= upgrade.cost;

            const resourceBar = new ResourceBar(
                this.ctx,
                startX,
                y,
                barWidth,
                barHeight,
                canAfford ? this.upgradeColors[displayIndex % this.upgradeColors.length] : ['#666', '#444']
            );

            resourceBar.draw(
                name,
                progress,
                `[${index + 1}] ${name} (${upgrade.cost}💰)`,
                icons[name]
            );

            this.drawUpgradeCount(upgradeManager, name, startX, y, barHeight);
            this.drawButtonNumber(index, startX, y, barHeight);

            displayIndex++;
        });
    }

    drawUpgradeCount(upgradeManager, name, startX, y, barHeight) {
        const count = upgradeManager.upgradeCounts[name];
        if (count > 0) {
            TextUtils.drawText(this.ctx, `x${count}`, startX - 5, y + barHeight - 2, 'bold 14px Arial', '#fff', 'right');
        }
    }

    drawButtonNumber(index, startX, y, barHeight) {
        TextUtils.drawText(this.ctx, index + 1, startX - 20, y + barHeight / 2, 'bold 14px Arial', '#fff', 'right', 'middle');
    }
}

class AbilityButtons {
    constructor(ctx) {
        this.ctx = ctx;
    }

    draw(station, startX, startY, size, spacing) {
        this.drawAbilityButton(
            startX,
            startY,
            size,
            '🔫',
            station.autoFireActive,
            1 - station.getAutoFireProgress(),
            'Auto-Fire [7]',
            '#FF4444',
            '#AA0000',
            '7',
            station.autoFireCooldown > 0
        );

        const superCharge = station.getChargeProgress();
        this.drawAbilityButton(
            startX + size + spacing,
            startY,
            size,
            '💫',
            station.superAbilityActive,
            superCharge,
            'Super Nova [8]',
            '#44AAFF',
            '#0044AA',
            '8',
            station.superAbilityCooldown > 0
        );
    }

    drawAbilityButton(x, y, size, icon, isActive, chargePercent, label, color1, color2, keyBind, inCooldown) {
        const ctx = this.ctx;

        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size * 0.45, 0, Math.PI * 2);
        const baseGradient = ctx.createRadialGradient(x + size / 2, y + size / 2, 0, x + size / 2, y + size / 2, size * 0.45);
        baseGradient.addColorStop(0, '#444444');
        baseGradient.addColorStop(1, '#222222');
        ctx.fillStyle = baseGradient;
        ctx.fill();
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (!isActive) {
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size * 0.45, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * (1 - chargePercent)), false);
            const color = inCooldown ? '#666666' : color1;
            ctx.strokeStyle = color;
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.font = `bold ${size * 0.2}px Arial`;
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (inCooldown) {
                ctx.fillStyle = '#FF4444';
                ctx.fillText('COOLDOWN', x + size / 2, y + size / 2 + size * 0.2);
            } else {
                const percentage = Math.floor((1 - chargePercent) * 100);
                ctx.fillStyle = percentage === 100 ? '#44FF44' : '#FFFFFF';
                ctx.fillText(`${percentage}%`, x + size / 2, y + size / 2 + size * 0.2);
            }
        }

        if (!isActive) {
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size * 0.45, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * chargePercent), false);
            const progressGradient = ctx.createLinearGradient(x, y, x + size, y + size);
            if (inCooldown) {
                progressGradient.addColorStop(0, '#666666');
                progressGradient.addColorStop(1, '#444444');
            } else {
                progressGradient.addColorStop(0, color1);
                progressGradient.addColorStop(1, color2);
            }
            ctx.strokeStyle = progressGradient;
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size * 0.35, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * chargePercent), false);
            ctx.strokeStyle = `${color1}44`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if (isActive) {
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size * 0.5, 0, Math.PI * 2);
            const glowGradient = ctx.createRadialGradient(x + size / 2, y + size / 2, size * 0.3, x + size / 2, y + size / 2, size * 0.5);
            glowGradient.addColorStop(0, `${color1}88`);
            glowGradient.addColorStop(1, `${color1}00`);
            ctx.fillStyle = glowGradient;
            ctx.fill();

            const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `${color1}${Math.floor(pulse * 77).toString(16)}`;
            ctx.fill();
        }

        ctx.font = `${size * 0.4}px Arial`;
        ctx.fillStyle = isActive ? color1 : (inCooldown ? '#666666' : '#FFFFFF');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, x + size / 2, y + size / 2);

        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText(label, x + size / 2 + 1, y + size + 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, x + size / 2, y + size + 15);

        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText(keyBind, x + size - 14, y + 16);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(keyBind, x + size - 15, y + 15);
    }
}

class StarBackground {
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
            ['rgba(41, 98, 255, 0.015)', 'rgba(0, 89, 255, 0.025)'],    // Blu
            ['rgba(255, 61, 87, 0.015)', 'rgba(255, 0, 0, 0.025)'],     // Rosso
            ['rgba(255, 123, 0, 0.015)', 'rgba(255, 81, 0, 0.025)']     // Arancione
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
        const centerX = cloud.x + cloud.width/2;
        const centerY = cloud.y + cloud.height/2;
        
        // Crea più gradienti sovrapposti per un effetto più organico
        for(let i = 0; i < 3; i++) {
            const gradient = this.ctx.createRadialGradient(
                centerX + Math.sin(Date.now()/2000 + i) * cloud.noise,
                centerY + Math.cos(Date.now()/2000 + i) * cloud.noise,
                0,
                centerX,
                centerY,
                (cloud.width + cloud.height)/4
            );
            
            gradient.addColorStop(0, cloud.color[0]);
            gradient.addColorStop(0.5, cloud.color[1]);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            
            // Forma più organica usando sin/cos
            this.ctx.ellipse(
                centerX + Math.sin(Date.now()/3000) * cloud.noise,
                centerY + Math.cos(Date.now()/3000) * cloud.noise,
                cloud.width/2 + Math.sin(Date.now()/2000) * 20,
                cloud.height/2 + Math.cos(Date.now()/2000) * 20,
                Math.sin(Date.now()/5000) * Math.PI,
                0,
                Math.PI * 2
            );
            
            this.ctx.fill();
        }
    }

    draw() {
        // Sfondo base scuro
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Disegna le nuvole
        this.clouds.forEach(cloud => {
            this.drawCloud(cloud);
            cloud.y += cloud.speed;
            
            if (cloud.y > this.height + cloud.height/2) {
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
    }
}

class Timer {
    constructor(ctx, width) {
        this.ctx = ctx;
        this.width = width;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    draw(gameTime) {
        const time = this.formatTime(gameTime);
        // Font size responsivo basato sulla larghezza dello schermo
        const fontSize = Math.min(72, this.width * 0.06);
        
        this.ctx.font = `bold ${fontSize}px "Arial Black"`;
        this.ctx.textAlign = 'center';
        
        // Sposta il timer un po' più in basso per non sovrapporsi ad altri elementi
        const yPosition = Math.max(90, this.width * 0.08);
        
        // Contorno nero spesso
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 6;
        this.ctx.strokeText(time, this.width/2, yPosition);
        
        // Contorno dorato
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#B8860B';
        this.ctx.strokeText(time, this.width/2, yPosition);
        
        // Gradiente principale più vibrante
        const gradient = this.ctx.createLinearGradient(this.width/2 - 100, 0, this.width/2 + 100, 0);
        gradient.addColorStop(0, '#FFF200');  // Giallo brillante
        gradient.addColorStop(0.5, '#FFD700'); // Oro
        gradient.addColorStop(1, '#FFA500');   // Arancione
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillText(time, this.width/2, yPosition);
        
        // Bagliore più intenso
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        this.ctx.fillText(time, this.width/2, yPosition);
        this.ctx.shadowBlur = 0;
    }
}

export class GameRenderer {
    constructor(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        this.upgradeColors = this.initializeUpgradeColors();
        this.background = new StarBackground(ctx, width, height);
        this.timer = new Timer(ctx, width);
    }

    initializeUpgradeColors() {
        return [
            ['#4CAF50', '#45a049'],
            ['#9C27B0', '#7B1FA2'],
            ['#FF9800', '#F57C00'],
            ['#2196F3', '#1976D2'],
            ['#F44336', '#D32F2F']
        ];
    }

    clearCanvas() {
        // Instead of just filling with black, draw the animated background
        this.background.draw();
    }

    draw(game) {
        if (!game || !game.state || !game.station) {
            console.warn('Invalid game object passed to renderer');
            return;
        }

        this.clearCanvas();
        
        // Calcola posizioni responsive per gli elementi UI
        const rightMargin = Math.min(150, this.width * 0.1);
        const topMargin = Math.min(20, this.height * 0.03);
        const upgradeBarWidth = Math.min(150, this.width * 0.15);
        
        this.timer.draw(game.state.gameTime);
        
        const gameStats = new GameStats(this.ctx, this.width);
        gameStats.draw(game.state, game.station);

        const upgradeBars = new UpgradeBars(this.ctx, this.width, this.upgradeColors);
        upgradeBars.draw(
            game.state, 
            game.upgradeManager, 
            this.width - upgradeBarWidth - rightMargin, 
            topMargin, 
            upgradeBarWidth, 
            15, 
            25
        );

        const abilityButtons = new AbilityButtons(this.ctx);
        abilityButtons.draw(
            game.station, 
            this.width - upgradeBarWidth - rightMargin, 
            topMargin + Object.keys(game.upgradeManager.upgrades).length * 25 + 40, 
            80, 
            20
        );
    }
}
