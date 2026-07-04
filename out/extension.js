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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const GanbareViewProvider_1 = require("./GanbareViewProvider");
const diagnosticWatcher_1 = require("./diagnosticWatcher");
const idleTracker_1 = require("./idleTracker");
function activate(context) {
    console.log('[Ganbare Companion] Extension activating...');
    const provider = new GanbareViewProvider_1.GanbareViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(GanbareViewProvider_1.GanbareViewProvider.viewType, provider, {
        // Keep the webview content alive even when the view is hidden
        webviewOptions: {
            retainContextWhenHidden: true
        }
    }));
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(GanbareViewProvider_1.GanbareViewProvider.panelViewType, provider, {
        webviewOptions: {
            retainContextWhenHidden: true
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('ganbareCompanion.openInPanel', () => {
        vscode.commands.executeCommand('ganbareCompanion.characterViewPanel.focus');
    }));
    const diagnosticWatcher = new diagnosticWatcher_1.DiagnosticWatcher((event) => {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        if (!config.get('enabled', true)) {
            return;
        }
        if (event.type === 'error_appeared') {
            console.log(`[Ganbare] Errors appeared in ${event.uri.fsPath}: ${event.errorCount} error(s)`);
            provider.sendTrigger('TRIGGER_ERROR', event.sampleMessage);
        }
        else if (event.type === 'error_fixed') {
            console.log(`[Ganbare] All errors fixed in ${event.uri.fsPath}`);
            if (Math.random() < 0.35) {
                provider.sendTrigger('TRIGGER_EXCITED');
            }
            else {
                provider.sendTrigger('TRIGGER_FIXED');
            }
        }
    });
    context.subscriptions.push(diagnosticWatcher);
    let idleFireCount = 0;
    const idleTracker = new idleTracker_1.IdleTracker(() => {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        if (!config.get('enabled', true)) {
            return;
        }
        idleFireCount++;
        if (idleFireCount >= 2) {
            console.log('[Ganbare] User has been idle for a long time — sad mode');
            provider.sendTrigger('TRIGGER_SAD');
            idleFireCount = 0;
        }
        else {
            console.log('[Ganbare] User appears to be stuck/idle');
            provider.sendTrigger('TRIGGER_STUCK');
        }
    });
    context.subscriptions.push(idleTracker);
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
        idleFireCount = 0;
    }));
    console.log('[Ganbare Companion] Extension activated successfully!');
}
function deactivate() {
    console.log('[Ganbare Companion] Extension deactivated.');
}
//# sourceMappingURL=extension.js.map