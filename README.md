# Status Bar Games

Mini-arcade games that run entirely in your VS Code status bar. No WebViews, no large panels — just quick fun for short coding breaks.

## Games

| Game | Description | Controls |
|------|-------------|----------|
| **Snake** | Classic snake. Eat food, grow, avoid walls and yourself. | Arrow keys to steer |
| **Dino** | Chrome-inspired dinosaur runner. Jump over cacti, score rises over time. | Up / Jump to avoid obstacles |

## Controls

| Action | Windows / Linux | macOS |
|--------|-----------------|-------|
| Switch game | `Alt+G` | `Option+G` |
| Start / Pause | `Alt+S` | `Option+S` |
| Up / Jump | `Alt+Up` | `Option+Up` |
| Down | `Alt+Down` | `Option+Down` |
| Left | `Alt+Left` | `Option+Left` |
| Right | `Alt+Right` | `Option+Right` |
| Reset | `Alt+R` | `Option+R` |

## Commands

- `Status Games: Switch Game` — pick a game from a quick-pick list
- `Status Games: Start / Pause`
- `Status Games: Reset`
- `Status Games: Up / Jump`
- `Status Games: Down`
- `Status Games: Left`
- `Status Games: Right`

## Architecture

Adding a new game:

1. Create a class in `src/games/<your-game>/` that implements `MiniGame` (see `src/games/game.ts`).
2. Instantiate it in `src/extension.ts` and pass it to the `GameManager`.
3. The game receives `onCommand()` calls and provides `getStatusText()` / `getTooltip()` for rendering.

## Development

```bash
npm install
npm run compile
```

To test manually, press `F5` in VS Code to launch an Extension Development Host.

## License

MIT
