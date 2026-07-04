"use strict";
/**
 * GanbareViewProvider.ts — WebviewViewProvider for the anime companion
 *
 * Manages the webview lifecycle, generates the HTML content with
 * secure CSP, and provides methods for the extension host to
 * send messages to the webview frontend.
 *
 * Supports multiple views (sidebar + panel) simultaneously.
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
const audioPlayer_1 = require("./audioPlayer");
const path = __importStar(require("path"));
class GanbareViewProvider {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
        /** Track all active webview views (sidebar + panel) */
        this.views = [];
    }
    /**
     * Called by VS Code when the webview view is first made visible.
     */
    resolveWebviewView(webviewView, _context, _token) {
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
        webviewView.webview.onDidReceiveMessage((message) => this.handleWebviewMessage(message), undefined);
        // Remove the view from tracking when it's disposed
        webviewView.onDidDispose(() => {
            this.views = this.views.filter(v => v !== webviewView);
        });
    }
    /**
     * Send a trigger event to all active webviews with a random phrase.
     */
    sendTrigger(type, context) {
        if (this.views.length === 0) {
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
            case 'TRIGGER_EXCITED':
                phrase = (0, phrases_1.getRandomPhrase)(phrases_1.excitedPhrases, 'excited');
                break;
            case 'TRIGGER_SHY':
                phrase = (0, phrases_1.getRandomPhrase)(phrases_1.shyPhrases, 'shy');
                break;
            case 'TRIGGER_EMBARRASSED':
                phrase = (0, phrases_1.getRandomPhrase)(phrases_1.embarrassedPhrases, 'embarrassed');
                break;
            case 'TRIGGER_SAD':
                phrase = (0, phrases_1.getRandomPhrase)(phrases_1.sadPhrases, 'sad');
                break;
        }
        // Read voice settings from configuration
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        const voiceEnabled = config.get('voiceEnabled', true);
        // Resolve audio URI if the phrase has an audio file
        let audioUri;
        if (phrase.audioFile && this.views.length > 0) {
            audioUri = this.views[0].webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'voices', phrase.audioFile)).toString();
            // Play the audio via Node.js backend to bypass webview autoplay restrictions
            if (voiceEnabled) {
                const audioPath = path.join(this.extensionUri.fsPath, 'media', 'voices', phrase.audioFile);
                (0, audioPlayer_1.playAudio)(audioPath);
            }
        }
        const message = {
            type,
            phrase,
            context,
            audioUri,
            voiceEnabled,
            voicePitch: config.get('voicePitch', 1.3),
            voiceRate: config.get('voiceRate', 0.75)
        };
        // Broadcast to all active views
        for (const view of this.views) {
            view.webview.postMessage(message);
        }
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
            case 'click': {
                // Character was clicked — pick a random personality reaction
                const roll = Math.random();
                if (roll < 0.4) {
                    this.sendTrigger('TRIGGER_SHY');
                }
                else if (roll < 0.65) {
                    this.sendTrigger('TRIGGER_EMBARRASSED');
                }
                else {
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
    getHtmlForWebview(webview) {
        // Generate URIs for local resources
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'webview.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'webview.css'));
        // Pixi & Spine libraries
        const pixiUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'libs', 'pixi.min.js'));
        const unsafeEvalUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'libs', 'unsafe-eval.js'));
        const live2dCoreUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'libs', 'live2dcore.min.js'));
        const live2dUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'libs', 'live2d.min.js'));
        // Live2D model base URI (to pass to the webview JS)
        const live2dModelUri = webview.asWebviewUri(vscode.Uri.joinPath(this.extensionUri, 'media', 'shizuku', 'shizuku.model.json')).toString();
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
exports.GanbareViewProvider = GanbareViewProvider;
GanbareViewProvider.viewType = 'ganbareCompanion.characterView';
GanbareViewProvider.panelViewType = 'ganbareCompanion.characterViewPanel';
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