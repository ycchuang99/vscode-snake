# Status Bar Snake

A tiny VS Code status bar snake game for short coding breaks.

## Features

- Plays entirely in the VS Code status bar; no WebView or large editor panel.
- Start, pause, reset, and steer with commands or keyboard shortcuts.
- Tooltip shows the full board when the status bar is too narrow.
- Keeps all state local and does not collect or transmit user data.

## Controls

| Action | Windows / Linux | macOS |
| --- | --- | --- |
| Start / Pause | `Alt+S` | `Option+S` |
| Up | `Alt+Up` | `Option+Up` |
| Down | `Alt+Down` | `Option+Down` |
| Left | `Alt+Left` | `Option+Left` |
| Right | `Alt+Right` | `Option+Right` |
| Reset | `Alt+R` | `Option+R` |

## Commands

- `Status Snake: Start / Pause`
- `Status Snake: Reset`
- `Status Snake: Up`
- `Status Snake: Down`
- `Status Snake: Left`
- `Status Snake: Right`

## Development

```bash
npm install
npm run compile
```

To test manually, press `F5` in VS Code to launch an Extension Development Host.
