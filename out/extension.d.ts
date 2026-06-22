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
export declare function activate(context: vscode.ExtensionContext): void;
export declare function deactivate(): void;
//# sourceMappingURL=extension.d.ts.map