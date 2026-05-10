/**
 * VoiceControlWidget.jsx
 *
 * Floating mic widget for voice control. Shows in the bottom-right corner.
 * Displays listening status, live transcript, and assistant responses.
 *
 * Only rendered for visually-impaired students (guarded by VoiceControlContext).
 */

import React, { useState } from 'react';
import { useVoiceControl } from '../context/VoiceControlContext';
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
} from 'react-icons/fa';

const STATUS_LABELS = {
  'idle': 'Mic Off',
  'listening': '🎤 Listening…',
  'waiting-wake-word': '💤 Say "Hey Companion"…',
  'processing': '⚙️ Processing…',
  'error': '❌ Mic Error',
};

const STATUS_COLORS = {
  'idle': '#6b7280',
  'listening': '#22c55e',
  'waiting-wake-word': '#f59e0b',
  'processing': '#818cf8',
  'error': '#ef4444',
};

export default function VoiceControlWidget() {
  const vc = useVoiceControl();
  const [minimized, setMinimized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Don't render if voice control is not available
  if (!vc.isEnabled && vc.status === 'idle' && !vc.toggleVoiceControl) {
    return null;
  }

  const statusLabel = STATUS_LABELS[vc.status] || 'Voice Control';
  const statusColor = STATUS_COLORS[vc.status] || '#6b7280';
  const isActive = vc.status === 'listening' || vc.status === 'waiting-wake-word';

  if (minimized) {
    return (
      <div className="voice-widget voice-widget--minimized" role="region" aria-label="Voice control">
        <button
          className={`voice-mic-btn ${isActive ? 'voice-mic-btn--active' : ''} ${vc.status === 'error' ? 'voice-mic-btn--error' : ''}`}
          onClick={() => setMinimized(false)}
          aria-label="Expand voice control widget"
          title="Voice Control"
        >
          {isActive ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
      </div>
    );
  }

  return (
    <div className="voice-widget" role="region" aria-label="Voice control assistant" aria-live="polite">
      {/* Header */}
      <div className="voice-widget__header">
        <div className="voice-widget__title">
          <div className="voice-widget__status-dot" style={{ background: statusColor }} />
          <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>Voice Control</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            className="voice-widget__icon-btn"
            onClick={() => setShowHelp(!showHelp)}
            aria-label={showHelp ? 'Hide help' : 'Show voice command help'}
            title="Help"
          >
            <FaQuestionCircle />
          </button>
          <button
            className="voice-widget__icon-btn"
            onClick={() => setMinimized(true)}
            aria-label="Minimize voice control"
            title="Minimize"
          >
            <FaChevronDown />
          </button>
        </div>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div className="voice-widget__help">
          <p style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.75rem' }}>🗣️ Try saying:</p>
          <ul>
            <li>"Open Dashboard"</li>
            <li>"Go to Courses"</li>
            <li>"Read Lesson"</li>
            <li>"Play Video"</li>
            <li>"Option A" (in quiz)</li>
            <li>"Where am I?"</li>
            <li>"Help" for full list</li>
          </ul>
        </div>
      )}

      {/* Status */}
      <div className="voice-widget__status" style={{ color: statusColor }}>
        {statusLabel}
      </div>

      {/* Transcript */}
      {vc.lastTranscript && (
        <div className="voice-transcript">
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>You said:</span>
          <p>"{vc.lastTranscript}"</p>
        </div>
      )}

      {/* Response */}
      {vc.lastResponse && (
        <div className="voice-response">
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Assistant:</span>
          <p>{vc.lastResponse}</p>
        </div>
      )}

      {/* Controls */}
      <div className="voice-widget__controls">
        <button
          className={`voice-mic-btn ${isActive ? 'voice-mic-btn--active' : ''} ${vc.status === 'error' ? 'voice-mic-btn--error' : ''}`}
          onClick={vc.toggleListening}
          aria-label={isActive ? 'Stop listening' : 'Start listening'}
          aria-pressed={isActive}
          title={isActive ? 'Stop' : 'Start'}
        >
          {isActive ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>

        <div className="voice-widget__shortcuts">
          <kbd>Alt</kbd>+<kbd>V</kbd> toggle
        </div>
      </div>
    </div>
  );
}
