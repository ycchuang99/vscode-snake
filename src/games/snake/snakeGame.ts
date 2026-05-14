import * as vscode from 'vscode';
import { MiniGame } from '../game';

type Dir = 'up' | 'down' | 'left' | 'right';
type Point = { x: number; y: number };

const W = 18;
const H = 5;
const TICK_MS = 450;

const EMPTY = '·';
const HEAD = '●';
const BODY = '■';
const FOOD = '□';

export class SnakeGame implements MiniGame {
  readonly id = 'snake';
  readonly name = 'Snake';

  private snake: Point[] = [];
  private food: Point | undefined;
  private direction: Dir = 'right';
  private nextDir: Dir = 'right';
  private running = false;
  private score = 0;
  private gameOver = false;
  private youWin = false;
  private timer: ReturnType<typeof setInterval> | undefined;
  private onUpdate: () => void;

  constructor(onUpdate: () => void) {
    this.onUpdate = onUpdate;
    this.reset();
  }

  onCommand(cmd: string): void {
    switch (cmd) {
      case 'toggle':
        if (this.gameOver || this.youWin) {
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
      case 'up': case 'down': case 'left': case 'right':
        this.turn(cmd as Dir);
        break;
    }
    this.onUpdate();
  }

  private turn(dir: Dir): void {
    if (this.gameOver || this.youWin) return;
    if (this.isOpposite(this.direction, dir)) return;
    this.nextDir = dir;
    if (!this.running) this.start();
  }

  private start(): void {
    if (this.running || this.gameOver || this.youWin) return;
    this.running = true;
    this.timer = setInterval(() => { this.tick(); this.onUpdate(); }, TICK_MS);
  }

  private pause(): void {
    this.running = false;
    this.stopTimer();
  }

  reset(): void {
    this.stopTimer();
    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    this.snake = [
      { x: cx, y: cy },
      { x: cx - 1, y: cy },
      { x: cx - 2, y: cy },
    ];
    this.direction = 'right';
    this.nextDir = 'right';
    this.running = false;
    this.score = 0;
    this.gameOver = false;
    this.youWin = false;
    this.food = this.createFood();
  }

  private tick(): void {
    if (!this.running) return;
    this.direction = this.nextDir;
    const head = this.snake[0];
    const nx = this.move(head, this.direction);
    const eat = this.food !== undefined && nx.x === this.food.x && nx.y === this.food.y;
    const segs = eat ? this.snake : this.snake.slice(0, -1);
    if (this.out(nx) || this.hit(nx, segs)) { this.end(); return; }
    this.snake.unshift(nx);
    if (eat) {
      this.score++;
      if (this.snake.length === W * H) {
        this.youWin = true;
        this.running = false;
        this.stopTimer();
      } else {
        this.food = this.createFood();
      }
    } else {
      this.snake.pop();
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

  private move(p: Point, d: Dir): Point {
    switch (d) {
      case 'up': return { x: p.x, y: p.y - 1 };
      case 'down': return { x: p.x, y: p.y + 1 };
      case 'left': return { x: p.x - 1, y: p.y };
      case 'right': return { x: p.x + 1, y: p.y };
    }
  }

  private isOpposite(a: Dir, b: Dir): boolean {
    return (a === 'up' && b === 'down') || (a === 'down' && b === 'up')
        || (a === 'left' && b === 'right') || (a === 'right' && b === 'left');
  }

  private out(p: Point): boolean {
    return p.x < 0 || p.x >= W || p.y < 0 || p.y >= H;
  }

  private hit(p: Point, segs: Point[]): boolean {
    return segs.some(s => s.x === p.x && s.y === p.y);
  }

  private createFood(): Point | undefined {
    const open: Point[] = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (!this.snake.some(s => s.x === x && s.y === y)) {
          open.push({ x, y });
        }
      }
    }
    return open.length > 0 ? open[Math.floor(Math.random() * open.length)] : undefined;
  }

  private renderBoard(): string[] {
    const rows = Array.from({ length: H }, () => Array(W).fill(EMPTY));
    if (this.food) rows[this.food.y][this.food.x] = FOOD;
    this.snake.forEach((s, i) => { rows[s.y][s.x] = i === 0 ? HEAD : BODY; });
    return rows.map(r => r.join(''));
  }

  getStatusText(): string {
    const label = this.gameOver ? 'GAME OVER' : this.youWin ? 'YOU WIN' : this.running ? 'RUN' : 'PAUSE';
    const icon = this.gameOver ? '$(debug-stop)' : this.youWin ? '$(pass-filled)' : '$(circle-filled)';
    const board = this.renderBoard().join('');
    if (this.gameOver) return `${icon} Snake ${this.score} GAME OVER`;
    if (this.youWin) return `${icon} Snake ${this.score} YOU WIN`;
    return `${icon} Snake ${label} ${this.score} ${board}`;
  }

  getTooltip(): vscode.MarkdownString {
    const label = this.gameOver ? 'GAME OVER' : this.youWin ? 'YOU WIN' : this.running ? 'RUN' : 'PAUSE';
    const restartHint = this.gameOver || this.youWin ? '\nAlt+S: restart' : '';
    const board = this.renderBoard();
    const md = new vscode.MarkdownString(
      [
        'Status Snake',
        `State: ${label}`,
        `Score: ${this.score}`,
        'Alt+S: start/pause',
        'Alt+Arrow: move',
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
