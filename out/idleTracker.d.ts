import * as vscode from 'vscode';
export type IdleCallback = () => void;
export declare class IdleTracker implements vscode.Disposable {
    private readonly callback;
    private readonly disposables;
    private idleTimer;
    private timeoutMs;
    private isIdle;
    constructor(callback: IdleCallback);
    private getTimeoutFromConfig;
    private onDocumentChanged;
    private onActiveEditorChanged;
    private onConfigChanged;
    private resetTimer;
    private clearTimer;
    getIsIdle(): boolean;
    dispose(): void;
}
//# sourceMappingURL=idleTracker.d.ts.map