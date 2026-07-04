
import * as vscode from 'vscode';
import { GanbareViewProvider } from './GanbareViewProvider';
import { DiagnosticWatcher } from './diagnosticWatcher';
import { IdleTracker } from './idleTracker';

export function activate(context: vscode.ExtensionContext): void {
    console.log('[Ganbare Companion] Extension activating...');

    const provider = new GanbareViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            GanbareViewProvider.viewType,
            provider,
            {
                // Keep the webview content alive even when the view is hidden
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            GanbareViewProvider.panelViewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ganbareCompanion.openInPanel', () => {
            vscode.commands.executeCommand('ganbareCompanion.characterViewPanel.focus');
        })
    );


    const diagnosticWatcher = new DiagnosticWatcher((event) => {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        if (event.type === 'error_appeared') {
            console.log(
                `[Ganbare] Errors appeared in ${event.uri.fsPath}: ${event.errorCount} error(s)`
            );
            provider.sendTrigger('TRIGGER_ERROR', event.sampleMessage);
        } else if (event.type === 'error_fixed') {
            console.log(`[Ganbare] All errors fixed in ${event.uri.fsPath}`);
            if (Math.random() < 0.35) {
                provider.sendTrigger('TRIGGER_EXCITED');
            } else {
                provider.sendTrigger('TRIGGER_FIXED');
            }
        }
    });

    context.subscriptions.push(diagnosticWatcher);


    let idleFireCount = 0;
    const idleTracker = new IdleTracker(() => {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        if (!config.get<boolean>('enabled', true)) {
            return;
        }

        idleFireCount++;

        if (idleFireCount >= 2) {
            console.log('[Ganbare] User has been idle for a long time — sad mode');
            provider.sendTrigger('TRIGGER_SAD');
            idleFireCount = 0;
        } else {
            console.log('[Ganbare] User appears to be stuck/idle');
            provider.sendTrigger('TRIGGER_STUCK');
        }
    });

    context.subscriptions.push(idleTracker);


    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(() => {
            idleFireCount = 0;
        })
    );

    console.log('[Ganbare Companion] Extension activated successfully!');
}

export function deactivate(): void {
    console.log('[Ganbare Companion] Extension deactivated.');
}
