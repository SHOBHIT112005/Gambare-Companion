/**
 * diagnosticWatcher.ts — Monitors VS Code diagnostics for error changes
 *
 * Tracks error counts per file and fires callbacks when:
 * - New errors appear (TRIGGER_ERROR)
 * - All errors in a file are resolved (TRIGGER_FIXED)
 *
 * Includes debouncing to avoid spamming during rapid diagnostic updates
 * (e.g., when a linter runs across many files at once).
 */
import * as vscode from 'vscode';
export type DiagnosticEventType = 'error_appeared' | 'error_fixed';
export interface DiagnosticEvent {
    type: DiagnosticEventType;
    uri: vscode.Uri;
    errorCount: number;
    /** A sample error message (first error) for display */
    sampleMessage?: string;
}
export type DiagnosticCallback = (event: DiagnosticEvent) => void;
export declare class DiagnosticWatcher implements vscode.Disposable {
    private readonly callback;
    private readonly disposables;
    /** Tracks the last known error count per file URI */
    private readonly errorCounts;
    /** Debounce timer for diagnostic changes */
    private debounceTimer;
    /** Debounce delay in milliseconds */
    private readonly debounceMs;
    /** Pending URI changes to process after debounce */
    private pendingUris;
    constructor(callback: DiagnosticCallback);
    /**
     * Snapshot the current error counts so we don't fire false positives
     * for pre-existing errors on activation.
     */
    private initializeCurrentDiagnostics;
    /**
     * Called when diagnostics change for any file.
     * Collects URIs and debounces processing.
     */
    private onDiagnosticsChanged;
    /**
     * Process all accumulated URI changes after the debounce window.
     */
    private processPendingChanges;
    dispose(): void;
}
//# sourceMappingURL=diagnosticWatcher.d.ts.map