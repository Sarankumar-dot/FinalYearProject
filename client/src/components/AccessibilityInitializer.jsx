import React, { useEffect } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  setupKeyboardShortcuts,
  createSkipLinks,
  enhanceAriaLabels,
  injectA11yStyles,
} from "../utils/a11y";

/**
 * Accessibility Initializer Component
 * Sets up all accessibility features with proper context access
 */
export function AccessibilityInitializer({ children }) {
  const a11y = useAccessibility();

  useEffect(() => {
    if (!a11y) {
      console.warn("Accessibility context not available");
      return;
    }

    try {
      // Inject accessibility styles
      injectA11yStyles();

      // Create skip links
      createSkipLinks();

      // Enhance ARIA labels
      enhanceAriaLabels();

      // Setup keyboard shortcuts with accessibility context
      const cleanup = setupKeyboardShortcuts(a11y);

      return cleanup;
    } catch (error) {
      console.error("Error setting up accessibility features:", error);
      return () => {};
    }
  }, [a11y]);

  return children;
}
