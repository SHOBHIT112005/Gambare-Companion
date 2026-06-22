/**
 * idleTracker.ts — Detects when the user is idle/stuck
 *
 * Monitors text document changes to detect typing activity.
 * After a configurable period of inactivity (default: 5 minutes),
 * fires a callback to trigger the companion's encouragement.
 *
 * Only activates when there's an active text editor open.
 * Dynamically responds to configuration changes.
 */
import * as vscode from 'vscode';
export type IdleCallback = () => void;
export declare class IdleTracker implements vscode.Disposable {
    private readonly callback;
    private readonly disposables;
    private idleTimer;
    private timeoutMs;
    private isIdle;
    constructor(callback: IdleCallback);
    /**
     * Read the idle timeout from VS Code configuration.
     */
    private getTimeoutFromConfig;
    /**
     * Called every time the user types in a document.
     * Resets the idle timer.
     */
    private onDocumentChanged;
    /**
     * Called when the user switches to a different editor.
     * Resets the idle timer since they're actively working.
     */
    private onActiveEditorChanged;
    /**
     * Called when VS Code configuration changes.
     * Updates the timeout if our setting changed.
     */
    private onConfigChanged;
    /**
     * Reset (restart) the idle timer.
     */
    private resetTimer;
    /**
     * Clear the idle timer.
     */
    private clearTimer;
    /**
     * Check if the user is currently in the idle state.
     */
    getIsIdle(): boolean;
    dispose(): void;
}
//# sourceMappingURL=idleTracker.d.ts.map