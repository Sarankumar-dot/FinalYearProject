// Accessibility utilities for enhanced keyboard navigation and screen reader support
export const setupKeyboardShortcuts = (accessibilityContext) => {
  const handleKeyDown = (e) => {
    // Alt + A: Open accessibility settings
    if (e.altKey && e.key === "a") {
      e.preventDefault();
      const event = new CustomEvent("openAccessibilityPanel");
      window.dispatchEvent(event);
    }

    // Alt + S: Skip to main content
    if (e.altKey && e.key === "s") {
      e.preventDefault();
      const mainContent =
        document.querySelector("main") ||
        document.querySelector('[role="main"]');
      if (mainContent) {
        mainContent.focus();
        mainContent.scrollIntoView({ behavior: "smooth" });
      }
    }

    // Alt + P: Announce page overview (voice guidance)
    if (e.altKey && e.key === "p") {
      e.preventDefault();
      if (accessibilityContext?.announcePage) {
        accessibilityContext.announcePage();
      }
    }

    // Alt + M: Announce available menu options
    if (e.altKey && e.key === "m") {
      e.preventDefault();
      if (accessibilityContext?.announceNav) {
        accessibilityContext.announceNav();
      }
    }

    // Alt + N: Announce next available actions
    if (e.altKey && e.key === "n") {
      e.preventDefault();
      if (accessibilityContext?.speakPageGuide) {
        accessibilityContext.speakPageGuide();
      }
    }

    // Alt + H: Show help
    if (e.altKey && e.key === "h") {
      e.preventDefault();
      alert(`
Keyboard Shortcuts:
• Alt + A: Open accessibility settings
• Alt + S: Skip to main content
• Alt + P: Announce page overview
• Alt + M: Announce menu options
• Alt + N: Announce next actions
• Alt + H: Show this help
• Tab: Navigate to next focusable element
• Shift + Tab: Navigate to previous focusable element
• Enter/Space: Activate buttons
      `);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
};

// Create skip links for keyboard navigation
export const createSkipLinks = () => {
  const skipLinksContainer = document.createElement("div");
  skipLinksContainer.className = "skip-links";
  skipLinksContainer.style.cssText = `
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;

  const links = [
    { href: "#main-content", text: "Skip to main content" },
    { href: "#navigation", text: "Skip to navigation" },
    { href: "#footer", text: "Skip to footer" },
  ];

  links.forEach((link) => {
    const a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.text;
    a.style.cssText = `
      display: block;
      padding: 0.5rem;
      background: #6c63ff;
      color: white;
      text-decoration: none;
      margin: 0.25rem;
    `;
    a.addEventListener("focus", () => {
      a.style.left = "0";
      a.style.top = "0";
    });
    a.addEventListener("blur", () => {
      a.style.left = "-10000px";
      a.style.top = "auto";
    });
    skipLinksContainer.appendChild(a);
  });

  document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  return skipLinksContainer;
};

// Announce changes to screen readers
export const announceToScreenReader = (message, priority = "polite") => {
  const ariaLive = document.querySelector("[aria-live]");
  if (ariaLive) {
    ariaLive.textContent = message;
    ariaLive.setAttribute("aria-live", priority);
  }
};

// Add aria labels to common UI patterns
export const enhanceAriaLabels = () => {
  // Add aria-labels to buttons without text content
  document
    .querySelectorAll("button:not([aria-label]):not([title])")
    .forEach((btn) => {
      if (!btn.textContent.trim()) {
        const icon = btn.querySelector('[class*="icon"]');
        if (icon) {
          btn.setAttribute("aria-label", `Button: ${icon.className}`);
        }
      }
    });

  // Enhance form inputs
  document.querySelectorAll("input:not([aria-label])").forEach((input) => {
    const label = input.closest(".form-group")?.querySelector("label");
    if (label && label.textContent) {
      input.setAttribute("aria-label", label.textContent);
    }
  });

  // Add region roles
  document.querySelectorAll("nav:not([role])").forEach((nav) => {
    nav.setAttribute("role", "navigation");
  });

  document.querySelectorAll("aside:not([role])").forEach((aside) => {
    aside.setAttribute("role", "complementary");
  });
};

// Focus management for dialogs
export const manageFocusTrap = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );

  if (focusableElements.length === 0) return () => {};

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e) => {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener("keydown", handleKeyDown);
  firstElement.focus();

  return () => element.removeEventListener("keydown", handleKeyDown);
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Add skip navigation links to CSS
export const injectA11yStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    /* Focus visible - enhanced visibility */
    *:focus-visible {
      outline: 3px solid #6c63ff;
      outline-offset: 2px;
    }

    /* High contrast mode */
    @media (prefers-contrast: more) {
      body {
        --color-accent: #0000ff;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    /* Screen reader only class */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    /* Ensure focus indicators are visible */
    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible {
      outline: 3px solid var(--color-accent, #6c63ff);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
};
