# Game Hub - AI Coding Instructions

## Architecture Overview

This is a **zero-dependency web game collection** — pure HTML5/CSS3/JavaScript with no frameworks, no build step, and no package manager. Each game is a single self-contained `.html` file under `games/`.

```
index.html              # Hub page — grid of game cards linking to games/
css/styles.css          # Shared base styles (layout, buttons, overlays, responsive)
js/accounts.js          # Optional localStorage-based user account system
games/*.html            # ~59 standalone game files (all logic inline)
```

All persistence uses `localStorage`. There is no backend.

## Running Locally

Open `index.html` directly in a browser, or use any static server:
```bash
python -m http.server 8080   # or: npx serve
```
VS Code Live Server is configured on port 5501 (`.vscode/settings.json`).

## Game File Template

Every game file follows this exact structure. Match it when adding new games:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Game Name] - Game Hub</title>
    <link rel="stylesheet" href="../css/styles.css">
    <style>/* game-specific styles only */</style>
</head>
<body>
    <button class="fullscreen-btn" id="fullscreenBtn">⛶</button>
    <div class="container">
        <a href="../index.html" class="back-btn">← Back to Games</a>
        <div class="game-container">
            <h1 class="game-title">[emoji] [Game Name]</h1>
            <div class="score-board">...</div>
            <canvas id="gameCanvas"></canvas>
            <!-- or DOM-based board -->
        </div>
    </div>
    <div id="gameOverOverlay" class="game-over-overlay hidden">
        <div class="game-over-content">...</div>
    </div>
    <script>
        // All game logic inline — no external JS imports per game
    </script>
</body>
</html>
```

## Adding a New Game

1. Create `games/your-game.html` following the template above
2. Add a game card entry in `index.html` inside `<main class="games-grid">`:
   ```html
   <a href="games/your-game.html" class="game-card">
       <div class="game-icon">[emoji]</div>
       <h2>[Game Name]</h2>
       <p>[One-line description]</p>
   </a>
   ```
3. Link the shared stylesheet: `<link rel="stylesheet" href="../css/styles.css">`
4. All game logic goes in an inline `<script>` tag — do not create separate `.js` files per game

## Design System & Styling Conventions

- **Background:** `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`
- **Primary accent:** `#00d9ff` (cyan) — headings, borders, highlights
- **Success/positive:** `#00ff88` (green) — scores, confirmations
- **Warning/danger:** `#ff6b6b` (red) — errors, game over states
- **Highlight:** `#ffc107` (amber) — special items, achievements
- **Glass-morphism pattern:** `background: rgba(255, 255, 255, 0.1)` with `border: 1px solid rgba(255, 255, 255, 0.2)` and `border-radius: 10-20px`
- Use shared CSS classes from `css/styles.css`: `.btn`, `.btn-primary`, `.btn-secondary`, `.game-container`, `.score-board`, `.game-over-overlay`, `.hidden`, `.instructions`

## Input Handling Requirements

Every game must support multiple input methods:
- **Keyboard:** Arrow keys AND WASD (both must work)
- **Touch:** On-screen buttons or swipe detection for mobile (`@media (pointer: coarse)`)
- **Fullscreen:** Include the `⛶` button with Fullscreen API toggle
- **Canvas touch:** Set `touch-action: none` on canvas elements to prevent scroll conflicts

## localStorage Conventions

- High scores: `localStorage.getItem('[gameName]HighScore')` (e.g., `snakeHighScore`)
- Save states: `localStorage.getItem('[gameName]Progress')`
- Account system session: `gameHubSession` and `gameHubUsers` keys (managed by `js/accounts.js`)
- To integrate with the account system: `AccountSystem.recordHighScore('gameName', score)`

## Game Loop Patterns

- **Real-time games** (Snake, Platformer, Pong): Use `requestAnimationFrame()` with delta-time or `setInterval()` with configurable speed
- **Turn-based games** (Chess, Sudoku, Minesweeper): Event-driven with no continuous loop
- **Idle games** (Cookie Clicker, Mining Idle): `setInterval()` for passive income ticks (typically 100ms)

## Key Constraints

- No external libraries or CDN imports — everything is vanilla JS
- No build tools, transpilation, or module bundling
- Each game must be fully functional as a standalone HTML file
- Mobile-responsive: test at 768px breakpoint (defined in `css/styles.css`)
- Game-specific styles go in the `<style>` tag within the game file, not in the shared CSS
