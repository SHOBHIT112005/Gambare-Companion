/**
 * webview.js — Ganbare Companion Frontend Controller
 * 
 * Manages character image state transitions, speech bubble display,
 * and Japanese TTS via Web Speech API.
 * 
 * Runs inside the VS Code webview context.
 */

(function () {
    'use strict';

    // ═══ VS Code API ═══
    // @ts-ignore — acquireVsCodeApi is injected by VS Code
    const vscode = acquireVsCodeApi();

    // ═══ DOM References ═══
    const container = document.getElementById('companion-container');
    const speechBubble = document.getElementById('speech-bubble');
    const speechJapanese = document.getElementById('speech-japanese');
    const speechEnglish = document.getElementById('speech-english');
    const statusText = document.getElementById('status-text');
    const characterWrapper = document.getElementById('character-wrapper');

    // Character images
    const imgIdle = document.getElementById('img-idle');
    const imgWorried = document.getElementById('img-worried');
    const imgHappy = document.getElementById('img-happy');
    const imgEncouraging = document.getElementById('img-encouraging');

    const imageMap = {
        idle: imgIdle,
        worried: imgWorried,
        happy: imgHappy,
        encouraging: imgEncouraging
    };

    // ═══════════════════════════════════════════════════════════════════
    // STATE MACHINE
    // ═══════════════════════════════════════════════════════════════════

    const STATES = {
        IDLE: 'idle',
        WORRIED: 'worried',
        HAPPY: 'happy',
        ENCOURAGING: 'encouraging'
    };

    /** How long non-idle states last before returning to idle (ms) */
    const STATE_DURATIONS = {
        worried: 10000,
        happy: 8000,
        encouraging: 12000
    };

    const STATUS_MESSAGES = {
        idle: 'Standing by... ♡',
        worried: 'Oh no, an error!',
        happy: 'Yay! All fixed! ✨',
        encouraging: 'You can do it! 💪'
    };

    let currentState = STATES.IDLE;
    let stateTimer = null;
    let bubbleTimer = null;

    /**
     * Switch the visible character image to match the new state.
     */
    function switchCharacterImage(state) {
        // Hide all images
        Object.values(imageMap).forEach(function (img) {
            if (img) { img.classList.remove('active'); }
        });
        // Show the image for this state
        var target = imageMap[state];
        if (target) {
            target.classList.add('active');
        }
    }

    /**
     * Transition the character to a new state.
     */
    function transitionTo(newState, phrase, voiceSettings) {
        // Clear any existing timers
        if (stateTimer) { clearTimeout(stateTimer); stateTimer = null; }
        if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null; }

        currentState = newState;

        // Update CSS state class on the container (drives animations)
        container.className = 'state-' + newState;

        // Switch the character image
        switchCharacterImage(newState);

        // Update status bar text
        statusText.textContent = STATUS_MESSAGES[newState] || 'Standing by...';

        // Show speech bubble with phrase
        if (phrase) {
            showSpeechBubble(phrase.japanese, phrase.english);

            // Speak the phrase
            if (voiceSettings && voiceSettings.voiceEnabled) {
                speak(phrase.japanese, voiceSettings);
            }
        }

        // Auto-return to idle after duration
        if (newState !== STATES.IDLE) {
            var duration = STATE_DURATIONS[newState] || 8000;
            stateTimer = setTimeout(function () {
                transitionTo(STATES.IDLE, null, null);
            }, duration);

            // Hide bubble slightly before returning to idle
            bubbleTimer = setTimeout(function () {
                hideSpeechBubble();
            }, duration - 1500);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPEECH BUBBLE
    // ═══════════════════════════════════════════════════════════════════

    function showSpeechBubble(japanese, english) {
        speechJapanese.textContent = japanese || '';
        speechEnglish.textContent = english || '';

        speechBubble.classList.remove('hidden');
        speechBubble.classList.remove('animate-in');
        // Force reflow to restart animation
        void speechBubble.offsetWidth;
        speechBubble.classList.add('animate-in');
    }

    function hideSpeechBubble() {
        speechBubble.classList.add('hidden');
        speechBubble.classList.remove('animate-in');
    }

    // ═══════════════════════════════════════════════════════════════════
    // SPEECH SYNTHESIS (TTS) ENGINE
    // ═══════════════════════════════════════════════════════════════════

    var speechSynth = null;
    var japaneseVoice = null;
    var voicesReady = false;

    /**
     * Initialize the speech synthesis engine.
     */
    function initSpeech() {
        try {
            if (typeof window.speechSynthesis === 'undefined') {
                console.log('[Ganbare] SpeechSynthesis API not available');
                return;
            }

            speechSynth = window.speechSynthesis;

            // Try loading voices (may be available synchronously)
            loadVoices();

            // Also wait for the async voiceschanged event
            if (speechSynth.onvoiceschanged !== undefined) {
                speechSynth.addEventListener('voiceschanged', loadVoices);
            }

            // Fallback: try again after a short delay (some browsers need this)
            setTimeout(loadVoices, 500);
            setTimeout(loadVoices, 2000);

            console.log('[Ganbare] Speech synthesis initialized');
        } catch (e) {
            console.log('[Ganbare] Speech synthesis init error:', e);
        }
    }

    /**
     * Load available voices and find a Japanese one.
     */
    function loadVoices() {
        if (!speechSynth) { return; }

        try {
            var voices = speechSynth.getVoices();
            if (!voices || voices.length === 0) { return; }

            voicesReady = true;

            // Priority: Microsoft Nanami (Windows) > Google Japanese > any ja-JP
            japaneseVoice =
                voices.find(function (v) { return v.name.indexOf('Nanami') !== -1; }) ||
                voices.find(function (v) { return v.name.indexOf('Haruka') !== -1; }) ||
                voices.find(function (v) { return v.name.indexOf('Ayumi') !== -1; }) ||
                voices.find(function (v) { return v.name.indexOf('Google') !== -1 && v.lang.indexOf('ja') === 0; }) ||
                voices.find(function (v) { return v.lang === 'ja-JP'; }) ||
                voices.find(function (v) { return v.lang.indexOf('ja') === 0; }) ||
                null;

            if (japaneseVoice) {
                console.log('[Ganbare] Found Japanese voice:', japaneseVoice.name, '(' + japaneseVoice.lang + ')');
            } else {
                console.log('[Ganbare] No Japanese voice found. Voices available:',
                    voices.length, '—', voices.slice(0, 5).map(function (v) { return v.name + ' (' + v.lang + ')'; }).join(', '));
            }
        } catch (e) {
            console.log('[Ganbare] Voice loading error:', e);
        }
    }

    /**
     * Speak a Japanese text string using the Web Speech API.
     */
    function speak(text, settings) {
        if (!speechSynth || !text) { return; }

        try {
            // Cancel any ongoing speech
            speechSynth.cancel();

            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ja-JP';

            if (japaneseVoice) {
                utterance.voice = japaneseVoice;
            }

            // Apply voice settings
            utterance.pitch = (settings && settings.voicePitch) || 1.3;
            utterance.rate = (settings && settings.voiceRate) || 0.9;
            utterance.volume = 0.85;

            utterance.onerror = function (event) {
                console.log('[Ganbare] Speech error:', event.error);
            };

            utterance.onend = function () {
                console.log('[Ganbare] Speech finished');
            };

            // Workaround: Chrome/Electron sometimes pauses long utterances
            // Resume periodically to prevent pausing
            var resumeInterval = setInterval(function () {
                if (speechSynth && speechSynth.speaking) {
                    speechSynth.resume();
                } else {
                    clearInterval(resumeInterval);
                }
            }, 5000);

            speechSynth.speak(utterance);
            console.log('[Ganbare] Speaking:', text);
        } catch (e) {
            console.log('[Ganbare] Speak error:', e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // MESSAGE HANDLER (from extension host)
    // ═══════════════════════════════════════════════════════════════════

    window.addEventListener('message', function (event) {
        var message = event.data;
        if (!message || !message.type) { return; }

        var voiceSettings = {
            voiceEnabled: message.voiceEnabled !== undefined ? message.voiceEnabled : true,
            voicePitch: message.voicePitch || 1.3,
            voiceRate: message.voiceRate || 0.9
        };

        switch (message.type) {
            case 'TRIGGER_ERROR':
                transitionTo(STATES.WORRIED, message.phrase, voiceSettings);
                break;

            case 'TRIGGER_STUCK':
                transitionTo(STATES.ENCOURAGING, message.phrase, voiceSettings);
                break;

            case 'TRIGGER_FIXED':
                transitionTo(STATES.HAPPY, message.phrase, voiceSettings);
                break;

            case 'TRIGGER_IDLE':
                // For idle triggers with a phrase (like greetings), show it briefly
                if (message.phrase) {
                    showSpeechBubble(message.phrase.japanese, message.phrase.english);
                    if (voiceSettings.voiceEnabled) {
                        speak(message.phrase.japanese, voiceSettings);
                    }
                    bubbleTimer = setTimeout(hideSpeechBubble, 6000);
                }
                break;

            default:
                console.log('[Ganbare] Unknown message type:', message.type);
        }
    });

    // ═══════════════════════════════════════════════════════════════════
    // CHARACTER CLICK INTERACTION
    // ═══════════════════════════════════════════════════════════════════

    if (characterWrapper) {
        characterWrapper.addEventListener('click', function () {
            if (currentState === STATES.IDLE) {
                // Ask the extension host for a random greeting
                vscode.postMessage({ command: 'ready' });
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════

    function init() {
        // Initialize speech synthesis
        initSpeech();

        // Start in idle state
        container.className = 'state-idle';
        switchCharacterImage('idle');
        hideSpeechBubble();

        // Notify the extension host that the webview is ready
        vscode.postMessage({ command: 'ready' });

        console.log('[Ganbare] Webview initialized!');
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
