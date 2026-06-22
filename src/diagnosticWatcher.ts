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

export class DiagnosticWatcher implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];
    /** Tracks the last known error count per file URI */
    private readonly errorCounts = new Map<string, number>();
    /** Debounce timer for diagnostic changes */
    private debounceTimer: ReturnType<typeof setTimeout> | undefined;
    /** Debounce delay in milliseconds */
    private readonly debounceMs = 300;
    /** Pending URI changes to process after debounce */
    private pendingUris = new Set<string>();

    constructor(private readonly callback: DiagnosticCallback) {
        // Subscribe to diagnostic changes
        this.disposables.push(
            vscode.languages.onDidChangeDiagnostics(this.onDiagnosticsChanged, this)
        );

        // Initialize with current diagnostics for open editors
        this.initializeCurrentDiagnostics();
    }

    /**
     * Snapshot the current error counts so we don't fire false positives
     * for pre-existing errors on activation.
     */
    private initializeCurrentDiagnostics(): void {
        const allDiagnostics = vscode.languages.getDiagnostics();
        for (const [uri, diagnostics] of allDiagnostics) {
            const errorCount = diagnostics.filter(
                d => d.severity === vscode.DiagnosticSeverity.Error
            ).length;
            if (errorCount > 0) {
                this.errorCounts.set(uri.toString(), errorCount);
            }
        }
    }

    /**
     * Called when diagnostics change for any file.
     * Collects URIs and debounces processing.
     */
    private onDiagnosticsChanged(event: vscode.DiagnosticChangeEvent): void {
        // Only process URIs from the active editor's language
        for (const uri of event.uris) {
            this.pendingUris.add(uri.toString());
        }

        // Debounce: wait for changes to settle
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.processPendingChanges();
        }, this.debounceMs);
    }

    /**
     * Process all accumulated URI changes after the debounce window.
     */
    private processPendingChanges(): void {
        const urisToProcess = new Set(this.pendingUris);
        this.pendingUris.clear();

        for (const uriString of urisToProcess) {
            const uri = vscode.Uri.parse(uriString);
            const diagnostics = vscode.languages.getDiagnostics(uri);

            // Count only Error severity (ignore warnings, info, hints)
            const currentErrorCount = diagnostics.filter(
                d => d.severity === vscode.DiagnosticSeverity.Error
            ).length;

            const previousErrorCount = this.errorCounts.get(uriString) ?? 0;

            if (currentErrorCount > previousErrorCount) {
                // New errors appeared
                const firstError = diagnostics.find(
                    d => d.severity === vscode.DiagnosticSeverity.Error
                );
                this.callback({
                    type: 'error_appeared',
                    uri,
                    errorCount: currentErrorCount,
                    sampleMessage: firstError?.message
                });
            } else if (currentErrorCount === 0 && previousErrorCount > 0) {
                // All errors in this file were resolved
                this.callback({
                    type: 'error_fixed',
                    uri,
                    errorCount: 0
                });
            }

            // Update tracked count
            if (currentErrorCount > 0) {
                this.errorCounts.set(uriString, currentErrorCount);
            } else {
                this.errorCounts.delete(uriString);
            }
        }
    }

    dispose(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.disposables.forEach(d => d.dispose());
    }
}
