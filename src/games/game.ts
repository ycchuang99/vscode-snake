import * as vscode from 'vscode';

export interface MiniGame {
  readonly id: string;
  readonly name: string;

  onCommand(cmd: string): void;

  getStatusText(): string;
  getTooltip(): vscode.MarkdownString;

  dispose(): void;
}
