import * as vscode from 'vscode';

export type IdleCallback = () => void;

export class IdleTracker implements vscode.Disposable {
    private readonly disposables: vscode.Disposable[] = [];
    private idleTimer: ReturnType<typeof setTimeout> | undefined;
    private timeoutMs: number;
    private isIdle = false;

    constructor(private readonly callback: IdleCallback) {
        this.timeoutMs = this.getTimeoutFromConfig();

        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(this.onDocumentChanged, this)
        );

        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged, this)
        );

        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(this.onConfigChanged, this)
        );

        if (vscode.window.activeTextEditor) {
            this.resetTimer();
        }
    }

    private getTimeoutFromConfig(): number {
        const config = vscode.workspace.getConfiguration('ganbareCompanion');
        const minutes = config.get<number>('idleTimeoutMinutes', 2);
        return minutes * 60 * 1000;
    }

    private onDocumentChanged(event: vscode.TextDocumentChangeEvent): void {
        if (event.document.uri.scheme !== 'file') {
            return;
        }
        this.isIdle = false;
        this.resetTimer();
    }

    private onActiveEditorChanged(editor: vscode.TextEditor | undefined): void {
        if (editor) {
            this.isIdle = false;
            this.resetTimer();
        } else {
            this.clearTimer();
        }
    }

    private onConfigChanged(event: vscode.ConfigurationChangeEvent): void {
        if (event.affectsConfiguration('ganbareCompanion.idleTimeoutMinutes')) {
            this.timeoutMs = this.getTimeoutFromConfig();
            if (vscode.window.activeTextEditor) {
                this.resetTimer();
            }
        }
    }

    private resetTimer(): void {
        this.clearTimer();
        this.idleTimer = setTimeout(() => {
            const config = vscode.workspace.getConfiguration('ganbareCompanion');
            if (vscode.window.activeTextEditor && config.get<boolean>('enabled', true)) {
                this.isIdle = true;
                this.callback();
            }
        }, this.timeoutMs);
    }

    private clearTimer(): void {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
        }
    }

    public getIsIdle(): boolean {
        return this.isIdle;
    }

    dispose(): void {
        this.clearTimer();
        this.disposables.forEach(d => d.dispose());
    }
}
