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

export class IdleTracker implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];
    private idleTimer: ReturnType<typeof setTimeout> | undefined;
    private timeoutMs: number;
    private isIdle = false;

    constructor(private readonly callback: IdleCallback) {
        // Read initial timeout from configuration
        this.timeoutMs = this.getTimeoutFromConfig();

        // Listen for text document changes (keystrokes)
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(
                this.onDocumentChanged,
                this
            )
        );

        // Listen for active editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(
                this.onActiveEditorChanged,
                this
            )
        );

        // Listen for configuration changes
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(
                this.onConfigChanged,
                this
            )
        );

        // Start the timer if there's already an active editor
        if (vscode.window.activeTextEditor) {
            this.resetTimer();
        }
    }

    /**
     * Read the idle timeout from VS Code configuration.
     */
    private getTimeoutFromConfig(): number {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        const minutes = config.get<number>('idleTimeoutMinutes', 5);
        return minutes * 60 * 1000; // Convert to milliseconds
    }

    /**
     * Called every time the user types in a document.
     * Resets the idle timer.
     */
    private onDocumentChanged(event: vscode.TextDocumentChangeEvent): void {
        // Only track changes to code files (not output channels, etc.)
        if (event.document.uri.scheme !== 'file') {
            return;
        }

        // User is actively typing — reset idle state
        this.isIdle = false;
        this.resetTimer();
    }

    /**
     * Called when the user switches to a different editor.
     * Resets the idle timer since they're actively working.
     */
    private onActiveEditorChanged(editor: vscode.TextEditor | undefined): void {
        if (editor) {
            this.isIdle = false;
            this.resetTimer();
        } else {
            // No active editor — clear the timer
            this.clearTimer();
        }
    }

    /**
     * Called when VS Code configuration changes.
     * Updates the timeout if our setting changed.
     */
    private onConfigChanged(event: vscode.ConfigurationChangeEvent): void {
        if (event.affectsConfiguration('ganbareCompanion.idleTimeoutMinutes')) {
            this.timeoutMs = this.getTimeoutFromConfig();
            // Restart timer with new duration
            if (vscode.window.activeTextEditor) {
                this.resetTimer();
            }
        }
    }

    /**
     * Reset (restart) the idle timer.
     */
    private resetTimer(): void {
        this.clearTimer();

        this.idleTimer = setTimeout(() => {
            // Only fire if there's still an active editor and extension is enabled
            const config = vscode.workspace.getConfiguration('ganbareCompanion');
            if (vscode.window.activeTextEditor && config.get<boolean>('enabled', true)) {
                this.isIdle = true;
                this.callback();
                // Don't auto-restart — wait for next keystroke to reset
            }
        }, this.timeoutMs);
    }

    /**
     * Clear the idle timer.
     */
    private clearTimer(): void {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
        }
    }

    /**
     * Check if the user is currently in the idle state.
     */
    public getIsIdle(): boolean {
        return this.isIdle;
    }

    dispose(): void {
        this.clearTimer();
        this.disposables.forEach(d => d.dispose());
    }
}
