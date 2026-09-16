# 🎮 Game Hub - Web-Based Gaming Collection

A collection of **76 classic and modern games** built with pure HTML5, CSS3, and JavaScript. No frameworks, no dependencies - just fun!

## 🕹️ Games Included

| Game | Description | Features |
|------|-------------|----------|
| 🐍 **Snake** | Classic snake game | High scores, touch controls, difficulty levels |
| ⭕ **Tic-Tac-Toe** | X's and O's | 2-player & AI modes, 3 difficulty levels |
| ♟️ **Chess** | Full chess game | 2-player & AI, save/load, hints |
| 🎴 **Memory Match** | Card matching | Multiple grid sizes, timer, move counter |
| 🔢 **2048** | Number sliding puzzle | Swipe/keyboard controls, high score tracking |
| 🏓 **Pong** | Classic arcade Pong | 2-player & AI, customizable winning score |
| 🎱 **8 Ball Pool** | Billiards simulation | Physics engine, spin control, trajectory prediction |
| 💣 **Minesweeper** | Mine sweeping puzzle | Save/load, hints, flag mode, timer |
| 🧺 **Catch!** | Catch falling items | Powerups, combos, 5 different powerup types |
| 🧱 **Tetris** | Block stacking | Ghost piece, next preview, level progression |
| 🧱 **Breakout** | Brick breaker | Powerups, multi-ball, paddle upgrades |
| 🐦 **Flappy Bird** | Tap to fly | Simple controls, endless gameplay |
| 🎯 **Simon Says** | Memory sequence | Audio feedback, increasing difficulty |
| 📝 **Word Guess** | Wordle-style game | 5-letter words, keyboard input, statistics |
| 🔢 **Sudoku** | Number puzzle | 4 difficulty levels, notes, hints, save/load |
| ☠️ **Killer Sudoku** | Cage-sum Sudoku variant | Unique cage puzzles, hints, save/load |
| 🎭 **Liar's Bar 3D** | Bluff card game | Textured 3D table, 2-6 seats, local or AI play, six-shot cylinder |
| 🃏 **Liar's Bar 2D** | Bluff card game | Lightweight 2D table, 2-6 seats, local or AI play, 3 rule modes |

## ✨ Features

- **� User Accounts** - Register, login, track progress across games
- **💾 Save Progress** - Save and resume puzzle games (Sudoku, Minesweeper, Chess)
- **💡 Hints System** - Get help when stuck in puzzle games
- **�🖥️ Fullscreen Mode** - All games support fullscreen for immersive gameplay
- **📱 Touch Controls** - Play on mobile devices with swipe and tap
- **⌨️ Keyboard Support** - WASD and Arrow keys work across all games
- **🏆 High Scores** - Persistent scores saved in local storage
- **🎨 Modern UI** - Clean, responsive design with smooth animations
- **🤖 AI Opponents** - Multiple difficulty levels (Easy, Medium, Hard)

## 🚀 Getting Started

### Option 1: Direct File
Simply open `index.html` in any modern web browser.

### Option 2: Local Server
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve

# Using PHP
php -S localhost:8080
```

Then visit `http://localhost:8080`

## 📁 Project Structure

```
├── index.html          # Main game hub page
├── css/
│   └── styles.css      # Shared styles
├── js/
│   └── accounts.js     # User account system
├── games/
│   ├── snake.html      # Snake game
│   ├── tictactoe.html  # Tic-Tac-Toe
│   ├── chess.html      # Chess
│   ├── memory.html     # Memory Match
│   ├── 2048.html       # 2048
│   ├── pong.html       # Pong
│   ├── 8ball.html      # 8 Ball Pool
│   ├── minesweeper.html# Minesweeper
│   ├── liars-bar.html   # Liar's Bar 3D bluff card game
│   ├── liars-bar-2d.html# Liar's Bar 2D bluff card game
│   ├── catch.html      # Catch!
│   ├── tetris.html     # Tetris
│   ├── breakout.html   # Breakout
│   ├── flappy.html     # Flappy Bird
│   ├── simon.html      # Simon Says
│   ├── wordle.html     # Word Guess
│   ├── sudoku.html     # Sudoku
│   └── killer-sudoku.html # Killer Sudoku
└── README.md
```

## 🎮 Controls

### Universal
- **Fullscreen**: Click ⛶ button (top-right corner)
- **Navigation**: Click "← Back to Games" to return to hub

### Keyboard Controls
| Action | Arrow Keys | WASD |
|--------|-----------|------|
| Move Up | ↑ | W |
| Move Down | ↓ | S |
| Move Left | ← | A |
| Move Right | → | D |
| Confirm/Action | Space/Enter | Space/Enter |

### Touch Controls
- **Swipe** - Movement in direction-based games
- **Tap** - Selection and actions
- **Long Press** - Context actions (e.g., flagging in Minesweeper)

## 🛠️ Technical Details

- **Pure JavaScript** - No external libraries or frameworks
- **HTML5 Canvas** - Used for graphics-intensive games
- **CSS Grid/Flexbox** - Responsive layouts
- **LocalStorage** - Persistent game data
- **Fullscreen API** - Immersive gameplay option
- **Touch Events** - Mobile device support

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## 📄 License

MIT License - Feel free to use, modify, and distribute!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new games
- Submit pull requests

---

Made with ❤️ for gaming enthusiasts