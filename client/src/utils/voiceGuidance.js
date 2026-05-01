/**
 * Voice-Guided Navigation System for Visually Impaired Users
 * Provides audio feedback, spoken navigation, and voice commands
 */

export class VoiceGuidedNav {
  constructor(accessibilityContext) {
    this.a11y = accessibilityContext;
    this.currentPage = null;
    this.navigationCache = new Map();
    this.setupPageGuide();
  }

  /**
   * Set up voice guidance when page loads
   */
  setupPageGuide() {
    window.addEventListener("load", () => {
      this.announcePageStructure();
    });

    // Announce when user navigates to new section
    const observer = new MutationObserver(() => {
      this.updateNavigationCache();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Announce the entire page structure on load
   * Helps user understand what's available
   */
  announcePageStructure() {
    const pageTitle = document.title || "Page";
    const mainContent = document.querySelector("main");
    const mainHeading = document.querySelector("h1");
    const nav = document.querySelector("nav");
    const sections = document.querySelectorAll('section, [role="region"]');

    let announcement = `Welcome to ${pageTitle}. `;

    if (mainHeading) {
      announcement += `Heading: ${mainHeading.textContent}. `;
    }

    announcement += "Available sections: ";

    sections.forEach((section, idx) => {
      const title =
        section.querySelector("h2")?.textContent ||
        section.getAttribute("aria-label") ||
        `Section ${idx + 1}`;
      announcement += `${title}. `;
    });

    if (nav) {
      const navItems = nav.querySelectorAll("a, button");
      announcement += `Navigation menu has ${navItems.length} items. `;
    }

    this.a11y.speak(announcement, {
      speed: this.a11y.prefs.ttsSpeed,
      pitch: 1,
      volume: 1,
    });
  }

  /**
   * Speak all interactive elements in current section
   */
  speakAvailableActions() {
    const focusedElement = document.activeElement;
    const container =
      focusedElement.closest("main") ||
      focusedElement.closest("section") ||
      document.body;

    const actions = this.getInteractiveElements(container);

    let announcement = "Available actions on this page: ";

    actions.forEach((element) => {
      const label = this.getElementLabel(element);
      announcement += `${label}. `;
    });

    this.a11y.speak(announcement, { speed: this.a11y.prefs.ttsSpeed });
  }

  /**
   * Get all interactive elements with their labels
   */
  getInteractiveElements(container) {
    const elements = [];
    const selectors =
      'button, a, input, select, textarea, [role="button"], [role="tab"]';

    container.querySelectorAll(selectors).forEach((el) => {
      if (this.isVisible(el)) {
        elements.push(el);
      }
    });

    return elements;
  }

  /**
   * Get semantic label for any element
   */
  getElementLabel(element) {
    // Try aria-label first
    if (element.getAttribute("aria-label")) {
      return element.getAttribute("aria-label");
    }

    // Try title
    if (element.title) {
      return element.title;
    }

    // Try associated label (for form inputs)
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent.trim();
    }

    // Try text content
    if (element.textContent) {
      return element.textContent.trim().substring(0, 50);
    }

    // Fallback
    return `${element.tagName} button`;
  }

  /**
   * Check if element is visible
   */
  isVisible(element) {
    return element.offsetParent !== null && !element.hidden;
  }

  /**
   * Handle mouse hover over an element
   * Announces what element the mouse is hovering over
   */
  announceHoveredElement(element) {
    // Skip if element is not interactive
    const interactiveSelectors =
      'button, a, input, select, textarea, [role="button"], [role="tab"], [role="link"], label';
    if (
      !element.matches(interactiveSelectors) &&
      !element.closest(interactiveSelectors)
    ) {
      return;
    }

    // Get the closest interactive element
    const interactiveEl = element.matches(interactiveSelectors)
      ? element
      : element.closest(interactiveSelectors);
    if (!interactiveEl || !this.isVisible(interactiveEl)) {
      return;
    }

    const label = this.getElementLabel(interactiveEl);
    const tagName = interactiveEl.tagName.toLowerCase();
    let announcement = "";

    if (
      tagName === "button" ||
      interactiveEl.getAttribute("role") === "button"
    ) {
      announcement = `Button: ${label}`;
      if (interactiveEl.hasAttribute("aria-disabled")) {
        announcement += " (disabled)";
      }
    } else if (
      tagName === "a" ||
      interactiveEl.getAttribute("role") === "link"
    ) {
      announcement = `Link: ${label}`;
    } else if (
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select"
    ) {
      const type = interactiveEl.type || tagName;
      announcement = `${label}, ${type} input`;
      if (interactiveEl.hasAttribute("required")) {
        announcement += ", required";
      }
    } else if (tagName === "label") {
      announcement = `Label: ${label}`;
    } else {
      announcement = `${label}`;
    }

    this.a11y.speak(announcement, { speed: this.a11y.prefs.ttsSpeed });
  }

  /**
   * Announce when entering a form
   */
  announceForm(formElement) {
    const formName =
      formElement.getAttribute("aria-label") ||
      formElement.querySelector("h2")?.textContent ||
      "Form";

    const inputs = formElement.querySelectorAll("input, textarea, select");
    let announcement = `${formName}. Form with ${inputs.length} fields: `;

    inputs.forEach((input) => {
      const label = this.getElementLabel(input);
      const required = input.hasAttribute("required") ? ", required" : "";
      announcement += `${label}${required}. `;
    });

    this.a11y.speak(announcement, { speed: this.a11y.prefs.ttsSpeed });
  }

  /**
   * Speak instructions when focus enters an input field
   */
  announceInputField(inputElement) {
    const label = this.getElementLabel(inputElement);
    const type = inputElement.type || "text";
    const placeholder = inputElement.placeholder || "";
    const required = inputElement.hasAttribute("required")
      ? "Required field"
      : "Optional field";

    let announcement = `${label}, ${type} input. ${required}`;

    if (placeholder) {
      announcement += `. Example: ${placeholder}`;
    }

    // Add instructions for different input types
    if (type === "email") {
      announcement += ". Enter your email address.";
    } else if (type === "password") {
      announcement += ". Enter your password.";
    } else if (type === "number") {
      announcement += ". Enter a number.";
    } else if (inputElement.tagName === "SELECT") {
      const options = inputElement.querySelectorAll("option");
      announcement += `. ${options.length} options available. Use arrow keys to select.`;
    } else if (inputElement.tagName === "TEXTAREA") {
      announcement += ". You can enter multiple lines of text.";
    }

    this.a11y.speak(announcement, { speed: this.a11y.prefs.ttsSpeed });
  }

  /**
   * Read out a complete button with context
   */
  announceButton(buttonElement) {
    const label = this.getElementLabel(buttonElement);
    let announcement = `Button: ${label}`;

    if (buttonElement.getAttribute("aria-disabled") === "true") {
      announcement += ". This button is disabled.";
    }

    if (buttonElement.getAttribute("aria-pressed")) {
      announcement += `. Current state: ${buttonElement.getAttribute("aria-pressed")}`;
    }

    this.a11y.speak(announcement, { speed: this.a11y.prefs.ttsSpeed });
  }

  /**
   * Announce table structure and content for visually impaired
   */
  announceTable(tableElement) {
    const rows = tableElement.querySelectorAll("tbody tr");
    const headers = tableElement.querySelectorAll("th");

    let announcement = `Table with ${headers.length} columns and ${rows.length} rows. `;
    announcement += "Column headers: ";

    headers.forEach((header) => {
      announcement += `${header.textContent}. `;
    });

    this.a11y.speak(announcement, { speed: this.a11y.prefs.ttsSpeed });
  }

  /**
   * Announce all available form errors
   */
  announceErrors() {
    const errors = document.querySelectorAll('[role="alert"]');

    if (errors.length === 0) {
      this.a11y.speak("No errors found.", { speed: this.a11y.prefs.ttsSpeed });
      return;
    }

    let announcement = `There are ${errors.length} error messages: `;

    errors.forEach((error) => {
      announcement += `${error.textContent}. `;
    });

    this.a11y.speak(announcement, { speed: this.a11y.prefs.ttsSpeed });
  }

  /**
   * Create voice commands for navigation
   */
  setupVoiceCommands() {
    if (!("webkitSpeechRecognition" in window)) {
      console.log("Speech recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      this.a11y.announce("Voice command listening...");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      this.processVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    // Activate with Alt+V
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.key === "v") {
        recognition.start();
        e.preventDefault();
      }
    });

    return recognition;
  }

  /**
   * Process voice commands
   */
  processVoiceCommand(command) {
    const actions = this.getInteractiveElements(document.body);

    // Find matching interactive element by label
    for (const element of actions) {
      const label = this.getElementLabel(element);
      if (label.toLowerCase().includes(command)) {
        element.focus();
        element.click();
        this.a11y.speak(`Activated ${label}`);
        return;
      }
    }

    // Navigation commands
    if (command.includes("next")) {
      this.a11y.focusNext();
      return;
    }

    if (command.includes("previous") || command.includes("back")) {
      this.a11y.focusPrevious();
      return;
    }

    if (command.includes("menu")) {
      this.speakAvailableActions();
      return;
    }

    this.a11y.speak(`Command not found: ${command}`);
  }

  /**
   * Announce page navigation structure
   */
  announceNavigationMenu() {
    const navItems = document.querySelectorAll("nav a, nav button");

    if (navItems.length === 0) {
      this.a11y.speak("No navigation menu found", {
        speed: this.a11y.prefs.ttsSpeed,
      });
      return;
    }

    let announcement = `Navigation menu with ${navItems.length} items: `;

    navItems.forEach((item, idx) => {
      const label = this.getElementLabel(item);
      announcement += `${idx + 1}. ${label}. `;
    });

    this.a11y.speak(announcement, { speed: this.a11y.prefs.ttsSpeed });
  }

  /**
   * Guide user through a modal dialog
   */
  announceModal(modalElement) {
    const title = modalElement.querySelector("h1, h2")?.textContent || "Dialog";
    const closeBtn = modalElement.querySelector('[aria-label="Close"]');
    const buttons = modalElement.querySelectorAll("button");

    let announcement = `Dialog opened: ${title}. `;
    announcement += `${buttons.length} buttons available: `;

    buttons.forEach((btn) => {
      const label = this.getElementLabel(btn);
      announcement += `${label}. `;
    });

    if (closeBtn) {
      announcement += "Press Escape to close.";
    }

    this.a11y.speak(announcement, { speed: this.a11y.prefs.ttsSpeed });
  }

  /**
   * Play audio cue for important events
   */
  async playChime(type = "success") {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    // Different tones for different events
    const tones = {
      success: 600, // Higher pitch
      error: 300, // Lower pitch
      warning: 450, // Medium pitch
      info: 500, // Slightly higher
    };

    oscillator.frequency.value = tones[type] || 500;
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.5,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }

  /**
   * Cache navigation structure for quick access
   */
  updateNavigationCache() {
    this.navigationCache.clear();

    // Cache sections
    document.querySelectorAll('section, [role="region"]').forEach((section) => {
      const id = section.id || section.getAttribute("aria-label");
      if (id) {
        this.navigationCache.set(id, section);
      }
    });

    // Cache interactive elements
    this.getInteractiveElements(document.body).forEach((element) => {
      const label = this.getElementLabel(element);
      if (!this.navigationCache.has(label)) {
        this.navigationCache.set(label, element);
      }
    });
  }

  /**
   * Get quick navigation suggestions
   */
  suggestNavigation() {
    const suggestions = [];

    // Suggest next logical section
    const currentSection = document.activeElement.closest("section");
    if (currentSection && currentSection.nextElementSibling) {
      suggestions.push(
        `Next section: ${currentSection.nextElementSibling.textContent?.substring(0, 30)}`,
      );
    }

    // Suggest form fields if in a form
    const form = document.activeElement.closest("form");
    if (form) {
      const inputs = form.querySelectorAll("input, select, textarea");
      if (inputs.length > 0) {
        suggestions.push(`${inputs.length} form fields to complete`);
      }
    }

    return suggestions;
  }
}
