import { SpaceStation } from './objects/SpaceStation.js';

// Initialize keyboard controls
window.keysPressed = {};

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create space station
    const spaceStation = new SpaceStation(canvas.width / 2, canvas.height / 2);
    console.log('Space station created at:', spaceStation.x, spaceStation.y);

    // Key handlers
    window.addEventListener('keydown', (event) => {
        event.preventDefault();
        window.keysPressed[event.code] = true;
        console.log('Key pressed:', event.code);
    });

    window.addEventListener('keyup', (event) => {
        event.preventDefault();
        window.keysPressed[event.code] = false;
    });

    // Game loop
    function gameLoop() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw space station
        spaceStation.update(Date.now());
        spaceStation.draw(ctx);
        
        // Continue loop
        requestAnimationFrame(gameLoop);
    }

    // Start game
    console.log('Starting game loop...');
    gameLoop();
});

// Add some basic styles
const styles = document.createElement('style');
styles.textContent = `
    body { margin: 0; overflow: hidden; background: black; }
    canvas { display: block; }
`;
document.head.appendChild(styles);