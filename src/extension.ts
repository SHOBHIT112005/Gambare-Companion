/**
 * extension.ts — Ganbare Companion extension entry point
 * 
 * Activates the extension by:
 * 1. Registering the GanbareViewProvider (webview)
 * 2. Setting up the DiagnosticWatcher (error detection)
 * 3. Setting up the IdleTracker (stuck/idle detection)
 * 4. Wiring all events to the webview via postMessage
 */

import * as vscode from 'vscode';
import { GanbareViewProvider } from './GanbareViewProvider';
import { DiagnosticWatcher } from './diagnosticWatcher';
import { IdleTracker } from './idleTracker';

export function activate(context: vscode.ExtensionContext): void {
    console.log('[Ganbare Companion] Extension activating...');

    // ── 1. Create and register the WebviewViewProvider ──────────────────
    const provider = new GanbareViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            GanbareViewProvider.viewType,
            provider,
            {
                // Keep the webview content alive even when the view is hidden
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    // ── 2. Set up Diagnostic Watcher (error detection) ──────────────────
    const diagnosticWatcher = new DiagnosticWatcher((event) => {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        if (event.type === 'error_appeared') {
            console.log(
                `[Ganbare] Errors appeared in ${event.uri.fsPath}: ${event.errorCount} error(s)`
            );
            provider.sendTrigger('TRIGGER_ERROR', event.sampleMessage);
        } else if (event.type === 'error_fixed') {
            console.log(`[Ganbare] All errors fixed in ${event.uri.fsPath}`);
            provider.sendTrigger('TRIGGER_FIXED');
        }
    });

    context.subscriptions.push(diagnosticWatcher);

    // ── 3. Set up Idle Tracker (stuck/idle detection) ───────────────────
    const idleTracker = new IdleTracker(() => {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        console.log('[Ganbare] User appears to be stuck/idle');
        provider.sendTrigger('TRIGGER_STUCK');
    });

    context.subscriptions.push(idleTracker);

    console.log('[Ganbare Companion] Extension activated successfully!');
}

export function deactivate(): void {
    console.log('[Ganbare Companion] Extension deactivated.');
}
