"use strict";
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
exports.IdleTracker = void 0;
const vscode = __importStar(require("vscode"));
class IdleTracker {
    constructor(callback) {
        this.callback = callback;
        this.disposables = [];
        this.isIdle = false;
        this.timeoutMs = this.getTimeoutFromConfig();
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(this.onDocumentChanged, this));
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged, this));
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(this.onConfigChanged, this));
        if (vscode.window.activeTextEditor) {
            this.resetTimer();
        }
    }
    getTimeoutFromConfig() {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        const minutes = config.get('idleTimeoutMinutes', 2);
        return minutes * 60 * 1000;
    }
    onDocumentChanged(event) {
        if (event.document.uri.scheme !== 'file') {
            return;
        }
        this.isIdle = false;
        this.resetTimer();
    }
    onActiveEditorChanged(editor) {
        if (editor) {
            this.isIdle = false;
            this.resetTimer();
        }
        else {
            this.clearTimer();
        }
    }
    onConfigChanged(event) {
        if (event.affectsConfiguration('ganbareCompanion.idleTimeoutMinutes')) {
            this.timeoutMs = this.getTimeoutFromConfig();
            if (vscode.window.activeTextEditor) {
                this.resetTimer();
            }
        }
    }
    resetTimer() {
        this.clearTimer();
        this.idleTimer = setTimeout(() => {
            const config = vscode.workspace.getConfiguration('ganbareCompanion');
            if (vscode.window.activeTextEditor && config.get('enabled', true)) {
                this.isIdle = true;
                this.callback();
            }
        }, this.timeoutMs);
    }
    clearTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
        }
    }
    getIsIdle() {
        return this.isIdle;
    }
    dispose() {
        this.clearTimer();
        this.disposables.forEach(d => d.dispose());
    }
}
exports.IdleTracker = IdleTracker;
//# sourceMappingURL=idleTracker.js.map