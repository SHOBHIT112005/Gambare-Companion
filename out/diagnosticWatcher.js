"use strict";
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
exports.DiagnosticWatcher = void 0;
const vscode = __importStar(require("vscode"));
class DiagnosticWatcher {
    constructor(callback) {
        this.callback = callback;
        this.disposables = [];
        /** Tracks the last known error count per file URI */
        this.errorCounts = new Map();
        /** Debounce delay in milliseconds */
        this.debounceMs = 300;
        /** Pending URI changes to process after debounce */
        this.pendingUris = new Set();
        // Subscribe to diagnostic changes
        this.disposables.push(vscode.languages.onDidChangeDiagnostics(this.onDiagnosticsChanged, this));
        // Initialize with current diagnostics for open editors
        this.initializeCurrentDiagnostics();
    }
    /**
     * Snapshot the current error counts so we don't fire false positives
     * for pre-existing errors on activation.
     */
    initializeCurrentDiagnostics() {
        const allDiagnostics = vscode.languages.getDiagnostics();
        for (const [uri, diagnostics] of allDiagnostics) {
            const errorCount = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
            if (errorCount > 0) {
                this.errorCounts.set(uri.toString(), errorCount);
            }
        }
    }
    /**
     * Called when diagnostics change for any file.
     * Collects URIs and debounces processing.
     */
    onDiagnosticsChanged(event) {
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
    processPendingChanges() {
        const urisToProcess = new Set(this.pendingUris);
        this.pendingUris.clear();
        for (const uriString of urisToProcess) {
            const uri = vscode.Uri.parse(uriString);
            const diagnostics = vscode.languages.getDiagnostics(uri);
            // Count only Error severity (ignore warnings, info, hints)
            const currentErrorCount = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
            const previousErrorCount = this.errorCounts.get(uriString) ?? 0;
            if (currentErrorCount > previousErrorCount) {
                // New errors appeared
                const firstError = diagnostics.find(d => d.severity === vscode.DiagnosticSeverity.Error);
                this.callback({
                    type: 'error_appeared',
                    uri,
                    errorCount: currentErrorCount,
                    sampleMessage: firstError?.message
                });
            }
            else if (currentErrorCount === 0 && previousErrorCount > 0) {
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
            }
            else {
                this.errorCounts.delete(uriString);
            }
        }
    }
    dispose() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.disposables.forEach(d => d.dispose());
    }
}
exports.DiagnosticWatcher = DiagnosticWatcher;
//# sourceMappingURL=diagnosticWatcher.js.map