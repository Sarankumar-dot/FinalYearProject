/**
 * voiceCommandEngine.js
 *
 * Core voice recognition engine using the Web Speech API.
 * Provides continuous speech recognition, wake-word detection,
 * NLP-lite command parsing, and anti-overlap TTS management.
 *
 * Only for visually-impaired students.
 */

// ─── constants ──────────────────────────────────────────────────────────────

const WAKE_WORDS = ['hey companion', 'hello assistant', 'hey assistant'];
const WAKE_WORD_TIMEOUT_MS = 10000; // Listen for commands for 10s after wake word
const DEBOUNCE_MS = 1500;           // Ignore duplicate triggers within this time

// Filler words to strip from transcripts before matching
const FILLER_WORDS = [
  'please', 'can you', 'could you', 'would you', 'i want to',
  'i need to', 'let me', 'just', 'um', 'uh', 'like', 'okay',
  'so', 'well', 'actually', 'basically',
];

// ─── class ──────────────────────────────────────────────────────────────────

export class VoiceCommandEngine {
  constructor() {
    this.recognition = null;
    this.isSupported = false;
    this.isListening = false;
    this.isPaused = false;        // Paused while TTS is speaking
    this.wakeWordMode = true;     // When true, require wake word before commands
    this.wakeWordActive = false;  // Wake word was just detected
    this.wakeWordTimer = null;

    // Callbacks
    this._onCommand = null;       // (transcript, intent) => void
    this._onTranscript = null;    // (text, isFinal) => void
    this._onStatusChange = null;  // (status) => void
    this._onError = null;         // (error) => void

    // Debounce
    this._lastTranscript = '';
    this._lastTranscriptTime = 0;

    // Command registry reference
    this._registry = null;

    this._checkSupport();
  }

  // ─── public API ─────────────────────────────────────────────────────────

  /**
   * Initialize with a command registry and callbacks.
   */
  init({ registry, onCommand, onTranscript, onStatusChange, onError }) {
    this._registry = registry;
    this._onCommand = onCommand;
    this._onTranscript = onTranscript;
    this._onStatusChange = onStatusChange;
    this._onError = onError;
  }

  /**
   * Start continuous listening.
   */
  start() {
    if (!this.isSupported) {
      this._onError?.('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }
    if (this.isListening) return true;

    this._createRecognition();
    try {
      this.recognition.start();
      this.isListening = true;
      this._emitStatus('listening');
      return true;
    } catch (err) {
      console.error('Voice engine start error:', err);
      this._onError?.('Failed to start voice recognition.');
      return false;
    }
  }

  /**
   * Stop listening.
   */
  stop() {
    this.isListening = false;
    this._emitStatus('idle');
    if (this.recognition) {
      try { this.recognition.stop(); } catch (_) {}
    }
    this._clearWakeWordTimer();
  }

  /**
   * Pause recognition temporarily (e.g. while TTS is speaking).
   */
  pause() {
    if (!this.isListening) return;
    this.isPaused = true;
    try { this.recognition?.stop(); } catch (_) {}
  }

  /**
   * Resume recognition after pause.
   */
  resume() {
    if (!this.isListening || !this.isPaused) return;
    this.isPaused = false;
    try { this.recognition?.start(); } catch (_) {}
  }

  /**
   * Toggle wake word mode on/off.
   */
  setWakeWordMode(enabled) {
    this.wakeWordMode = enabled;
    if (!enabled) {
      this.wakeWordActive = false;
      this._clearWakeWordTimer();
    }
  }

  /**
   * Destroy and cleanup.
   */
  destroy() {
    this.stop();
    this.recognition = null;
  }

  // ─── private ────────────────────────────────────────────────────────────

  _checkSupport() {
    this.isSupported = !!(
      window.SpeechRecognition ||
      window.webkitSpeechRecognition
    );
  }

  _createRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (!this.isPaused) {
        this._emitStatus(this.wakeWordMode && !this.wakeWordActive ? 'waiting-wake-word' : 'listening');
      }
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();

        if (result.isFinal) {
          this._handleFinalTranscript(transcript);
        } else {
          // Interim result — show live text
          this._onTranscript?.(transcript, false);
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this._onError?.('Microphone access denied. Please allow microphone permission in your browser settings.');
        this._emitStatus('error');
        this.isListening = false;
        return;
      }
    };

    recognition.onend = () => {
      // Auto-restart if we should still be listening
      if (this.isListening && !this.isPaused) {
        try { recognition.start(); } catch (_) {}
      }
    };

    this.recognition = recognition;
  }

  _handleFinalTranscript(transcript) {
    const normalized = this._normalize(transcript);
    if (!normalized) return;

    // Debounce — ignore if same transcript within debounce window
    const now = Date.now();
    if (normalized === this._lastTranscript && now - this._lastTranscriptTime < DEBOUNCE_MS) {
      return;
    }
    this._lastTranscript = normalized;
    this._lastTranscriptTime = now;

    // Emit raw transcript
    this._onTranscript?.(transcript, true);

    // Check wake word
    if (this.wakeWordMode && !this.wakeWordActive) {
      if (this._containsWakeWord(normalized)) {
        this._activateWakeWord();
        // Strip wake word and process remainder as command
        const remainder = this._stripWakeWord(normalized);
        if (remainder) {
          this._processCommand(remainder);
        }
        return;
      }
      // Wake word not detected and required — ignore
      return;
    }

    // Process as command
    this._processCommand(normalized);
  }

  _processCommand(text) {
    if (!this._registry) return;

    this._emitStatus('processing');

    const match = this._registry.findMatch(text);
    if (match) {
      this._onCommand?.(text, match);
    } else {
      // No match — emit error response
      this._onCommand?.(text, {
        intent: 'unknown',
        response: `I didn't understand "${text}". Say "help" to hear available commands.`,
        handler: null,
      });
    }

    // Reset status after processing
    setTimeout(() => {
      if (this.isListening) {
        this._emitStatus(this.wakeWordMode && !this.wakeWordActive ? 'waiting-wake-word' : 'listening');
      }
    }, 500);
  }

  _containsWakeWord(text) {
    return WAKE_WORDS.some(ww => text.includes(ww));
  }

  _stripWakeWord(text) {
    let result = text;
    for (const ww of WAKE_WORDS) {
      result = result.replace(ww, '').trim();
    }
    return result;
  }

  _activateWakeWord() {
    this.wakeWordActive = true;
    this._emitStatus('listening');
    this._clearWakeWordTimer();

    // The wake word remains active until explicitly put to sleep
    // Users can say "stop listening" or "go to sleep" to deactivate it.
  }

  _clearWakeWordTimer() {
    if (this.wakeWordTimer) {
      clearTimeout(this.wakeWordTimer);
      this.wakeWordTimer = null;
    }
  }

  /**
   * Normalize transcript: lowercase, remove filler words, trim.
   */
  _normalize(text) {
    let t = text.toLowerCase().trim();
    for (const filler of FILLER_WORDS) {
      t = t.replace(new RegExp(`\\b${filler}\\b`, 'gi'), '');
    }
    return t.replace(/\s+/g, ' ').trim();
  }

  _emitStatus(status) {
    this._onStatusChange?.(status);
  }
}

/**
 * Play a short audio chime for events.
 */
export async function playChime(type = 'activate') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const tones = {
      activate: [600, 800],
      deactivate: [800, 600],
      success: [500, 700],
      error: [400, 300],
    };

    const [f1, f2] = tones[type] || tones.activate;
    osc.frequency.setValueAtTime(f1, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(f2, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (_) {}
}

export default VoiceCommandEngine;
