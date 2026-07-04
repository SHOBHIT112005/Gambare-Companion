/**
 * webview.js — Ganbare Companion Frontend Controller
 * 
 * Manages Live2D WebGL animations (Shizuku), speech bubble display,
 * and state transitions. Runs inside the VS Code webview context.
 */

(function () {
    'use strict';

    // ═══ VS Code API ═══
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    // ═══ DOM References ═══
    const container = document.getElementById('companion-container');
    const speechBubble = document.getElementById('speech-bubble');
    const speechJapanese = document.getElementById('speech-japanese');
    const speechEnglish = document.getElementById('speech-english');
    const statusText = document.getElementById('status-text');
    const canvas = document.getElementById('spine-canvas'); // reusing canvas ID

    // ═══════════════════════════════════════════════════════════════════
    // LIVE2D WEBGL SETUP
    // ═══════════════════════════════════════════════════════════════════
    
    let live2dCharacter = null;
    let app = new PIXI.Application({
        view: canvas,
        width: 300,
        height: 400,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });

    // Map companion states to Shizuku's native motion groups
    // Shizuku motions: idle, tap_body, pinch_in, pinch_out, shake, flick_head
    const ANIMATION_MAP = {
        idle: 'idle',
        worried: 'tap_body',      // nervous fidgeting
        happy: 'flick_head',      // happy nodding/bouncing
        encouraging: 'pinch_out', // leaning in
        excited: 'flick_head',    // excited bouncing
        shy: 'pinch_in',          // shy recoil
        embarrassed: 'tap_body',  // embarrassed fidgeting
        sad: 'shake'              // shaking head sadly
    };

    async function loadLive2DModel() {
        if (!window.LIVE2D_MODEL_URI) {
            console.error('[Ganbare] No LIVE2D_MODEL_URI provided.');
            return;
        }

        // Network interceptors to fix VS Code Webview URI mangling silently
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            if (typeof args[0] === 'string' && args[0].includes('https://file/%2B')) {
                args[0] = args[0].replace('https://file/%2B', 'https://file%2B');
            }
            return originalFetch.apply(this, args);
        };

        const originalXHR = window.XMLHttpRequest.prototype.open;
        window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            if (typeof url === 'string' && url.includes('https://file/%2B')) {
                url = url.replace('https://file/%2B', 'https://file%2B');
            }
            originalXHR.call(this, method, url, ...rest);
        };

        const originalImageSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
            set: function(val) {
                if (typeof val === 'string' && val.includes('https://file/%2B')) {
                    val = val.replace('https://file/%2B', 'https://file%2B');
                }
                originalImageSrc.set.call(this, val);
            },
            get: function() {
                return originalImageSrc.get.call(this);
            }
        });

        try {
            live2dCharacter = await PIXI.live2d.Live2DModel.from(window.LIVE2D_MODEL_URI);
            
            // Fit character to canvas nicely
            const baseWidth = live2dCharacter.width / live2dCharacter.scale.x;
            const baseHeight = live2dCharacter.height / live2dCharacter.scale.y;
            
            const scaleX = app.screen.width / baseWidth;
            const scaleY = app.screen.height / baseHeight;
            const scale = Math.min(scaleX, scaleY) * 1.4; 
            
            live2dCharacter.scale.set(scale);
            
            // Center horizontally, align to bottom vertically
            // (live2dCharacter.width already includes the scale, so we don't multiply by scale again!)
            live2dCharacter.x = (app.screen.width - live2dCharacter.width) / 2;
            live2dCharacter.y = app.screen.height - live2dCharacter.height + 60;

            app.stage.addChild(live2dCharacter);
            
            playLive2DAnimation('idle');
            console.log('[Ganbare] Live2D Shizuku loaded successfully!');
            
            // Handle Interaction
            live2dCharacter.on('hit', hitAreas => {
                if (hitAreas.includes('head')) {
                    playLive2DAnimation('happy'); // Petting head
                } else {
                    playLive2DAnimation('shy');
                }
            });
        } catch (e) {
            console.error('Failed to load Live2D model:', e);
        }
    }

    let currentAnimLoop = null;

    async function playLive2DAnimation(state) {
        if (!live2dCharacter) return;
        
        if (currentAnimLoop) {
            clearTimeout(currentAnimLoop);
            currentAnimLoop = null;
        }

        const animName = ANIMATION_MAP[state] || 'idle';
        
        // Delay playing the animation to match OS-level PowerShell audio startup time (~600ms).
        // IDLE and SAD states don't have spoken audio, so they trigger instantly.
        const isVoiceState = state !== STATES.IDLE && state !== STATES.SAD;
        const delay = isVoiceState ? 600 : 0;
        
        setTimeout(async () => {
            const playLoop = async () => {
                if (currentState !== state) return; // Stop if state changed
                
                await live2dCharacter.motion(animName);
                
                // If we are still in a non-idle state, loop the animation so it doesn't just stop!
                if (currentState === state && state !== STATES.IDLE) {
                    currentAnimLoop = setTimeout(playLoop, 300);
                }
            };
            playLoop();
        }, delay);
    }

    // ═══════════════════════════════════════════════════════════════════
    // STATE MACHINE
    // ═══════════════════════════════════════════════════════════════════

    var STATES = {
        IDLE: 'idle', WORRIED: 'worried', HAPPY: 'happy',
        ENCOURAGING: 'encouraging', EXCITED: 'excited',
        SHY: 'shy', EMBARRASSED: 'embarrassed', SAD: 'sad'
    };

    var STATE_DURATIONS = {
        worried: 10000, happy: 8000, encouraging: 12000,
        excited: 10000, shy: 8000, embarrassed: 7000, sad: 14000
    };

    var STATUS_MESSAGES = {
        idle: 'Standing by... ♡', worried: 'Oh no, an error!',
        happy: 'Yay! All fixed! ✨', encouraging: 'You can do it! 💪',
        excited: 'AMAZING!! ✨🎉✨', shy: 'E-ehehe... ♡',
        embarrassed: 'D-don\'t look! 💦', sad: 'I miss you... 🥺'
    };

    var currentState = STATES.IDLE;
    var stateTimer = null;
    var bubbleTimer = null;

    function transitionTo(newState, phrase) {
        if (stateTimer) { clearTimeout(stateTimer); stateTimer = null; }
        if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null; }

        currentState = newState;
        container.className = 'state-' + newState;
        
        playLive2DAnimation(newState);
        statusText.textContent = STATUS_MESSAGES[newState] || 'Standing by...';

        if (phrase) {
            showSpeechBubble(phrase.japanese, phrase.english);
        }

        if (newState !== STATES.IDLE) {
            var duration = STATE_DURATIONS[newState] || 8000;
            stateTimer = setTimeout(function () {
                transitionTo(STATES.IDLE, null);
            }, duration);

            bubbleTimer = setTimeout(hideSpeechBubble, duration - 1500);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPEECH BUBBLE
    // ═══════════════════════════════════════════════════════════════════

    function showSpeechBubble(japanese, english) {
        speechJapanese.textContent = japanese || '';
        speechEnglish.textContent = english || '';
        speechBubble.classList.remove('hidden', 'animate-in');
        void speechBubble.offsetWidth;
        speechBubble.classList.add('animate-in');
    }

    function hideSpeechBubble() {
        speechBubble.classList.add('hidden');
        speechBubble.classList.remove('animate-in');
    }

    // ═══════════════════════════════════════════════════════════════════
    // MESSAGE HANDLER
    // ═══════════════════════════════════════════════════════════════════

    window.addEventListener('message', function (event) {
        var message = event.data;
        if (!message || !message.type) return;

        switch (message.type) {
            case 'TRIGGER_ERROR': transitionTo(STATES.WORRIED, message.phrase); break;
            case 'TRIGGER_STUCK': transitionTo(STATES.ENCOURAGING, message.phrase); break;
            case 'TRIGGER_FIXED': transitionTo(STATES.HAPPY, message.phrase); break;
            case 'TRIGGER_EXCITED': transitionTo(STATES.EXCITED, message.phrase); break;
            case 'TRIGGER_SHY': transitionTo(STATES.SHY, message.phrase); break;
            case 'TRIGGER_EMBARRASSED': transitionTo(STATES.EMBARRASSED, message.phrase); break;
            case 'TRIGGER_SAD': transitionTo(STATES.SAD, message.phrase); break;
            case 'TRIGGER_IDLE':
                if (message.phrase) {
                    showSpeechBubble(message.phrase.japanese, message.phrase.english);
                    bubbleTimer = setTimeout(hideSpeechBubble, 6000);
                }
                break;
        }
    });

    // ═══════════════════════════════════════════════════════════════════
    // INTERACTION
    // ═══════════════════════════════════════════════════════════════════

    canvas.addEventListener('click', function () {
        if (currentState === STATES.IDLE) {
            vscode.postMessage({ command: 'click' });
        }
    });

    // ═══════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    function init() {
        container.className = 'state-idle';
        hideSpeechBubble();
        loadLive2DModel();
        vscode.postMessage({ command: 'ready' });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
