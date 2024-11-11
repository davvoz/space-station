import { GAME_CONFIG } from '../../config/GameConfig.js';

export class SoundManager {
    constructor() {
        this.sounds = this.initializeSounds();
        this.muted = false;
    }

    initializeSounds() {
        const sounds = {
            shoot: document.getElementById('shootSound'),
            explosion: document.getElementById('explosionSound'),
            coinEarn: document.getElementById('coinEarnSound'),
            coinSpend: document.getElementById('coinSpendSound'),
            combo: document.getElementById('comboSound'),
            bossMusic: document.getElementById('bossMusic'),
            background: document.getElementById('background'),
            fail: document.getElementById('failSound')
        };

        Object.values(sounds).forEach(sound => {
            if (sound) {
                sound.volume = sound.id === 'background' ? 0.3 : GAME_CONFIG.SOUND_VOLUME;
            }
        });

        return sounds;
    }

    play(soundName) {
        if (!this.muted && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play();
        }
    }

    playBackgroundMusic() {
        const bgMusic = this.sounds.background;
        if (!bgMusic) return;

        bgMusic.loop = true;

        const startMusic = () => {
            bgMusic.play().catch(e => console.warn('Background music autoplay prevented:', e));
            document.removeEventListener('click', startMusic);
        };

        document.addEventListener('click', startMusic);
    }

    stopBackgroundMusic() {
        if (this.sounds.background) {
            this.sounds.background.pause();
            this.sounds.background.currentTime = 0;
        }
    }

    setMuted(muted) {
        this.muted = muted;
    }
}
