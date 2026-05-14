import * as vscode from 'vscode';

type Direction = 'up' | 'down' | 'left' | 'right';

type Point = {
  x: number;
  y: number;
};

const WIDTH = 18;
const HEIGHT = 5;
const TICK_MS = 450;

const EMPTY = '·';
const HEAD = '●';
const BODY = '■';
const FOOD = '□';

let statusBarItem: vscode.StatusBarItem;
let snake: Point[] = [];
let food: Point | undefined;
let direction: Direction = 'right';
let nextDirection: Direction = 'right';
let running = false;
let score = 0;
let gameOver = false;
let youWin = false;
let timer: ReturnType<typeof setInterval> | undefined;

export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'statusSnake.toggle';
  context.subscriptions.push(statusBarItem);

  resetGame();
  statusBarItem.show();

  context.subscriptions.push(
    vscode.commands.registerCommand('statusSnake.toggle', toggleGame),
    vscode.commands.registerCommand('statusSnake.reset', resetGame),
    vscode.commands.registerCommand('statusSnake.up', () => turn('up')),
    vscode.commands.registerCommand('statusSnake.down', () => turn('down')),
    vscode.commands.registerCommand('statusSnake.left', () => turn('left')),
    vscode.commands.registerCommand('statusSnake.right', () => turn('right'))
  );
}

export function deactivate() {
  stopTimer();
}

function resetGame() {
  stopTimer();

  const startX = Math.floor(WIDTH / 2);
  const startY = Math.floor(HEIGHT / 2);

  snake = [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY }
  ];
  direction = 'right';
  nextDirection = 'right';
  running = false;
  score = 0;
  gameOver = false;
  youWin = false;
  food = createFood();

  updateStatusBar();
}

function toggleGame() {
  if (gameOver || youWin) {
    resetGame();
    startGame();
    return;
  }

  if (running) {
    pauseGame();
  } else {
    startGame();
  }
}

function startGame() {
  if (running || gameOver || youWin) {
    return;
  }

  running = true;
  timer = setInterval(tick, TICK_MS);
  updateStatusBar();
}

function pauseGame() {
  running = false;
  stopTimer();
  updateStatusBar();
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
  }
}

function turn(newDirection: Direction) {
  if (gameOver || youWin) {
    return;
  }

  if (isOpposite(direction, newDirection)) {
    return;
  }

  nextDirection = newDirection;

  if (!running) {
    startGame();
  } else {
    updateStatusBar();
  }
}

function tick() {
  direction = nextDirection;

  const currentHead = snake[0];
  const newHead = movePoint(currentHead, direction);

  const willEat = food !== undefined && pointsEqual(newHead, food);
  const collisionSegments = willEat ? snake : snake.slice(0, -1);

  if (isOutOfBounds(newHead) || isSnakeCollision(newHead, collisionSegments)) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (willEat) {
    score += 1;

    if (snake.length === WIDTH * HEIGHT) {
      youWin = true;
      running = false;
      stopTimer();
    } else {
      food = createFood();
    }
  } else {
    snake.pop();
  }

  updateStatusBar();
}

function endGame() {
  gameOver = true;
  running = false;
  stopTimer();
  updateStatusBar();
}

function movePoint(point: Point, currentDirection: Direction): Point {
  switch (currentDirection) {
    case 'up':
      return { x: point.x, y: point.y - 1 };
    case 'down':
      return { x: point.x, y: point.y + 1 };
    case 'left':
      return { x: point.x - 1, y: point.y };
    case 'right':
      return { x: point.x + 1, y: point.y };
  }
}

function isOpposite(currentDirection: Direction, newDirection: Direction): boolean {
  return (
    (currentDirection === 'up' && newDirection === 'down') ||
    (currentDirection === 'down' && newDirection === 'up') ||
    (currentDirection === 'left' && newDirection === 'right') ||
    (currentDirection === 'right' && newDirection === 'left')
  );
}

function isOutOfBounds(point: Point): boolean {
  return point.x < 0 || point.x >= WIDTH || point.y < 0 || point.y >= HEIGHT;
}

function isSnakeCollision(point: Point, segments: Point[]): boolean {
  return segments.some((segment) => pointsEqual(segment, point));
}

function pointsEqual(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

function createFood(): Point | undefined {
  const openCells: Point[] = [];

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const candidate = { x, y };
      if (!snake.some((segment) => pointsEqual(segment, candidate))) {
        openCells.push(candidate);
      }
    }
  }

  if (openCells.length === 0) {
    return undefined;
  }

  return openCells[Math.floor(Math.random() * openCells.length)];
}

function updateStatusBar() {
  const stateLabel = getStateLabel();
  const icon = gameOver ? '$(debug-stop)' : youWin ? '$(pass-filled)' : '$(circle-filled)';
  const boardLines = renderBoard();
  const compactBoard = boardLines.join('');

  if (gameOver) {
    statusBarItem.text = `${icon} Snake ${score} GAME OVER`;
  } else if (youWin) {
    statusBarItem.text = `${icon} Snake ${score} YOU WIN`;
  } else {
    statusBarItem.text = `${icon} Snake ${stateLabel} ${score} ${compactBoard}`;
  }

  statusBarItem.tooltip = createTooltip(stateLabel, boardLines);
}

function getStateLabel(): string {
  if (gameOver) {
    return 'GAME OVER';
  }

  if (youWin) {
    return 'YOU WIN';
  }

  return running ? 'RUN' : 'PAUSE';
}

function renderBoard(): string[] {
  const rows = Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => EMPTY));

  if (food) {
    rows[food.y][food.x] = FOOD;
  }

  snake.forEach((segment, index) => {
    rows[segment.y][segment.x] = index === 0 ? HEAD : BODY;
  });

  return rows.map((row) => row.join(''));
}

function createTooltip(stateLabel: string, boardLines: string[]): vscode.MarkdownString {
  const restartHint = gameOver || youWin ? '\nAlt+S: restart' : '';
  const tooltip = new vscode.MarkdownString(
    [
      'Status Snake',
      `State: ${stateLabel}`,
      `Score: ${score}`,
      'Alt+S: start/pause',
      'Alt+Arrow: move',
      `Alt+R: reset${restartHint}`,
      '',
      '```',
      ...boardLines,
      '```'
    ].join('\n')
  );
  tooltip.isTrusted = false;
  return tooltip;
}
