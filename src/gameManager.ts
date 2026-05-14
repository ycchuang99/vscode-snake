import * as vscode from 'vscode';
import { MiniGame } from './games/game';

export class GameManager {
  private games = new Map<string, MiniGame>();
  private current: MiniGame;
  private statusBar: vscode.StatusBarItem;

  constructor(statusBar: vscode.StatusBarItem, games: MiniGame[]) {
    this.statusBar = statusBar;
    for (const g of games) this.games.set(g.id, g);
    this.current = games[0];
    this.render();
  }

  get currentId(): string { return this.current.id; }
  get gameIds(): string[] { return Array.from(this.games.keys()); }

  switchTo(id: string): boolean {
    const game = this.games.get(id);
    if (!game || game === this.current) return false;
    this.current.onCommand('pause');
    this.current = game;
    this.render();
    return true;
  }

  handleCommand(cmd: string): void {
    this.current.onCommand(cmd);
    this.render();
  }

  refresh(): void {
    this.render();
  }

  showPicker(): void {
    interface PickItem extends vscode.QuickPickItem { id: string; }
    const items: PickItem[] = Array.from(this.games.values()).map(g => ({
      label: g.name,
      description: g.id === this.current.id ? 'active' : '',
      id: g.id,
    }));
    vscode.window.showQuickPick(items, { placeHolder: 'Select a game…' }).then((selected: PickItem | undefined) => {
      if (selected) this.switchTo(selected.id);
    });
  }

  private render(): void {
    this.statusBar.text = this.current.getStatusText();
    this.statusBar.tooltip = this.current.getTooltip();
  }

  dispose(): void {
    for (const g of this.games.values()) g.dispose();
  }
}
