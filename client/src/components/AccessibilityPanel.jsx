import React, { useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  FaTimes,
  FaVolumeUp,
  FaFont,
  FaPalette,
  FaKeyboard,
  FaClosedCaptioning,
  FaEye,
} from "react-icons/fa";

const themes = [
  { value: "dark", label: "🌑 Dark", desc: "Dark background" },
  { value: "light", label: "☀️ Light", desc: "Light background" },
  {
    value: "high-contrast",
    label: "⚡ High Contrast",
    desc: "Maximum visibility",
  },
];
const fontSizes = [
  { value: "small", label: "A", style: { fontSize: "0.75rem" } },
  { value: "medium", label: "A", style: { fontSize: "1rem" } },
  { value: "large", label: "A", style: { fontSize: "1.25rem" } },
  { value: "xlarge", label: "A", style: { fontSize: "1.6rem" } },
];

export default function AccessibilityPanel({ onClose }) {
  const { prefs, update, announce } = useAccessibility();
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
    announce(
      `${section} ${expandedSection === section ? "collapsed" : "expanded"}`,
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: "2rem",
        background: "rgba(0,0,0,0.4)",
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Accessibility Settings"
    >
      <div
        className="card animate-slide-in"
        style={{
          width: 380,
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            ♿ Accessibility Settings
          </h2>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "0.4rem", fontSize: "1rem" }}
            aria-label="Close accessibility panel"
          >
            <FaTimes />
          </button>
        </div>

        {/* Visual Theme */}
        <section style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => toggleSection("theme")}
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              borderRadius: 8,
              border: "none",
              background: "var(--color-surface2)",
              color: "var(--color-text)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            aria-expanded={expandedSection === "theme"}
            aria-label="Theme settings"
          >
            <span>
              <FaPalette style={{ marginRight: 6 }} />
              Theme
            </span>
            <span>{expandedSection === "theme" ? "▼" : "▶"}</span>
          </button>

          {expandedSection === "theme" && (
            <div style={{ marginTop: "0.75rem" }}>
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => update("theme", t.value)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "0.625rem 0.875rem",
                    marginBottom: "0.4rem",
                    borderRadius: 8,
                    border: `2px solid ${prefs.theme === t.value ? "var(--color-accent)" : "var(--color-border)"}`,
                    background:
                      prefs.theme === t.value
                        ? "rgba(108,99,255,0.1)"
                        : "var(--color-surface2)",
                    color: "var(--color-text)",
                    cursor: "pointer",
                    font: "inherit",
                    fontSize: "0.875rem",
                  }}
                  aria-pressed={prefs.theme === t.value}
                >
                  <span>{t.label}</span>
                  {prefs.theme === t.value && (
                    <span
                      style={{
                        color: "var(--color-accent)",
                        fontSize: "0.75rem",
                      }}
                    >
                      ✓ Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Font Size */}
        <section style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => toggleSection("fontSize")}
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              borderRadius: 8,
              border: "none",
              background: "var(--color-surface2)",
              color: "var(--color-text)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            aria-expanded={expandedSection === "fontSize"}
            aria-label="Font size settings"
          >
            <span>
              <FaFont style={{ marginRight: 6 }} />
              Font Size
            </span>
            <span>{expandedSection === "fontSize" ? "▼" : "▶"}</span>
          </button>

          {expandedSection === "fontSize" && (
            <div
              style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}
            >
              {fontSizes.map((f) => (
                <button
                  key={f.value}
                  onClick={() => update("fontSize", f.value)}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: 8,
                    border: `2px solid ${prefs.fontSize === f.value ? "var(--color-accent)" : "var(--color-border)"}`,
                    background:
                      prefs.fontSize === f.value
                        ? "rgba(108,99,255,0.1)"
                        : "var(--color-surface2)",
                    color: "var(--color-text)",
                    cursor: "pointer",
                    font: "inherit",
                    ...f.style,
                  }}
                  aria-pressed={prefs.fontSize === f.value}
                  aria-label={`Font size: ${f.value}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* TTS Speed */}
        <section style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => toggleSection("tts")}
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              borderRadius: 8,
              border: "none",
              background: "var(--color-surface2)",
              color: "var(--color-text)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            aria-expanded={expandedSection === "tts"}
            aria-label="Text to speech settings"
          >
            <span>
              <FaVolumeUp style={{ marginRight: 6 }} />
              Text-to-Speech
            </span>
            <span>{expandedSection === "tts" ? "▼" : "▶"}</span>
          </button>

          {expandedSection === "tts" && (
            <div style={{ marginTop: "0.75rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                Speech Speed
              </label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  0.5×
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={prefs.ttsSpeed}
                  onChange={(e) =>
                    update("ttsSpeed", parseFloat(e.target.value))
                  }
                  style={{ flex: 1, accentColor: "var(--color-accent)" }}
                  aria-label={`Text to speech speed: ${prefs.ttsSpeed}`}
                />
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  2.0×
                </span>
              </div>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.875rem",
                  color: "var(--color-accent)",
                  marginTop: "0.4rem",
                  fontWeight: 600,
                }}
              >
                {prefs.ttsSpeed.toFixed(1)}×
              </p>
            </div>
          )}
        </section>

        {/* Caption Settings */}
        <section style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => toggleSection("captions")}
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              borderRadius: 8,
              border: "none",
              background: "var(--color-surface2)",
              color: "var(--color-text)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            aria-expanded={expandedSection === "captions"}
            aria-label="Caption settings"
          >
            <span>
              <FaClosedCaptioning style={{ marginRight: 6 }} />
              Captions & Transcripts
            </span>
            <span>{expandedSection === "captions" ? "▼" : "▶"}</span>
          </button>

          {expandedSection === "captions" && (
            <div style={{ marginTop: "0.75rem" }}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label
                  htmlFor="caption-size"
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                  }}
                >
                  Caption Size
                </label>
                <select
                  id="caption-size"
                  value={prefs.captionSize}
                  onChange={(e) => update("captionSize", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface2)",
                    color: "var(--color-text)",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                  aria-label="Caption size"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="caption-colour"
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                  }}
                >
                  Caption Text Colour
                </label>
                <input
                  id="caption-colour"
                  type="color"
                  value={prefs.captionColour}
                  onChange={(e) => update("captionColour", e.target.value)}
                  style={{
                    height: 40,
                    width: "100%",
                    padding: "0.25rem",
                    borderRadius: 6,
                  }}
                  aria-label="Caption text colour"
                />
              </div>
            </div>
          )}
        </section>

        {/* Screen Reader & Keyboard Navigation */}
        <section style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => toggleSection("navigation")}
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              borderRadius: 8,
              border: "none",
              background: "var(--color-surface2)",
              color: "var(--color-text)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            aria-expanded={expandedSection === "navigation"}
            aria-label="Navigation settings"
          >
            <span>
              <FaKeyboard style={{ marginRight: 6 }} />
              Navigation & Other
            </span>
            <span>{expandedSection === "navigation" ? "▼" : "▶"}</span>
          </button>

          {expandedSection === "navigation" && (
            <div
              style={{
                marginTop: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={prefs.keyboardNavMode}
                  onChange={(e) => update("keyboardNavMode", e.target.checked)}
                  style={{ width: "auto", accentColor: "var(--color-accent)" }}
                  aria-label="Enhanced keyboard navigation mode"
                />
                <span style={{ fontSize: "0.875rem" }}>
                  Enhanced Keyboard Navigation
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={prefs.screenReaderMode}
                  onChange={(e) => update("screenReaderMode", e.target.checked)}
                  style={{ width: "auto", accentColor: "var(--color-accent)" }}
                  aria-label="Screen reader mode"
                />
                <span style={{ fontSize: "0.875rem" }}>
                  🤖 Screen Reader Mode
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={prefs.autoPlayTTS}
                  onChange={(e) => update("autoPlayTTS", e.target.checked)}
                  style={{ width: "auto", accentColor: "var(--color-accent)" }}
                  aria-label="Auto-play text to speech on lesson open"
                />
                <span style={{ fontSize: "0.875rem" }}>
                  🔊 Auto-play TTS on Page Load
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={prefs.skipLinksEnabled}
                  onChange={(e) => update("skipLinksEnabled", e.target.checked)}
                  style={{ width: "auto", accentColor: "var(--color-accent)" }}
                  aria-label="Enable skip links"
                />
                <span style={{ fontSize: "0.875rem" }}>
                  ⏭️ Enable Skip Links
                </span>
              </label>

              <div style={{ marginTop: "0.5rem" }}>
                <label
                  htmlFor="focus-style"
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    marginBottom: "0.4rem",
                  }}
                >
                  Focus Indicator Style
                </label>
                <select
                  id="focus-style"
                  value={prefs.focusIndicator || "standard"}
                  onChange={(e) => update("focusIndicator", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: 6,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface2)",
                    color: "var(--color-text)",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                  aria-label="Focus indicator style"
                >
                  <option value="standard">Standard</option>
                  <option value="enhanced">Enhanced (Larger)</option>
                </select>
              </div>
            </div>
          )}
        </section>

        {/* Voice-Guided Navigation */}
        <section style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => toggleSection("voiceGuide")}
            style={{
              width: "100%",
              padding: "0.625rem 0.875rem",
              borderRadius: 8,
              border: "none",
              background: "var(--color-surface2)",
              color: "var(--color-text)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            aria-expanded={expandedSection === "voiceGuide"}
            aria-label="Voice-guided navigation settings"
          >
            <span>🎙️ Voice Guidance</span>
            <span>{expandedSection === "voiceGuide" ? "▼" : "▶"}</span>
          </button>

          {expandedSection === "voiceGuide" && (
            <div
              style={{
                marginTop: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={prefs.voiceGuidedNav}
                  onChange={(e) => update("voiceGuidedNav", e.target.checked)}
                  style={{ width: "auto", accentColor: "var(--color-accent)" }}
                  aria-label="Voice-guided navigation for mouse users"
                />
                <span style={{ fontSize: "0.875rem" }}>
                  🎙️ Voice Guide Every Action
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={prefs.mouseHoverGuidance}
                  onChange={(e) =>
                    update("mouseHoverGuidance", e.target.checked)
                  }
                  style={{ width: "auto", accentColor: "var(--color-accent)" }}
                  aria-label="Announce elements when mouse hovers over them"
                />
                <span style={{ fontSize: "0.875rem" }}>
                  🖱️ Voice on Mouse Hover
                </span>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={prefs.autoAnnounceElements}
                  onChange={(e) =>
                    update("autoAnnounceElements", e.target.checked)
                  }
                  style={{ width: "auto", accentColor: "var(--color-accent)" }}
                  aria-label="Auto-announce form fields and buttons"
                />
                <span style={{ fontSize: "0.875rem" }}>
                  📢 Auto-Announce Elements
                </span>
              </label>

              <div
                style={{
                  padding: "0.625rem",
                  background: "rgba(108,99,255,0.05)",
                  borderRadius: 6,
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  marginTop: "0.5rem",
                }}
              >
                <p style={{ margin: "0 0 0.4rem 0", fontWeight: 600 }}>
                  📖 How to Use:
                </p>
                <ul
                  style={{ margin: 0, paddingLeft: "1rem", lineHeight: "1.4" }}
                >
                  <li>
                    <strong>Mouse Hover:</strong> Move your mouse over
                    buttons/fields to hear them
                  </li>
                  <li>
                    <strong>Keyboard:</strong> Press Tab to navigate, hear
                    announcements automatically
                  </li>
                  <li>
                    <strong>Quick Announcements:</strong> Use keyboard shortcuts
                    anytime
                  </li>
                </ul>
                <p style={{ margin: "0.5rem 0 0.4rem 0", fontWeight: 600 }}>
                  ⌨️ Voice Navigation Shortcuts:
                </p>
                <ul
                  style={{ margin: 0, paddingLeft: "1rem", lineHeight: "1.4" }}
                >
                  <li>
                    <kbd>Alt</kbd> + <kbd>P</kbd>: Announce page overview
                  </li>
                  <li>
                    <kbd>Alt</kbd> + <kbd>M</kbd>: Announce menu options
                  </li>
                  <li>
                    <kbd>Alt</kbd> + <kbd>N</kbd>: Announce next actions
                  </li>
                  <li>
                    <kbd>Alt</kbd> + <kbd>V</kbd>: Start voice command mode
                  </li>
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Keyboard Shortcuts Info */}
        <div
          style={{
            padding: "0.875rem",
            borderRadius: 8,
            background: "rgba(108,99,255,0.08)",
            border: "1px solid rgba(108,99,255,0.2)",
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.4rem" }}>
            ⌨️ Keyboard Shortcuts:
          </p>
          <ul style={{ margin: 0, paddingLeft: "1rem" }}>
            <li>
              <kbd>Alt</kbd> + <kbd>A</kbd>: Open accessibility settings
            </li>
            <li>
              <kbd>Alt</kbd> + <kbd>S</kbd>: Skip to main content
            </li>
            <li>
              <kbd>Alt</kbd> + <kbd>P</kbd>: Page overview (voice)
            </li>
            <li>
              <kbd>Alt</kbd> + <kbd>M</kbd>: Menu options (voice)
            </li>
            <li>
              <kbd>Alt</kbd> + <kbd>V</kbd>: Voice commands
            </li>
            <li>
              <kbd>Tab</kbd>: Navigate between elements
            </li>
            <li>
              <kbd>Enter</kbd>: Activate button
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
