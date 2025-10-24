# Tower Defence Game

A browser-based tower defense game built with PixiJS and TypeScript, featuring dynamic pathfinding and progressive difficulty.

![Tower Defense Game](docs/assets/screenshot.png)

## Features

### Core Gameplay
- **Dynamic Pathfinding**: Enemies use A* pathfinding algorithm to navigate around your towers
- **Strategic Tower Placement**: Click to place towers on the grid to defend your base
- **Progressive Difficulty**: Enemy and tower HP increase as you progress through the game
- **Two-Way Combat**:
  - Towers shoot yellow projectiles at enemies
  - Enemies can attack towers with orange projectiles when in range
- **Resource Management**: Balance your money to build defenses before enemies breach your base

### Game Mechanics
- **Starting Resources**: 💰 100 money, ❤️ 10 life
- **Tower Cost**: 25 money per tower
- **Enemy Reward**: 11 money per defeated enemy
- **Tower Stats**:
  - Range: 3 cells
  - Attack Interval: 30 frames (~0.5 seconds)
  - HP: Starts at 10, increases up to 40
- **Enemy Stats**:
  - HP: Starts at 10, increases up to 80
  - Attack Range: 4 cells
  - Spawn Rate: Every 180 frames (~3 seconds)
  - Movement: Every 30 frames

### Visual Features
- HP bars for both towers and enemies
- Grid-based gameplay (11x20 cells)
- Color-coded projectiles (yellow for towers, orange for enemies)
- Real-time UI updates

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd tower-defence
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## How to Play

1. **Objective**: Prevent enemies from reaching the bottom-left corner (0, GRID_HEIGHT-1)
2. **Controls**: Click on any empty grid cell to place a tower (costs 25 money)
3. **Strategy**:
   - Place towers strategically to create defensive lines
   - Enemy paths recalculate when you place new towers
   - Balance offense and economy - you earn money by defeating enemies
   - Protect your towers - enemies will attack them if they get too close

4. **Win Condition**: Survive as long as possible
5. **Lose Condition**: Game ends when life reaches 0

## Technologies Used

- **PixiJS v8.9.2**: High-performance 2D rendering engine
- **TypeScript ~5.7.2**: Type-safe JavaScript
- **Pathfinding v0.4.18**: A* pathfinding algorithm implementation
- **Vite ^6.3.1**: Fast build tool and dev server

## Project Structure

```
tower-defence/
├── src/
│   ├── main.ts          # Main game logic
│   ├── constant.ts      # Game constants (grid size, cell size)
│   ├── style.css        # Styles
│   └── vite-env.d.ts    # TypeScript declarations
├── public/              # Static assets
├── docs/                # Documentation and assets
├── index.html           # Entry HTML
└── package.json         # Dependencies and scripts
```

## Development

### Build for Production

```bash
npm run build
# or
pnpm build
```

### Preview Production Build

```bash
npm run preview
# or
pnpm preview
```

## Game Design Details

### Grid System
- Grid Size: 11x20 cells
- Cell Size: 32x32 pixels
- Total Canvas: 352x640 pixels

### Enemy Spawning
- Enemies spawn at top-right corner (GRID_WIDTH-1, 0)
- Goal: Bottom-left corner (0, GRID_HEIGHT-1)
- Spawn interval: Every 180 frames

### Difficulty Scaling
- Enemy HP increases by 1 per kill (max: 80)
- Tower HP increases by 1 per enemy killed (max: 40)
- This creates a natural difficulty curve

## Future Ideas / 次のアイデア

### 🎮 Gameplay Enhancements
1. **Different Tower Types**
   - Sniper Tower (long range, slow fire rate)
   - Machine Gun Tower (short range, fast fire rate)
   - AOE Tower (area of effect damage)
   - Slow Tower (slows down enemies)

2. **Enemy Variety**
   - Fast enemies (low HP, high speed)
   - Tank enemies (high HP, slow)
   - Flying enemies (ignore tower blocking, different path)
   - Boss enemies (appear every N waves)

3. **Wave System**
   - Defined waves instead of continuous spawning
   - Break time between waves to build/upgrade
   - Wave completion bonuses

4. **Tower Upgrades**
   - Click existing tower to upgrade
   - Upgrade range, damage, or fire rate
   - Visual changes when upgraded

### 🎨 Polish & UX
1. **Better Graphics**
   - Sprite assets instead of colored rectangles
   - Animations for attacks and explosions
   - Particle effects

2. **Sound Effects & Music**
   - Background music
   - Tower shooting sounds
   - Enemy death sounds
   - UI click sounds

3. **UI Improvements**
   - Tower placement preview
   - Range indicators when hovering
   - Next wave timer
   - Score/wave counter
   - Pause menu

### 🔧 Technical Improvements
1. **Save System**
   - Save game state to localStorage
   - Continue from where you left off
   - High score tracking

2. **Performance**
   - Object pooling for projectiles
   - Optimize pathfinding (cache paths when possible)
   - Sprite batching

3. **Mobile Support**
   - Touch controls
   - Responsive canvas sizing
   - Mobile-friendly UI

### 🎯 Game Modes
1. **Challenge Mode**
   - Limited money
   - Limited tower slots
   - Time attack

2. **Endless Mode**
   - See how many waves you can survive
   - Leaderboard system

3. **Puzzle Mode**
   - Pre-placed enemies/towers
   - Limited resources
   - Specific win conditions

### 🌟 Most Interesting Next Steps
Based on the current implementation, I recommend:

1. **Wave System + Enemy Types** (Medium effort, high impact)
   - Adds structure and variety
   - Makes the game feel more polished
   - Creates natural difficulty progression

2. **Tower Upgrades** (Low-medium effort, high impact)
   - Adds strategic depth
   - Reuses existing tower code
   - Simple but satisfying mechanic

3. **Better Visual Feedback** (Low effort, high impact)
   - Add screen shake on hit
   - Add explosion effects on enemy death
   - Add range circles when placing towers
   - These small touches make the game feel much better

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT License

---

Built with ❤️ using PixiJS and TypeScript
