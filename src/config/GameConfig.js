export const GAME_CONFIG = {
    MAX_DELTA_TIME: 50,
    SHIELD_DECREASE_INTERVAL: 1000,
    SHIELD_DECREASE_AMOUNT: 5,
    BASE_ENEMY_REWARD: 10,
    BASE_ENEMY_SCORE: 100,
    SOUND_VOLUME: 0.3,
    COMBO_RESET_TIME: 5000, // Time to reset combo counter
    COMBO_THRESHOLD: 10, // Hits required for combo bonus
    COMBO_BONUS: 1000, // Score bonus for combo
    BOSS_SPAWN_TIME: 300000, // Time in ms to spawn boss (5 minutes)
    HEALTH_POWERUP_AMOUNT: 50, // Amount of health restored by health power-up
    INVINCIBILITY_DURATION: 10000, // Duration of invincibility power-up in ms
    UI_CONFIG: {
        COLORS: {
            BACKGROUND: 'rgba(0, 0, 0, 0.3)',
            WHITE: '#FFFFFF',
            PRIMARY: '#44AAFF',
            SECONDARY: '#FF4444',
            SUCCESS: '#44FF44',
            WARNING: '#FFAA44',
            DANGER: '#FF4444'
        },
        FONTS: {
            SMALL: '14px Arial',
            MEDIUM: '18px Arial',
            LARGE: '24px Arial',
            TITLE: 'bold 32px Arial'
        }
    },
    UPGRADE_COLORS: [
        ['#4CAF50', '#45a049'],
        ['#9C27B0', '#7B1FA2'],
        ['#FF9800', '#F57C00'],
        ['#2196F3', '#1976D2'],
        ['#F44336', '#D32F2F']
    ]
};
