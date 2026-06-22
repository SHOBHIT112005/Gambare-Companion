"use strict";
/**
 * GanbareViewProvider.ts — WebviewViewProvider for the anime companion
 *
 * Manages the webview lifecycle, generates the HTML content with
 * secure CSP, and provides methods for the extension host to
 * send messages to the webview frontend.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GanbareViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const phrases_1 = require("./phrases");
class GanbareViewProvider {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
    }
    /**
     * Called by VS Code when the webview view is first made visible.
     */
    resolveWebviewView(webviewView, _context, _token) {
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
        webviewView.webview.onDidReceiveMessage((message) => this.handleWebviewMessage(message), undefined);
    }
    /**
     * Send a trigger event to the webview with a random phrase.
     */
    sendTrigger(type, context) {
        if (!this.view) {
            return;
        }
        // Select the appropriate phrase category
        let phrase;
        switch (type) {
            case 'TRIGGER_ERROR':
                phrase = (0, phrases_1.getRandomPhrase)(phrases_1.errorPhrases, 'error');
                break;
            case 'TRIGGER_STUCK':
                phrase = (0, phrases_1.getRandomPhrase)(phrases_1.stuckPhrases, 'stuck');
                break;
            case 'TRIGGER_FIXED':
                phrase = (0, phrases_1.getRandomPhrase)(phrases_1.fixedPhrases, 'fixed');
                break;
            case 'TRIGGER_IDLE':
                phrase = (0, phrases_1.getRandomPhrase)(phrases_1.idlePhrases, 'idle');
                break;
        }
        // Read voice settings from configuration
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        const message = {
            type,
            phrase,
            context,
            voiceEnabled: config.get('voiceEnabled', true),
            voicePitch: config.get('voicePitch', 1.3),
            voiceRate: config.get('voiceRate', 0.9)
        };
        this.view.webview.postMessage(message);
    }
    /**
     * Handle messages coming back from the webview.
     */
    handleWebviewMessage(message) {
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
    getHtmlForWebview(webview) {
        // Generate URIs for local resources
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'webview.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'webview.css'));
        // Character image URIs for each state
        const idleImg = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'character_idle.png'));
        const worriedImg = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'character_worried.png'));
        const happyImg = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'character_happy.png'));
        const encouragingImg = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'character_encouraging.png'));
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
exports.GanbareViewProvider = GanbareViewProvider;
GanbareViewProvider.viewType = 'ganbareCompanion.characterView';
/**
 * Generate a random nonce string for CSP script security.
 */
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=GanbareViewProvider.js.map