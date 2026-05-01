import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { FaVolumeUp, FaFont, FaPalette, FaKeyboard, FaClosedCaptioning } from 'react-icons/fa';

const themes = [
  { value: 'dark', label: '🌑 Dark' },
  { value: 'light', label: '☀️ Light' },
  { value: 'high-contrast', label: '⚡ High Contrast' },
];
const fontSizes = [
  { value: 'small', label: 'A', fontSize: '0.75rem' },
  { value: 'medium', label: 'A', fontSize: '1rem' },
  { value: 'large', label: 'A', fontSize: '1.25rem' },
  { value: 'xlarge', label: 'A', fontSize: '1.6rem' },
];

export default function AccessibilitySettings() {
  const { prefs, update, speak } = useAccessibility();
  const [voices, setVoices] = React.useState([]);

  React.useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 540 }}>
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        ♿ Accessibility Settings
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Personalize your learning experience. Settings save automatically.
      </p>

      {/* Theme */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaPalette style={{ color: 'var(--color-accent)' }} /> Theme
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {themes.map(t => (
            <button key={t.value} onClick={() => update('theme', t.value)}
              className={`btn ${prefs.theme === t.value ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.875rem' }}
              aria-pressed={prefs.theme === t.value}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaFont style={{ color: 'var(--color-accent)' }} /> Font Size
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {fontSizes.map(f => (
            <button key={f.value} onClick={() => update('fontSize', f.value)}
              style={{
                flex: 1, padding: '0.625rem',
                borderRadius: 8, border: `2px solid ${prefs.fontSize === f.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: prefs.fontSize === f.value ? 'rgba(108,99,255,0.1)' : 'var(--color-surface2)',
                color: 'var(--color-text)', cursor: 'pointer', font: 'inherit',
                fontSize: f.fontSize,
              }}
              aria-pressed={prefs.fontSize === f.value}
              aria-label={`Font size: ${f.value}`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* TTS speed */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaVolumeUp style={{ color: 'var(--color-accent)' }} /> Text-to-Speech Speed — <strong style={{ color: 'var(--color-accent)' }}>{prefs.ttsSpeed.toFixed(1)}×</strong>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Slow</span>
          <input type="range" min="0.5" max="2.0" step="0.1"
            value={prefs.ttsSpeed}
            onChange={e => update('ttsSpeed', parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--color-accent)' }}
            aria-label={`Speech speed: ${prefs.ttsSpeed}`}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Fast</span>
        </div>
        <button onClick={() => speak('Hello! This is how your text to speech sounds at the current speed.')}
          className="btn btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>
          🔊 Test Voice
        </button>

        <div style={{ marginTop: '1.25rem' }}>
          <label htmlFor="tts-voice" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Select Voice
          </label>
          <select 
            id="tts-voice" 
            value={prefs.ttsVoiceURI || ''} 
            onChange={e => update('ttsVoiceURI', e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: 8, background: 'var(--color-surface2)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            aria-label="Text to speech voice"
          >
            <option value="">Default System Voice</option>
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Captions */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaClosedCaptioning style={{ color: 'var(--color-accent)' }} /> Caption Style
        </h2>
        <div className="form-group">
          <label htmlFor="cap-size">Caption Size</label>
          <select id="cap-size" value={prefs.captionSize} onChange={e => update('captionSize', e.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="cap-colour">Caption Text Colour</label>
          <input id="cap-colour" type="color" value={prefs.captionColour} onChange={e => update('captionColour', e.target.value)} style={{ height: 40, padding: '0.25rem' }} />
        </div>
      </div>

      {/* Other */}
      <div className="card">
        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaKeyboard style={{ color: 'var(--color-accent)' }} /> Other Options
        </h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={prefs.autoPlayTTS}
            onChange={e => update('autoPlayTTS', e.target.checked)}
            style={{ width: 'auto', accentColor: 'var(--color-accent)' }}
            aria-label="Auto-play text to speech when opening a lesson"
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Auto-play TTS on lesson open</div>
            <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>Automatically reads lesson content aloud when you open it</div>
          </div>
        </label>
      </div>
    </div>
  );
}
