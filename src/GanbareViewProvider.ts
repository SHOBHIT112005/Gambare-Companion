/**
 * GanbareViewProvider.ts — WebviewViewProvider for the anime companion
 * 
 * Manages the webview lifecycle, generates the HTML content with
 * secure CSP, and provides methods for the extension host to
 * send messages to the webview frontend.
 * 
 * Supports multiple views (sidebar + panel) simultaneously.
 */

import * as vscode from 'vscode';
import type { Phrase } from './phrases';
import {
    getRandomPhrase,
    errorPhrases,
    stuckPhrases,
    fixedPhrases,
    idlePhrases,
    excitedPhrases,
    shyPhrases,
    embarrassedPhrases,
    sadPhrases
} from './phrases';
import { playAudio } from './audioPlayer';
import * as path from 'path';

export type TriggerType =
    | 'TRIGGER_ERROR'
    | 'TRIGGER_STUCK'
    | 'TRIGGER_FIXED'
    | 'TRIGGER_IDLE'
    | 'TRIGGER_EXCITED'
    | 'TRIGGER_SHY'
    | 'TRIGGER_EMBARRASSED'
    | 'TRIGGER_SAD';

export interface TriggerMessage {
    type: TriggerType;
    phrase: Phrase;
    /** Optional context data (e.g., error message) */
    context?: string;
    /** Resolved webview URI for the audio file */
    audioUri?: string;
    /** Voice settings from configuration */
    voiceEnabled: boolean;
    voicePitch: number;
    voiceRate: number;
}

export class GanbareViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ganbareCompanion.characterView';
    public static readonly panelViewType = 'ganbareCompanion.characterViewPanel';

    /** Track all active webview views (sidebar + panel) */
    private views: vscode.WebviewView[] = [];

    constructor(private readonly extensionUri: vscode.Uri) {}

    /**
     * Called by VS Code when the webview view is first made visible.
     */
    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        // Add to active views
        this.views.push(webviewView);

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

        // Remove the view from tracking when it's disposed
        webviewView.onDidDispose(() => {
            this.views = this.views.filter(v => v !== webviewView);
        });
    }

    /**
     * Send a trigger event to all active webviews with a random phrase.
     */
    public sendTrigger(type: TriggerType, context?: string): void {
        if (this.views.length === 0) {
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
            case 'TRIGGER_EXCITED':
                phrase = getRandomPhrase(excitedPhrases, 'excited');
                break;
            case 'TRIGGER_SHY':
                phrase = getRandomPhrase(shyPhrases, 'shy');
                break;
            case 'TRIGGER_EMBARRASSED':
                phrase = getRandomPhrase(embarrassedPhrases, 'embarrassed');
                break;
            case 'TRIGGER_SAD':
                phrase = getRandomPhrase(sadPhrases, 'sad');
                break;
        }

        // Read voice settings from configuration
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        const voiceEnabled = config.get<boolean>('voiceEnabled', true);

        // Resolve audio URI if the phrase has an audio file
        let audioUri: string | undefined;
        if (phrase.audioFile && this.views.length > 0) {
            audioUri = this.views[0].webview.asWebviewUri(
                vscode.Uri.joinPath(this.extensionUri, 'media', 'voices', phrase.audioFile)
            ).toString();
            
            // Play the audio via Node.js backend to bypass webview autoplay restrictions
            if (voiceEnabled) {
                const audioPath = path.join(this.extensionUri.fsPath, 'media', 'voices', phrase.audioFile);
                playAudio(audioPath);
            }
        }

        const message: TriggerMessage = {
            type,
            phrase,
            context,
            audioUri,
            voiceEnabled,
            voicePitch: config.get<number>('voicePitch', 1.3),
            voiceRate: config.get<number>('voiceRate', 0.75)
        };

        // Broadcast to all active views
        for (const view of this.views) {
            view.webview.postMessage(message);
        }
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
            case 'click': {
                // Character was clicked — pick a random personality reaction
                const roll = Math.random();
                if (roll < 0.4) {
                    this.sendTrigger('TRIGGER_SHY');
                } else if (roll < 0.65) {
                    this.sendTrigger('TRIGGER_EMBARRASSED');
                } else {
                    this.sendTrigger('TRIGGER_IDLE');
                }
                break;
            }
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

        // Pixi & Spine libraries
        const pixiUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'libs', 'pixi.min.js')
        );
        const unsafeEvalUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'libs', 'unsafe-eval.js')
        );
        const live2dCoreUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'libs', 'live2dcore.min.js')
        );
        const live2dUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'libs', 'live2d.min.js')
        );

        // Live2D model base URI (to pass to the webview JS)
        const live2dModelUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, 'media', 'shizuku', 'shizuku.model.json')
        ).toString();

        // Generate a nonce for inline script security
        const nonce = getNonce();

        return /*html*/ `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} data: blob:; media-src ${webview.cspSource}; font-src ${webview.cspSource}; connect-src ${webview.cspSource} blob:;">
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

        <!-- WebGL Canvas for Live2D Character -->
        <div id="character-wrapper">
            <canvas id="spine-canvas"></canvas>
        </div>

        <!-- Status indicator -->
        <div id="status-bar">
            <span id="status-dot"></span>
            <span id="status-text">Standing by...</span>
        </div>
    </div>

    <script nonce="${nonce}">
        window.LIVE2D_MODEL_URI = "${live2dModelUri}";
    </script>
    <script nonce="${nonce}" src="${pixiUri}"></script>
    <script nonce="${nonce}" src="${unsafeEvalUri}"></script>
    <script nonce="${nonce}" src="${live2dCoreUri}"></script>
    <script nonce="${nonce}" src="${live2dUri}"></script>
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
