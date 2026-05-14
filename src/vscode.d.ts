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

  export namespace window {
    export function createStatusBarItem(alignment?: StatusBarAlignment, priority?: number): StatusBarItem;
  }

  export namespace commands {
    export function registerCommand(command: string, callback: (...args: unknown[]) => unknown): Disposable;
  }
}
