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
exports.playAudio = playAudio;
exports.stopAudio = stopAudio;
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
let currentProcess = null;
function playAudio(filePath) {
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
        currentProcess = (0, child_process_1.spawn)('powershell', ['-Command', script]);
    }
    else if (platform === 'darwin') {
        // macOS: afplay is built-in
        currentProcess = (0, child_process_1.spawn)('afplay', [filePath]);
    }
    else {
        // Linux: Try ffplay (requires ffmpeg installed) or paplay
        currentProcess = (0, child_process_1.spawn)('ffplay', ['-nodisp', '-autoexit', filePath]);
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
function stopAudio() {
    if (currentProcess) {
        try {
            currentProcess.kill();
        }
        catch (e) {
            console.error('[Ganbare] Failed to stop audio process:', e);
        }
        currentProcess = null;
    }
}
//# sourceMappingURL=audioPlayer.js.map