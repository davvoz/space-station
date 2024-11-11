export class AbilityButtons {
    constructor(ctx) {
        this.ctx = ctx;
    }

    draw(station, startX, startY, size, spacing) {
        // Nova ability (expanding)
        this.drawAbilityButton(
            startX,
            startY,
            size,
            '🌟',
            station.novaActive,
            station.getAbilityProgress(),
            'Nova [space]',
            '#44AAFF',
            '#0044AA',
            '7',
            station.abilityCooldown > 0
        );

        // Vortex ability (contracting)
        this.drawAbilityButton(
            startX + size + spacing,
            startY,
            size,
            '🌀',
            station.vortexActive,
            station.getAbilityProgress(),
            'Vortex [ctrl]',
            '#FF44AA',
            '#AA0044',
            '8',
            station.abilityCooldown > 0
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
