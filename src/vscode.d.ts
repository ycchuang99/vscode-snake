declare module 'vscode' {
  export enum StatusBarAlignment {
    Left = 1,
    Right = 2
  }

  export interface Disposable {
    dispose(): void;
  }

  export interface ExtensionContext {
    subscriptions: Disposable[];
  }

  export interface StatusBarItem extends Disposable {
    text: string;
    tooltip?: string | MarkdownString;
    command?: string;
    show(): void;
    hide(): void;
  }

  export class MarkdownString {
    value: string;
    isTrusted?: boolean;
    constructor(value?: string, supportThemeIcons?: boolean);
  }

  export interface QuickPickItem {
    label: string;
    description?: string;
    detail?: string;
    picked?: boolean;
    id?: string;
  }

  export namespace window {
    export function createStatusBarItem(alignment?: StatusBarAlignment, priority?: number): StatusBarItem;
    export function showQuickPick<T extends QuickPickItem>(
      items: T[] | Thenable<T[]>,
      options?: { placeHolder?: string; matchOnDescription?: boolean; matchOnDetail?: boolean },
      token?: CancellationToken
    ): Thenable<T | undefined>;
  }

  export namespace commands {
    export function registerCommand(command: string, callback: (...args: unknown[]) => unknown): Disposable;
  }

  export interface CancellationToken {
    isCancellationRequested: boolean;
    onCancellationRequested: Event<unknown>;
  }

  export interface Event<T> {
    (listener: (e: T) => unknown, thisArgs?: unknown): Disposable;
  }
}
