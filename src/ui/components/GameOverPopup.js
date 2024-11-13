export class GameOverPopup {
    constructor(stats, onClose, isGameOver = false) {
        // Ensure stats has all required properties with defaults
        this.stats = {
            score: stats?.score || 0,
            time: stats?.time || '00:00',
            enemiesKilled: stats?.enemiesKilled || 0,
            credits: stats?.credits || 0,
            wave: stats?.wave || 1
        };
        this.createPopup(this.stats, onClose, isGameOver);
    }

    createPopup(stats, onClose, isGameOver) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        
        const content = document.createElement('div');
        content.className = 'popup-content';

        // Funzione per animare i numeri
        const animateValue = (element, start, end, duration) => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                element.textContent = Math.floor(progress * (end - start) + start);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        };

        // Modifica il contenuto per aggiungere le icone
        const getIcon = (type) => {
            const icons = {
                score: '🎯',
                time: '⏱️',
                kills: '💥',
                credits: '💎',
                wave: '🌊'
            };
            return icons[type] || '';
        };

        const createStatItem = (value, label, type) => `
            <div class="stat-item" data-type="${type}">
                <div class="stat-icon">${getIcon(type)}</div>
                <div class="stat-value" data-value="${value}">0</div>
                <div class="stat-label">${label}</div>
            </div>
        `;

        if (isGameOver) {
            // Game Over popup
            content.innerHTML = `
                <div class="popup-header">
                    <h2>Game Over</h2>
                </div>
                <div class="stats-grid">
                    ${createStatItem(stats.score, 'Final Score', 'score')}
                    ${createStatItem(stats.time, 'Survival Time', 'time')}
                    ${createStatItem(stats.enemiesKilled, 'Total Kills', 'kills')}
                    ${createStatItem(stats.credits, 'Credits Earned', 'credits')}
                    ${createStatItem(stats.wave, 'Final Wave', 'wave')}
                </div>
                <button id="restartGame" class="popup-btn">⚔️ Play Again ⚔️</button>
            `;

            const restartBtn = content.querySelector('#restartGame');
            restartBtn.addEventListener('click', () => {
                window.location.reload();
            });
        } else {
            // Pause popup
            content.innerHTML = `
                <div class="popup-header">
                    <h2>Game Paused</h2>
                </div>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value" data-value="${stats.score}">0</div>
                        <div class="stat-label">Score</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" data-value="${stats.time}">0</div>
                        <div class="stat-label">Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" data-value="${stats.enemiesKilled}">0</div>
                        <div class="stat-label">Kills</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" data-value="${stats.credits}">0</div>
                        <div class="stat-label">Credits</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" data-value="${stats.wave}">0</div>
                        <div class="stat-label">Wave</div>
                    </div>
                </div>
                <button id="resumeGame" class="popup-btn">Resume Game</button>
                <button id="toggleSound" class="popup-btn">Sound Effects: ${localStorage.getItem('soundEnabled') !== 'false' ? 'ON' : 'OFF'}</button>
                <button id="toggleMusic" class="popup-btn">Music: ${localStorage.getItem('musicEnabled') !== 'false' ? 'ON' : 'OFF'}</button>
            `;

            // Aggiungi event listener per il pulsante Resume
            const resumeBtn = content.querySelector('#resumeGame');
            resumeBtn.addEventListener('click', () => {
                this.close();
                if (onClose) onClose();
            });

            // Event listeners
            const toggleSoundBtn = content.querySelector('#toggleSound');
            const toggleMusicBtn = content.querySelector('#toggleMusic');

            toggleSoundBtn.addEventListener('click', () => {
                const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
                localStorage.setItem('soundEnabled', !soundEnabled);
                toggleSoundBtn.textContent = `Sound Effects: ${!soundEnabled ? 'ON' : 'OFF'}`;
            });

            toggleMusicBtn?.addEventListener('click', () => {
                const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
                localStorage.setItem('musicEnabled', !musicEnabled);
                toggleMusicBtn.textContent = `Music: ${!musicEnabled ? 'ON' : 'OFF'}`;
                const bgMusic = document.getElementById('background');
                if (bgMusic) {
                    !musicEnabled ? bgMusic.play().catch(() => {}) : bgMusic.pause();
                }
            });
        }

        overlay.appendChild(content);
        document.body.appendChild(overlay);

        // Dopo che il popup è stato aggiunto al DOM, anima i valori
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            const statValues = content.querySelectorAll('.stat-value[data-value]');
            statValues.forEach(el => {
                const value = parseInt(el.dataset.value);
                animateValue(el, 0, value, 1000);
            });
        });

        // Improve audio initialization
        const playHoverSound = () => {
            if (localStorage.getItem('soundEnabled') === 'false') return;
            
            const hoverSound = new Audio('./assets/hover.wav');
            hoverSound.volume = 0.2;
            hoverSound.play().catch(err => console.warn('Could not play hover sound'));
        };

        // Add sound effects to buttons
        content.querySelectorAll('.popup-btn').forEach(btn => {
            btn.addEventListener('mouseenter', playHoverSound);
        });

        this.element = overlay;
    }

    close() {
        this.element.classList.remove('active');
        setTimeout(() => this.element.remove(), 300);
    }
}
