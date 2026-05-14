import * as vscode from 'vscode';
import { MiniGame } from '../game';

const W = 18;
const H = 5;
const TICK_MS = 300;
const GND = 4;
const DINO_X = 2;
const INIT_INTERVAL = 8;
const MIN_INTERVAL = 3;

const DINO = '◆';
const CACTUS = '♣';
const EMPTY = '·';

interface Obs {
  x: number;
  tall: boolean;
}

export class DinoGame implements MiniGame {
  readonly id = 'dino';
  readonly name = 'Dino';

  private dinoY = GND;
  private jumpTimer = 0;
  private obstacles: Obs[] = [];
  private running = false;
  private gameOver = false;
  private score = 0;
  private ticksSinceSpawn = 0;
  private spawnInterval = INIT_INTERVAL;
  private timer: ReturnType<typeof setInterval> | undefined;
  private onUpdate: () => void;

  constructor(onUpdate: () => void) {
    this.onUpdate = onUpdate;
    this.reset();
  }

  onCommand(cmd: string): void {
    switch (cmd) {
      case 'toggle':
        if (this.gameOver) {
          this.reset();
          this.start();
        } else if (this.running) {
          this.pause();
        } else {
          this.start();
        }
        break;
      case 'reset':
        this.reset();
        break;
      case 'up':
      case 'action':
        this.jump();
        break;
    }
    this.onUpdate();
  }

  private jump(): void {
    if (this.gameOver || !this.running) return;
    if (this.dinoY === GND) {
      this.dinoY = GND - 2;
      this.jumpTimer = 3;
    }
  }

  private start(): void {
    if (this.running || this.gameOver) return;
    this.running = true;
    this.timer = setInterval(() => { this.tick(); this.onUpdate(); }, TICK_MS);
  }

  private pause(): void {
    this.running = false;
    this.stopTimer();
  }

  reset(): void {
    this.stopTimer();
    this.dinoY = GND;
    this.jumpTimer = 0;
    this.obstacles = [];
    this.running = false;
    this.gameOver = false;
    this.score = 0;
    this.ticksSinceSpawn = 0;
    this.spawnInterval = INIT_INTERVAL;
  }

  private tick(): void {
    if (!this.running || this.gameOver) return;

    this.score++;
    this.spawnInterval = Math.max(MIN_INTERVAL, INIT_INTERVAL - Math.floor(this.score / 100));

    for (const o of this.obstacles) o.x--;
    this.obstacles = this.obstacles.filter(o => o.x >= 0);

    for (const o of this.obstacles) {
      if (o.x !== DINO_X) continue;
      if (o.tall) {
        if (this.dinoY >= GND - 1) { this.end(); return; }
      } else {
        if (this.dinoY === GND) { this.end(); return; }
      }
    }

    this.ticksSinceSpawn++;
    if (this.ticksSinceSpawn >= this.spawnInterval) {
      this.ticksSinceSpawn = 0;
      this.obstacles.push({ x: W - 1, tall: Math.random() < 0.3 });
    }

    if (this.jumpTimer > 0) {
      this.jumpTimer--;
      if (this.jumpTimer === 0) this.dinoY = GND;
    }
  }

  private end(): void {
    this.gameOver = true;
    this.running = false;
    this.stopTimer();
  }

  private stopTimer(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private renderBoard(): string[] {
    const rows = Array.from({ length: H }, () => Array(W).fill(EMPTY));
    for (const o of this.obstacles) {
      if (o.x < 0 || o.x >= W) continue;
      rows[GND][o.x] = CACTUS;
      if (o.tall && GND - 1 >= 0) rows[GND - 1][o.x] = CACTUS;
    }
    if (this.dinoY >= 0 && this.dinoY < H) rows[this.dinoY][DINO_X] = DINO;
    return rows.map(r => r.join(''));
  }

  getStatusText(): string {
    const label = this.gameOver ? 'GAME OVER' : this.running ? 'RUN' : 'PAUSE';
    const icon = this.gameOver ? '$(debug-stop)' : '$(circle-filled)';
    const board = this.renderBoard().join('');
    if (this.gameOver) return `${icon} Dino ${this.score} GAME OVER`;
    return `${icon} Dino ${label} ${this.score} ${board}`;
  }

  getTooltip(): vscode.MarkdownString {
    const label = this.gameOver ? 'GAME OVER' : this.running ? 'RUN' : 'PAUSE';
    const restartHint = this.gameOver ? '\nAlt+S: restart' : '';
    const board = this.renderBoard();
    const md = new vscode.MarkdownString(
      [
        'Status Dino',
        `State: ${label}`,
        `Score: ${this.score}`,
        'Alt+S: start/pause',
        'Alt+Up: jump',
        `Alt+R: reset${restartHint}`,
        '',
        '```',
        ...board,
        '```',
      ].join('\n'),
    );
    md.isTrusted = false;
    return md;
  }

  dispose(): void {
    this.stopTimer();
  }
}
