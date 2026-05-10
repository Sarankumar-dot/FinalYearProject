/**
 * VoiceControlSettings.jsx
 *
 * Settings section for voice control within the AccessibilityPanel.
 * Provides toggles for mic, wake word, voice speed, and a command reference.
 */

import React, { useState } from 'react';
import { useVoiceControl } from '../context/VoiceControlContext';
import { useAccessibility } from '../context/AccessibilityContext';

export default function VoiceControlSettings() {
  const vc = useVoiceControl();
  const { prefs, update, speak, stopSpeech } = useAccessibility();
  const [showCommands, setShowCommands] = useState(false);

  // If voice control context is not available, don't render
  if (!vc.toggleVoiceControl) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

      {/* Enable/Disable Voice Control */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={vc.isEnabled}
          onChange={(e) => vc.toggleVoiceControl(e.target.checked)}
          style={{ width: 'auto', accentColor: 'var(--color-accent)' }}
          aria-label="Enable full voice control"
        />
        <span style={{ fontSize: '0.875rem' }}>
          🎤 Enable Full Voice Control
        </span>
      </label>

      {vc.isEnabled && (
        <>
          {/* Microphone ON/OFF */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={vc.isListening}
              onChange={() => vc.toggleListening()}
              style={{ width: 'auto', accentColor: 'var(--color-accent)' }}
              aria-label="Microphone on/off"
            />
            <span style={{ fontSize: '0.875rem' }}>
              🔊 Microphone {vc.isListening ? 'ON' : 'OFF'}
            </span>
          </label>

          {/* Wake Word Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={vc.wakeWordEnabled}
              onChange={(e) => vc.setWakeWordEnabled(e.target.checked)}
              style={{ width: 'auto', accentColor: 'var(--color-accent)' }}
              aria-label="Enable wake word activation"
            />
            <span style={{ fontSize: '0.875rem' }}>
              💬 Wake Word ("Hey Companion")
            </span>
          </label>

          {/* Voice Speed */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              Voice Speed
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>0.5×</span>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={prefs.ttsSpeed}
                onChange={(e) => update('ttsSpeed', parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--color-accent)' }}
                aria-label={`Voice speed: ${prefs.ttsSpeed}`}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>2.0×</span>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: 600, marginTop: '0.25rem' }}>
              {prefs.ttsSpeed.toFixed(1)}×
            </p>
          </div>

          {/* Repeat Last Response */}
          <button
            onClick={() => {
              if (vc.lastResponse) {
                speak(vc.lastResponse);
              } else {
                speak('Nothing to repeat.');
              }
            }}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
            aria-label="Repeat last voice response"
          >
            🔁 Repeat Last Response
          </button>

          {/* Command Reference */}
          <button
            onClick={() => setShowCommands(!showCommands)}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
            aria-expanded={showCommands}
            aria-label="Show voice command reference"
          >
            📖 {showCommands ? 'Hide' : 'Show'} Command Reference
          </button>

          {showCommands && (
            <div style={{
              padding: '0.75rem',
              background: 'rgba(108,99,255,0.05)',
              borderRadius: 8,
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>🗣️ Navigation:</p>
              <ul style={{ margin: 0, paddingLeft: '1rem', lineHeight: 1.6 }}>
                <li>"Open Dashboard"</li>
                <li>"Go to Courses"</li>
                <li>"Open Settings"</li>
                <li>"Go Back"</li>
                <li>"Logout"</li>
              </ul>

              <p style={{ fontWeight: 600, margin: '0.5rem 0 0.3rem' }}>📖 Reading:</p>
              <ul style={{ margin: 0, paddingLeft: '1rem', lineHeight: 1.6 }}>
                <li>"Read Lesson"</li>
                <li>"Pause Reading"</li>
                <li>"Resume"</li>
                <li>"Repeat"</li>
                <li>"Increase Speed" / "Slow Down"</li>
              </ul>

              <p style={{ fontWeight: 600, margin: '0.5rem 0 0.3rem' }}>🎬 Video:</p>
              <ul style={{ margin: 0, paddingLeft: '1rem', lineHeight: 1.6 }}>
                <li>"Play / Pause / Stop Video"</li>
                <li>"Mute" / "Increase Volume"</li>
                <li>"Forward" / "Rewind"</li>
                <li>"Replay Video"</li>
              </ul>

              <p style={{ fontWeight: 600, margin: '0.5rem 0 0.3rem' }}>📝 Quiz:</p>
              <ul style={{ margin: 0, paddingLeft: '1rem', lineHeight: 1.6 }}>
                <li>"Read Question"</li>
                <li>"Option A/B/C/D"</li>
                <li>"True" / "False"</li>
                <li>"Next / Previous Question"</li>
                <li>"Submit Quiz"</li>
              </ul>

              <p style={{ fontWeight: 600, margin: '0.5rem 0 0.3rem' }}>💡 Other:</p>
              <ul style={{ margin: 0, paddingLeft: '1rem', lineHeight: 1.6 }}>
                <li>"Where am I?"</li>
                <li>"What courses are available?"</li>
                <li>"Dark Mode" / "Light Mode"</li>
                <li>"Help"</li>
              </ul>
            </div>
          )}

          {/* Status info */}
          <div style={{
            padding: '0.5rem 0.75rem',
            background: 'rgba(34,197,94,0.08)',
            borderRadius: 6,
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
          }}>
            <strong>Status:</strong> {vc.status === 'listening' ? '🟢 Active' : vc.status === 'waiting-wake-word' ? '🟡 Waiting for wake word' : vc.status === 'error' ? '🔴 Error' : '⚪ Idle'}
            <br />
            <strong>Shortcut:</strong> <kbd>Alt</kbd>+<kbd>V</kbd> to toggle mic
          </div>
        </>
      )}
    </div>
  );
}
