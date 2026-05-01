import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { VoiceGuidedNav } from "../utils/voiceGuidance";

const AccessibilityContext = createContext(null);

const DEFAULTS = {
  theme: "dark",
  fontSize: "medium",
  ttsSpeed: 1.0,
  captionSize: "medium",
  captionColour: "#FFFFFF",
  captionBg: "rgba(0,0,0,0.75)",
  keyboardNavMode: false,
  autoPlayTTS: false,
  screenReaderMode: false,
  skipLinksEnabled: true,
  focusIndicator: "standard",
  voiceGuidedNav: false,
  autoAnnounceElements: false,
  mouseHoverGuidance: false,
  ttsVoiceURI: "",
};

export function AccessibilityProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem("sas_a11y");
      let settings = saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;

      // Auto-enable voice features for visually impaired users
      if (user?.accessibilityType === "visually-impaired") {
        settings = {
          ...settings,
          voiceGuidedNav: true,
          autoAnnounceElements: true,
          mouseHoverGuidance: true,
          screenReaderMode: true,
        };
      }

      return settings;
    } catch {
      return DEFAULTS;
    }
  });
  const [announcement, setAnnouncement] = useState("");
  const [voiceNav, setVoiceNav] = useState(null);

  // Auto-enable voice features when user type changes to visually impaired
  useEffect(() => {
    if (user?.accessibilityType === "visually-impaired") {
      console.log("✓ Visually impaired user detected, enabling voice features");
      const updatedPrefs = {
        ...prefs,
        voiceGuidedNav: true,
        autoAnnounceElements: true,
        mouseHoverGuidance: true,
        screenReaderMode: true,
      };
      setPrefs(updatedPrefs);
      localStorage.setItem("sas_a11y", JSON.stringify(updatedPrefs));
    }
  }, [user?.accessibilityType]);

  // TTS helpers using Web Speech API - with useCallback for stability
  const speak = useCallback(
    (text, options = {}) => {
      // EXACT RULE: Hearing impaired gets NO TTS
      if (user?.accessibilityType === "hearing-impaired") {
        return;
      }

      if (!window.speechSynthesis) {
        console.warn("Web Speech API not available");
        return;
      }
      try {
        window.speechSynthesis.cancel();
        if (!text || typeof text !== 'string') return;
        
        // Chunk long text to prevent SpeechSynthesis limits on large PDFs
        const chunkSize = 200;
        const words = text.split(/\s+/);
        const chunks = [];
        let currentString = '';
        
        for (const word of words) {
          if ((currentString.length + word.length) < chunkSize) {
            currentString += (currentString.length > 0 ? ' ' : '') + word;
          } else {
            if (currentString.length > 0) chunks.push(currentString);
            currentString = word;
          }
        }
        if (currentString.length > 0) chunks.push(currentString);

        const availableVoices = window.speechSynthesis.getVoices();
        const preferredVoice = prefs.ttsVoiceURI ? availableVoices.find(v => v.voiceURI === prefs.ttsVoiceURI) : null;

        chunks.forEach(chunk => {
          if (!chunk.trim()) return;
          const utterance = new SpeechSynthesisUtterance(chunk);
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          utterance.rate = options.speed || prefs.ttsSpeed || 1.0;
          utterance.pitch = options.pitch || 1;
          utterance.volume = options.volume || 1;
          utterance.onerror = (e) => console.warn("Speech error:", e.error);
          window.speechSynthesis.speak(utterance);
        });
      } catch (error) {
        console.error("Error speaking:", error);
      }
    },
    [prefs.ttsSpeed, prefs.ttsVoiceURI, user?.accessibilityType],
  );

  const stopSpeech = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  // Setup hover audio announcements
  const setupAutoGuidance = useCallback(() => {
    if (!prefs.mouseHoverGuidance) return () => {};

    let lastHoveredElement = null;

    const handleMouseover = (e) => {
      // STRICT RULE: TTS hover only for visually impaired users. Evaluated at runtime reliably.
      if (user?.accessibilityType !== "visually-impaired") {
        return;
      }

      // Only announce interactive elements
      const interactiveSelectors =
        'button, a, input, select, textarea, [role="button"], [role="tab"], [role="link"], label';
      const target = e.target.matches(interactiveSelectors)
        ? e.target
        : e.target.closest(interactiveSelectors);

      if (target && target !== lastHoveredElement) {
        lastHoveredElement = target;

        // Get element label
        const label =
          target.getAttribute("aria-label") ||
          target.getAttribute("title") ||
          target.textContent?.trim() ||
          target.placeholder ||
          target.tagName.toLowerCase();

        if (label && speak) {
          console.log("🖱️ Announcing hover:", label);
          speak(label, {
            speed: prefs.ttsSpeed,
          });
        }
      }
    };

    const handleMouseout = () => {
      lastHoveredElement = null;
    };

    // Attach listeners
    document.addEventListener("mouseover", handleMouseover);
    document.addEventListener("mouseout", handleMouseout);

    // Cleanup function
    return () => {
      document.removeEventListener("mouseover", handleMouseover);
      document.removeEventListener("mouseout", handleMouseout);
    };
  }, [
    prefs.mouseHoverGuidance,
    prefs.ttsSpeed,
    user?.accessibilityType,
    speak,
  ]);

  // Initialize hover audio on mount
  useEffect(() => {
    console.log("🎙️ Setting up hover audio guidance...");
    const cleanup = setupAutoGuidance();
    return cleanup;
  }, [setupAutoGuidance]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-light", "theme-dark", "theme-high-contrast");
    root.classList.add(`theme-${prefs.theme}`);
    root.classList.remove(
      "font-small",
      "font-medium",
      "font-large",
      "font-xlarge",
    );
    root.classList.add(`font-${prefs.fontSize}`);

    // Apply focus indicator style
    if (prefs.focusIndicator === "enhanced") {
      root.style.setProperty("--focus-outline", "3px solid #ff6b6b");
    } else {
      root.style.setProperty("--focus-outline", "2px solid #818cf8");
    }
  }, [prefs.theme, prefs.fontSize, prefs.focusIndicator]);

  // Announce to screen readers
  const announce = useCallback((message, priority = "polite") => {
    setAnnouncement("");
    setTimeout(() => setAnnouncement(message), 100);
  }, []);

  const update = async (key, value) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    localStorage.setItem("sas_a11y", JSON.stringify(newPrefs));
    announce(`${key} changed to ${value}`, "assertive");
    // Persist to backend if logged in
    if (user) {
      try {
        await api.put(`/users/${user._id}`, { accessibilityPrefs: newPrefs });
        updateUser({ accessibilityPrefs: newPrefs });
      } catch (_) {}
    }
  };

  const updateAll = (newPrefs) => {
    const merged = { ...DEFAULTS, ...newPrefs };
    setPrefs(merged);
    localStorage.setItem("sas_a11y", JSON.stringify(merged));
    announce("Accessibility settings updated", "polite");
  };

  // Announce available actions on current page
  const speakPageGuide = useCallback(() => {
    if (voiceNav) {
      voiceNav.speakAvailableActions();
    }
  }, [voiceNav]);

  // Announce page structure on load
  const announcePage = useCallback(
    (pageTitle) => {
      if (voiceNav) {
        voiceNav.announcePageStructure();
      }
    },
    [voiceNav],
  );

  // Announce navigation menu
  const announceNav = useCallback(() => {
    if (voiceNav) {
      voiceNav.announceNavigationMenu();
    }
  }, [voiceNav]);

  // Keyboard navigation helper
  const focusNext = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const activeElement = document.activeElement;
    const currentIndex = Array.from(focusableElements).indexOf(activeElement);
    const nextElement = focusableElements[currentIndex + 1];
    if (nextElement) nextElement.focus();
  }, []);

  const focusPrevious = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const activeElement = document.activeElement;
    const currentIndex = Array.from(focusableElements).indexOf(activeElement);
    const prevElement = focusableElements[currentIndex - 1];
    if (prevElement) prevElement.focus();
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        prefs,
        update,
        updateAll,
        speak,
        stopSpeech,
        announce,
        focusNext,
        focusPrevious,
        announcement,
        speakPageGuide,
        announcePage,
        announceNav,
        voiceNav,
      }}
    >
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          left: "-10000px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        {announcement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
