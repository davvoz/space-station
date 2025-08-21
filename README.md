# Space Station Manager

A browser-based space station defense game built with vanilla JavaScript and HTML5 Canvas. Defend your space station against waves of enemies, upgrade your defenses, and survive as long as possible!

![Space Station Manager](https://img.shields.io/badge/Game-Space%20Defense-blue) ![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow) ![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)

## 🎮 Features

- **Wave-based Combat**: Face increasingly difficult waves of enemies
- **Upgrade System**: Enhance your space station with various upgrades:
  - Health: Increase station durability
  - Turrets: Add more defensive turrets (max 10)
  - Damage: Boost projectile damage
  - Speed: Increase station movement speed
  - Shield: Add protective shielding
- **Enemy Varieties**: 
  - Basic enemies
  - Speedy enemies (faster movement)
  - Shooter enemies (ranged attacks)
  - Boss enemies (powerful and durable)
- **Power-ups**: Collect temporary boosts including:
  - Speed boost ⚡
  - Shield enhancement 🛡️
  - Damage amplification 💥
  - Multi-shot 🔫
  - Health restoration ❤️
  - Invincibility ⭐
- **Special Abilities**:
  - Nova Blast: Area damage explosion
  - Gravity Vortex: Pull enemies together
- **Dynamic Visuals**: Animated star background and particle effects
- **Audio**: Sound effects and background music
- **Combo System**: Chain kills for bonus points
- **Floating Combat Text**: Visual feedback for all actions

## 🚀 How to Play

### Running the Game

1. **Clone the repository:**
   ```bash
   git clone https://github.com/davvoz/space-station.git
   cd space-station
   ```

2. **Start a local web server:**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   ```

3. **Open your browser and navigate to:**
   ```
   http://localhost:8000
   ```

### Controls

- **Mouse Movement**: Move your space station
- **Mouse Click**: Fire projectiles at cursor location
- **Number Keys (1-5)**: Purchase upgrades
  - `1` - Health upgrade
  - `2` - Turret upgrade  
  - `3` - Damage upgrade
  - `4` - Speed upgrade
  - `5` - Shield upgrade
- **Space Bar**: Activate Nova Blast ability
- **Ctrl**: Activate Gravity Vortex ability

### Gameplay Tips

- Collect power-ups to gain temporary advantages
- Manage your credits wisely - upgrades become more expensive
- Use special abilities strategically during overwhelming enemy waves
- Position yourself to maximize turret effectiveness
- Health upgrades scale with wave number for better value
- Turrets are limited to 10 maximum

## 🛠 Technical Details

### Architecture

- **Pure JavaScript**: No frameworks or build tools required
- **ES6 Modules**: Modern module system for clean code organization
- **HTML5 Canvas**: Hardware-accelerated 2D rendering
- **Object-Oriented Design**: Clean class-based architecture
- **Game Loop**: Delta-time based updates for smooth gameplay
- **Spatial Grid**: Optimized collision detection for performance
- **Web Workers**: Physics calculations offloaded for better performance

### Browser Compatibility

- Modern browsers supporting ES6 modules
- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+

## 📁 Project Structure

```
space-station/
├── index.html              # Main game entry point
├── assets/                 # Audio files
│   ├── background.mp3      # Background music
│   ├── laser.wav          # Sound effects
│   └── ...
├── src/                   # Source code
│   ├── config/           # Game configuration
│   ├── game/             # Core game logic
│   │   ├── Game.js       # Main game class
│   │   ├── GameState.js  # Game state management
│   │   └── GameRenderer.js # Rendering system
│   ├── objects/          # Game entities
│   │   ├── SpaceStation.js
│   │   ├── Enemy.js
│   │   ├── Projectile.js
│   │   └── ...
│   ├── ui/               # User interface components
│   ├── utils/            # Utility classes
│   └── workers/          # Web workers
└── styles/               # CSS styles
```

## 🎯 Game Mechanics

### Scoring System
- Base enemy kill: 100 points
- Combo multiplier for consecutive kills
- Wave completion bonuses
- Power-up collection rewards

### Difficulty Scaling
- Enemy health, damage, and speed increase over time
- More enemies spawn as the game progresses
- Boss enemies appear after extended gameplay
- Wave intensity scales with progression

### Economy
- Earn credits by defeating enemies
- Spend credits on permanent upgrades
- Upgrade costs increase exponentially
- Strategic resource management is key

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Bug Reports**: Open an issue describing the problem
2. **Feature Requests**: Suggest new features or improvements
3. **Code Contributions**: Fork the repo and submit a pull request
4. **Documentation**: Help improve this README or add code comments

### Development Setup

1. Fork and clone the repository
2. Make your changes
3. Test thoroughly in multiple browsers
4. Submit a pull request with a clear description

## 📝 License

This project is open source. Please check the repository for license details.

## 🎵 Credits

- Game developed using vanilla JavaScript and HTML5 Canvas
- Audio assets included for immersive gameplay experience
- Inspired by classic space defense games

---

**Enjoy defending your space station! 🚀**