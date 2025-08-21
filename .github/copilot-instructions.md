# Space Station Defense Game

Space Station Defense is a JavaScript-based HTML5 Canvas game featuring a central space station defending against waves of enemies. The game uses pure vanilla JavaScript with ES6 modules and runs directly in web browsers.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Running the Game
- Start an HTTP server in the repository root:
  - `python3 -m http.server 8000 --bind 0.0.0.0`
  - Alternative: `python -m http.server 8000` (Python 2.x systems)
  - Alternative: `npx serve .` (if Node.js available)
- Navigate to `http://localhost:8000` in a web browser
- **CRITICAL**: Game requires HTTP server due to ES6 module imports - cannot run via `file://` protocol

### Development Workflow
- Edit JavaScript files directly in `/src` directory
- Refresh browser to see changes immediately
- **No build process required** - pure vanilla JavaScript with ES6 modules
- **No package.json or dependencies** - self-contained codebase

### Testing and Validation
- **Always test these core scenarios after making changes**:
  1. Game loads without JavaScript errors in browser console
  2. Space station appears in center of screen
  3. Enemies spawn automatically (check console logs)
  4. WASD keys move the space station
  5. Space bar fires projectiles
  6. Auto-fire toggle button works
  7. Game over screen appears when station health reaches zero
  8. Play Again button restarts the game

### Syntax Validation
- Run `node -c filename.js` to check individual JavaScript file syntax
- Run `find . -name "*.js" -exec node -c {} \;` to validate all JavaScript files (takes ~2 seconds)
- **No linting tools configured** - rely on manual code review and browser console

## Key Project Structure

### Repository Layout
```
/
├── index.html              # Main entry point
├── src/                   # Source code
│   ├── game/             # Core game engine
│   │   ├── Game.js       # Main game loop and logic
│   │   ├── GameState.js  # Game state management
│   │   ├── GameRenderer.js # Rendering system
│   │   └── managers/     # Sound and other managers
│   ├── objects/          # Game entities
│   │   ├── SpaceStation.js # Player station
│   │   ├── Enemy.js      # Base enemy class
│   │   ├── Projectile.js # Projectiles
│   │   └── PowerUp.js    # Power-ups
│   ├── ui/               # User interface
│   ├── config/           # Configuration
│   └── utils/            # Utility functions
├── assets/               # Audio files (.wav, .mp3)
└── styles/               # CSS stylesheets
```

### Key Files to Know
- `src/game/Game.js` - Main game controller with game loop, collision detection, and entity management
- `src/objects/SpaceStation.js` - Player-controlled space station with movement, shooting, and abilities
- `src/objects/Enemy.js` - Base enemy with AI behaviors (direct, circling, zigzag, spiral)
- `src/config/GameConfig.js` - Game configuration constants and settings
- `index.html` - Game entry point with HTML5 Canvas and audio elements

## Common Development Tasks

### Adding New Features
- **Always check these files when modifying game mechanics**:
  - Update `GameConfig.js` for new constants
  - Modify `Game.js` for game loop changes
  - Edit relevant object classes in `/src/objects/`
  - Test in browser immediately after changes

### Game Controls and Input
- Movement: WASD keys (handled in `SpaceStation.js`)
- Shooting: Space bar (creates projectiles)
- Auto-fire toggle: Button in top-right corner
- Settings: Gear icon button (opens popup)

### Audio System
- Audio files in `/assets/` directory
- Preloaded in `index.html` with `<audio>` elements
- Managed by `SoundManager.js`
- **Note**: Some audio may not play due to browser autoplay policies

### Performance Considerations
- Game runs at 60 FPS using `requestAnimationFrame`
- Uses spatial grid for collision optimization
- Entity cleanup happens automatically for off-screen objects

## Validation Requirements

### Before Committing Changes
1. **Always validate JavaScript syntax**: `find . -name "*.js" -exec node -c {} \;`
2. **Always test the complete game scenario**:
   - Start HTTP server: `python3 -m http.server 8000`
   - Open `http://localhost:8000`
   - Verify space station renders in center
   - Test movement with WASD keys
   - Test shooting with Space bar
   - Let enemies spawn and verify they move toward station
   - Verify collision detection (let enemy hit station)
   - Confirm game over screen shows statistics
   - Test Play Again button restarts properly

### Expected Timing
- **Immediate feedback** - No build process, changes visible on browser refresh
- **File syntax check** - Takes ~2 seconds for all files
- **Game startup** - Loads in ~1 second via HTTP server
- **Manual testing** - 2-3 minutes for complete validation scenario

### Console Debugging
- Check browser Developer Tools Console for JavaScript errors
- Normal console output includes enemy spawn logs
- Audio loading errors are expected due to browser security policies

## Common Issues and Solutions

### CORS/Module Loading Issues
- **Problem**: "Failed to resolve module" errors
- **Solution**: Always use HTTP server, never open `index.html` directly

### Game Not Responding
- **Problem**: No movement or shooting response
- **Solution**: Click on game canvas to ensure it has focus
- Check browser console for JavaScript errors

### Audio Issues
- **Problem**: Sound effects not playing
- **Solution**: Expected behavior due to browser autoplay restrictions
- **Workaround**: User interaction (clicking) enables audio

### Enemy Spawn Issues
- **Problem**: No enemies appearing
- **Solution**: Check console logs for "Spawning enemy" messages
- Verify `Game.js` wave system is functioning

## File Organization Principles

- **Objects**: Individual game entities with their own update/draw methods
- **Game**: Central controller managing all entities and game state  
- **UI**: Popup dialogs and interface elements
- **Config**: Centralized constants and configuration
- **Utils**: Helper functions and utilities

Always maintain the existing modular ES6 structure when adding new features.