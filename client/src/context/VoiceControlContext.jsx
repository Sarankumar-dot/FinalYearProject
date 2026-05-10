/**
 * VoiceControlContext.jsx
 *
 * React context that manages the full voice control system.
 * Connects VoiceCommandEngine + VoiceCommandRegistry to the React tree,
 * allowing pages to register their state for voice interaction.
 *
 * Only activates for visually-impaired students.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useAccessibility } from './AccessibilityContext';
import { VoiceCommandEngine, playChime } from '../utils/voiceCommandEngine';
import { VoiceCommandRegistry } from '../utils/voiceCommandRegistry';

const VoiceControlContext = createContext(null);

// Page name mapping from URL
const PAGE_NAME_MAP = {
  '/student': 'Dashboard',
  '/student/courses': 'Courses',
  '/student/documents': 'Documents',
  '/student/progress': 'My Progress',
  '/student/settings': 'Settings',
};

export function VoiceControlProvider({ children }) {
  const { user, logout } = useAuth();
  const { prefs, update, speak, stopSpeech } = useAccessibility();
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [isEnabled, setIsEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | listening | processing | waiting-wake-word | error
  const [lastTranscript, setLastTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(prefs.wakeWordEnabled !== false);

  // Refs
  const engineRef = useRef(null);
  const registryRef = useRef(null);
  const pageContextRef = useRef({});
  const lastTTSTextRef = useRef('');
  const transcriptTimerRef = useRef(null);
  const responseTimerRef = useRef(null);

  // Only for visually-impaired students
  const isVI = user?.accessibilityType === 'visually-impaired';

  // Track current page name
  const pageName = PAGE_NAME_MAP[location.pathname] || pageContextRef.current?.pageName || 'Page';

  // ─── Speak wrapper that tracks last text ───────────────────────────────
  const speakWithTracking = useCallback((text, options = {}) => {
    if (!text) return;
    lastTTSTextRef.current = text;

    // Pause recognition while speaking to prevent echo
    engineRef.current?.pause();

    speak(text, options);

    // Resume after estimated speech duration
    const wordCount = text.split(' ').length;
    const estimatedDuration = (wordCount / 2.5) * 1000 / (prefs.ttsSpeed || 1);
    setTimeout(() => {
      engineRef.current?.resume();
    }, Math.max(1000, estimatedDuration));
  }, [speak, prefs.ttsSpeed]);

  // ─── Handle recognized commands ────────────────────────────────────────
  const handleCommand = useCallback(async (transcript, match) => {
    // Build context for command handler
    const ctx = {
      navigate,
      speak: speakWithTracking,
      stopSpeech,
      prefs,
      update,
      user,
      logout,
      pageContext: pageContextRef.current,
      lastTTSText: lastTTSTextRef.current,
      disableVoiceControl: () => setIsEnabled(false),
      engine: engineRef.current,
    };

    if (match.intent === 'unknown') {
      // No matching command
      setLastResponse(match.response);
      speakWithTracking(match.response);
      return;
    }

    try {
      const response = await match.handler(ctx, match.params);
      if (response) {
        setLastResponse(response);
        speakWithTracking(response);
      }

      // Clear response after 8 seconds
      if (responseTimerRef.current) clearTimeout(responseTimerRef.current);
      responseTimerRef.current = setTimeout(() => setLastResponse(''), 8000);
    } catch (err) {
      console.error('Voice command handler error:', err);
      const errMsg = 'Sorry, something went wrong. Please try again.';
      setLastResponse(errMsg);
      speakWithTracking(errMsg);
    }
  }, [navigate, speakWithTracking, stopSpeech, prefs, update, user, logout]);

  // ─── Initialize engine ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isVI || !isEnabled) return;

    const registry = new VoiceCommandRegistry();
    registryRef.current = registry;

    const engine = new VoiceCommandEngine();
    engineRef.current = engine;

    engine.init({
      registry,
      onCommand: handleCommand,
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setLastTranscript(text);
          // Clear transcript after 5 seconds
          if (transcriptTimerRef.current) clearTimeout(transcriptTimerRef.current);
          transcriptTimerRef.current = setTimeout(() => setLastTranscript(''), 5000);
        }
      },
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        setIsListening(newStatus === 'listening' || newStatus === 'waiting-wake-word');
      },
      onError: (errorMsg) => {
        console.warn('Voice engine error:', errorMsg);
        setStatus('error');
      },
    });

    engine.setWakeWordMode(wakeWordEnabled);

    // Start listening
    const started = engine.start();
    if (started) {
      // Welcome announcement after a short delay
      setTimeout(() => {
        speakWithTracking(
          `Voice control is active. ${wakeWordEnabled ? 'Say "Hey Companion" followed by a command, or ' : ''}say "help" to hear available commands.`
        );
      }, 1500);
    }

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [isVI, isEnabled]); // Only re-init when enable state changes

  // ─── Update wake word mode when pref changes ──────────────────────────
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setWakeWordMode(wakeWordEnabled);
    }
  }, [wakeWordEnabled]);

  // ─── Announce page changes ─────────────────────────────────────────────
  useEffect(() => {
    if (!isVI || !isEnabled || !isListening) return;

    const name = PAGE_NAME_MAP[location.pathname];
    if (name) {
      setTimeout(() => {
        speakWithTracking(`Navigated to ${name}.`);
      }, 500);
    }
  }, [location.pathname]);

  // ─── Page context registration ─────────────────────────────────────────
  const registerPageContext = useCallback((ctx) => {
    pageContextRef.current = { ...pageContextRef.current, ...ctx };
  }, []);

  const unregisterPageContext = useCallback((keys) => {
    if (Array.isArray(keys)) {
      for (const key of keys) {
        delete pageContextRef.current[key];
      }
    } else {
      pageContextRef.current = {};
    }
  }, []);

  // ─── Toggle controls ──────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    if (!engineRef.current) return;

    if (isListening) {
      engineRef.current.stop();
      playChime('deactivate');
      setIsListening(false);
      setStatus('idle');
    } else {
      engineRef.current.start();
      playChime('activate');
    }
  }, [isListening]);

  const toggleVoiceControl = useCallback((enabled) => {
    setIsEnabled(enabled);
    if (!enabled && engineRef.current) {
      engineRef.current.stop();
      setIsListening(false);
      setStatus('idle');
    }
  }, []);

  // ─── Keyboard shortcut Alt+V ──────────────────────────────────────────
  useEffect(() => {
    if (!isVI) return;

    const handleKeyDown = (e) => {
      if (e.altKey && e.key === 'v') {
        e.preventDefault();
        if (!isEnabled) {
          setIsEnabled(true);
        } else {
          toggleListening();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVI, isEnabled, toggleListening]);

  // ─── Provide context ──────────────────────────────────────────────────
  if (!isVI) {
    return <>{children}</>;
  }

  return (
    <VoiceControlContext.Provider
      value={{
        // State
        isEnabled,
        isListening,
        status,
        lastTranscript,
        lastResponse,
        wakeWordEnabled,
        pageName,

        // Actions
        toggleListening,
        toggleVoiceControl,
        setWakeWordEnabled,
        registerPageContext,
        unregisterPageContext,

        // Engine ref for advanced use
        engineRef,
        registryRef,
      }}
    >
      {children}
    </VoiceControlContext.Provider>
  );
}

export const useVoiceControl = () => {
  const ctx = useContext(VoiceControlContext);
  // Return a no-op context if not within provider (non-VI users)
  if (!ctx) {
    return {
      isEnabled: false,
      isListening: false,
      status: 'idle',
      registerPageContext: () => {},
      unregisterPageContext: () => {},
    };
  }
  return ctx;
};

export default VoiceControlContext;
