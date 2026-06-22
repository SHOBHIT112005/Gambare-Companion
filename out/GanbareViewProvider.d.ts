/**
 * GanbareViewProvider.ts — WebviewViewProvider for the anime companion
 *
 * Manages the webview lifecycle, generates the HTML content with
 * secure CSP, and provides methods for the extension host to
 * send messages to the webview frontend.
 */
import * as vscode from 'vscode';
import type { Phrase } from './phrases';
export type TriggerType = 'TRIGGER_ERROR' | 'TRIGGER_STUCK' | 'TRIGGER_FIXED' | 'TRIGGER_IDLE';
export interface TriggerMessage {
    type: TriggerType;
    phrase: Phrase;
    /** Optional context data (e.g., error message) */
    context?: string;
    /** Voice settings from configuration */
    voiceEnabled: boolean;
    voicePitch: number;
    voiceRate: number;
}
export declare class GanbareViewProvider implements vscode.WebviewViewProvider {
    private readonly extensionUri;
    static readonly viewType = "ganbareCompanion.characterView";
    private view?;
    constructor(extensionUri: vscode.Uri);
    /**
     * Called by VS Code when the webview view is first made visible.
     */
    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext, _token: vscode.CancellationToken): void;
    /**
     * Send a trigger event to the webview with a random phrase.
     */
    sendTrigger(type: TriggerType, context?: string): void;
    /**
     * Handle messages coming back from the webview.
     */
    private handleWebviewMessage;
    /**
     * Build the complete HTML string for the webview.
     * Includes a strict Content Security Policy.
     */
    private getHtmlForWebview;
}
//# sourceMappingURL=GanbareViewProvider.d.ts.map