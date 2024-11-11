export class GameOverPopup {
    constructor(gameStats, onRetry) {
        this.gameStats = gameStats;
        this.onRetry = onRetry;
        this.element = this.createPopup();
        document.body.appendChild(this.element);
    }

    createPopup() {
        const popup = document.createElement('div');
        popup.style.cssText = this.getPopupStyles();
        popup.innerHTML = this.createStatsHTML();

        const retryButton = this.createRetryButton();
        popup.appendChild(retryButton);

        return popup;
    }

    getPopupStyles() {
        return `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            z-index: 1000;
            min-width: 300px;
        `;
    }

    createStatsHTML() {
        return `
            <h2 style="color: white; font-size: 2.5em; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                Game Over!
            </h2>
            <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <table style="width: 100%; color: white; font-size: 1.2em; text-align: left;">
                    ${this.createStatsRows()}
                </table>
            </div>
        `;
    }

    createStatsRows() {
        const stats = [
            { icon: '🎯', label: 'Final Score', value: this.gameStats.score },
            { icon: '⏱️', label: 'Survival Time', value: this.gameStats.time },
            { icon: '💀', label: 'Enemies Defeated', value: this.gameStats.enemiesKilled },
            { icon: '💰', label: 'Credits Earned', value: this.gameStats.credits },
            { icon: '⚡', label: 'Final Difficulty', value: `${this.gameStats.difficulty}x` }
        ];

        return stats.map(stat => `
            <tr>
                <td>${stat.icon} ${stat.label}:</td>
                <td>${stat.value}</td>
            </tr>
        `).join('');
    }

    createRetryButton() {
        const button = document.createElement('button');
        button.textContent = 'Play Again';
        button.style.cssText = `
            background: #ffd93d;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 1.2em;
            cursor: pointer;
            transition: transform 0.2s;
            &:hover {
                transform: scale(1.1);
            }
        `;

        button.addEventListener('click', () => {
            this.close();
            this.onRetry();
        });

        return button;
    }

    close() {
        document.body.removeChild(this.element);
    }
}
