import * as vscode from 'vscode';
import { GameManager } from './gameManager';
import { SnakeGame } from './games/snake/snakeGame';
import { DinoGame } from './games/dino/dinoGame';

let manager: GameManager | undefined;

export function activate(context: vscode.ExtensionContext) {
  const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  item.command = 'statusGames.toggle';
  context.subscriptions.push(item);

  const refresh = () => manager?.refresh();
  const snake = new SnakeGame(refresh);
  const dino = new DinoGame(refresh);
  manager = new GameManager(item, [snake, dino]);
  item.show();

  context.subscriptions.push(
    vscode.commands.registerCommand('statusGames.switch', () => manager!.showPicker()),
    vscode.commands.registerCommand('statusGames.toggle', () => manager!.handleCommand('toggle')),
    vscode.commands.registerCommand('statusGames.reset', () => manager!.handleCommand('reset')),
    vscode.commands.registerCommand('statusGames.up', () => manager!.handleCommand('up')),
    vscode.commands.registerCommand('statusGames.down', () => manager!.handleCommand('down')),
    vscode.commands.registerCommand('statusGames.left', () => manager!.handleCommand('left')),
    vscode.commands.registerCommand('statusGames.right', () => manager!.handleCommand('right')),
  );
}

export function deactivate() {
  manager?.dispose();
}
