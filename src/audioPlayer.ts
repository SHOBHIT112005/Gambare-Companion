import { spawn, ChildProcess } from 'child_process';
import * as os from 'os';

let currentProcess: ChildProcess | null = null;

export function playAudio(filePath: string): void {
    // Stop any currently playing audio
    stopAudio();

    const platform = os.platform();

    if (platform === 'win32') {
        // Windows: Use PowerShell and System.Windows.Media.MediaPlayer to play MP3
        // We use a 10-second sleep to keep the process alive while audio plays.
        // If stopAudio is called, we kill the process, which stops playback.
        const script = `
            Add-Type -AssemblyName presentationCore;
            $player = New-Object System.Windows.Media.MediaPlayer;
            $player.Open('${filePath.replace(/'/g, "''")}');
            $player.Play();
            Start-Sleep -Seconds 15;
        `;
        currentProcess = spawn('powershell', ['-Command', script]);
    } else if (platform === 'darwin') {
        // macOS: afplay is built-in
        currentProcess = spawn('afplay', [filePath]);
    } else {
        // Linux: Try ffplay (requires ffmpeg installed) or paplay
        currentProcess = spawn('ffplay', ['-nodisp', '-autoexit', filePath]);
    }

    if (currentProcess) {
        currentProcess.on('error', (err) => {
            console.error('[Ganbare] Audio process error:', err);
        });
        currentProcess.on('exit', () => {
            if (currentProcess === currentProcess) {
                currentProcess = null;
            }
        });
    }
}

export function stopAudio(): void {
    if (currentProcess) {
        try {
            currentProcess.kill();
        } catch (e) {
            console.error('[Ganbare] Failed to stop audio process:', e);
        }
        currentProcess = null;
    }
}
