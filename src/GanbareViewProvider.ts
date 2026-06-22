/**
 * GanbareViewProvider.ts — WebviewViewProvider for the anime companion
 * 
 * Manages the webview lifecycle, generates the HTML content with
 * secure CSP, and provides methods for the extension host to
 * send messages to the webview frontend.
 */

import * as vscode from 'vscode';
import type { Phrase } from './phrases';
import {
    getRandomPhrase,
    errorPhrases,
    stuckPhrases,
    fixedPhrases,
    idlePhrases
} from './phrases';

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

export class GanbareViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ganbareCompanion.characterView';

    private view?: vscode.WebviewView;

    constructor(private readonly extensionUri: vscode.Uri) {}

    /**
     * Called by VS Code when the webview view is first made visible.
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this.view = webviewView;

        // Configure webview options
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.extensionUri, 'media')
            ]
        };

        // Set the HTML content
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        // Listen for messages from the webview
        webviewView.webview.onDidReceiveMessage(
            (message) => this.handleWebviewMessage(message),
            undefined
        );
    }

    /**
     * Send a trigger event to the webview with a random phrase.
     */
    public sendTrigger(type: TriggerType, context?: string): void {
        if (!this.view) {
            return;
        }

        // Select the appropriate phrase category
        let phrase: Phrase;
        switch (type) {
            case 'TRIGGER_ERROR':
                phrase = getRandomPhrase(errorPhrases, 'error');
                break;
            case 'TRIGGER_STUCK':
                phrase = getRandomPhrase(stuckPhrases, 'stuck');
                break;
            case 'TRIGGER_FIXED':
                phrase = getRandomPhrase(fixedPhrases, 'fixed');
                break;
            case 'TRIGGER_IDLE':
                phrase = getRandomPhrase(idlePhrases, 'idle');
                break;
        }

        // Read voice settings from configuration
        const config = vscode.workspace.getConfiguration('ganbareCompanion');

        const message: TriggerMessage = {
            type,
            phrase,
            context,
            voiceEnabled: config.get<boolean>('voiceEnabled', true),
            voicePitch: config.get<number>('voicePitch', 1.3),
            voiceRate: config.get<number>('voiceRate', 0.9)
        };

        this.view.webview.postMessage(message);
    }

    /**
     * Handle messages coming back from the webview.
     */
    private handleWebviewMessage(message: { command: string; [key: string]: unknown }): void {
        switch (message.command) {
            case 'ready':
                // Webview has finished loading — send initial greeting
                this.sendTrigger('TRIGGER_IDLE');
                break;
            case 'log':
                console.log('[Ganbare Webview]', message.text);
                break;
        }
    }

    /**
     * Build the complete HTML string for the webview.
     * Includes a strict Content Security Policy.
     */
    private getHtmlForWebview(webview: vscode.Webview): string {
        // Generate URIs for local resources
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'webview.js')
        );
        const styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'webview.css')
        );

        // Character image URIs for each state
        const idleImg = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'character_idle.png')
        );
        const worriedImg = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'character_worried.png')
        );
        const happyImg = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'character_happy.png')
        );
        const encouragingImg = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'character_encouraging.png')
        );

        // Generate a nonce for inline script security
        const nonce = getNonce();

        return /*html*/ `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data:; font-src ${webview.cspSource};">
    <link href="${styleUri}" rel="stylesheet">
    <title>Ganbare Companion</title>
</head>
<body>
    <div id="companion-container" class="state-idle">
        <!-- Speech Bubble -->
        <div id="speech-bubble" class="hidden">
            <div id="speech-japanese"></div>
            <div id="speech-english"></div>
            <div class="bubble-tail"></div>
        </div>

        <!-- Character Images (one per state, swap visibility) -->
        <div id="character-wrapper">
            <img id="img-idle" class="character-img active" src="${idleImg}" alt="Companion - Idle" />
            <img id="img-worried" class="character-img" src="${worriedImg}" alt="Companion - Worried" />
            <img id="img-happy" class="character-img" src="${happyImg}" alt="Companion - Happy" />
            <img id="img-encouraging" class="character-img" src="${encouragingImg}" alt="Companion - Encouraging" />
        </div>

        <!-- Status indicator -->
        <div id="status-bar">
            <span id="status-dot"></span>
            <span id="status-text">Standing by...</span>
        </div>
    </div>

    <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
}

/**
 * Generate a random nonce string for CSP script security.
 */
function getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
