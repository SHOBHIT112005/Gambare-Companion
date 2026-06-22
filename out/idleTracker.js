"use strict";
/**
 * idleTracker.ts — Detects when the user is idle/stuck
 *
 * Monitors text document changes to detect typing activity.
 * After a configurable period of inactivity (default: 5 minutes),
 * fires a callback to trigger the companion's encouragement.
 *
 * Only activates when there's an active text editor open.
 * Dynamically responds to configuration changes.
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
exports.IdleTracker = void 0;
const vscode = __importStar(require("vscode"));
class IdleTracker {
    constructor(callback) {
        this.callback = callback;
        this.disposables = [];
        this.isIdle = false;
        // Read initial timeout from configuration
        this.timeoutMs = this.getTimeoutFromConfig();
        // Listen for text document changes (keystrokes)
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(this.onDocumentChanged, this));
        // Listen for active editor changes
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged, this));
        // Listen for configuration changes
        this.disposables.push(vscode.workspace.onDidChangeConfiguration(this.onConfigChanged, this));
        // Start the timer if there's already an active editor
        if (vscode.window.activeTextEditor) {
            this.resetTimer();
        }
    }
    /**
     * Read the idle timeout from VS Code configuration.
     */
    getTimeoutFromConfig() {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        const minutes = config.get('idleTimeoutMinutes', 5);
        return minutes * 60 * 1000; // Convert to milliseconds
    }
    /**
     * Called every time the user types in a document.
     * Resets the idle timer.
     */
    onDocumentChanged(event) {
        // Only track changes to code files (not output channels, etc.)
        if (event.document.uri.scheme !== 'file') {
            return;
        }
        // User is actively typing — reset idle state
        this.isIdle = false;
        this.resetTimer();
    }
    /**
     * Called when the user switches to a different editor.
     * Resets the idle timer since they're actively working.
     */
    onActiveEditorChanged(editor) {
        if (editor) {
            this.isIdle = false;
            this.resetTimer();
        }
        else {
            // No active editor — clear the timer
            this.clearTimer();
        }
    }
    /**
     * Called when VS Code configuration changes.
     * Updates the timeout if our setting changed.
     */
    onConfigChanged(event) {
        if (event.affectsConfiguration('ganbareCompanion.idleTimeoutMinutes')) {
            this.timeoutMs = this.getTimeoutFromConfig();
            // Restart timer with new duration
            if (vscode.window.activeTextEditor) {
                this.resetTimer();
            }
        }
    }
    /**
     * Reset (restart) the idle timer.
     */
    resetTimer() {
        this.clearTimer();
        this.idleTimer = setTimeout(() => {
            // Only fire if there's still an active editor and extension is enabled
            const config = vscode.workspace.getConfiguration('ganbareCompanion');
            if (vscode.window.activeTextEditor && config.get('enabled', true)) {
                this.isIdle = true;
                this.callback();
                // Don't auto-restart — wait for next keystroke to reset
            }
        }, this.timeoutMs);
    }
    /**
     * Clear the idle timer.
     */
    clearTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
        }
    }
    /**
     * Check if the user is currently in the idle state.
     */
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