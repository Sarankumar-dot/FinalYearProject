# 🔧 Voice-Guided Navigation System - Developer Guide

## System Architecture Overview

The voice-guided navigation system is a comprehensive solution that provides audio feedback to mouse-using visually impaired students, helping them understand what elements are on the page and what actions they can perform.

### Architecture Diagram

```
User Interaction (Click/Focus)
        ↓
DOM Event (focusin/click)
        ↓
AccessibilityContext (setupAutoGuidance)
        ↓
VoiceGuidedNav Class
        ↓
Web Speech API (Text-to-Speech)
        ↓
User Hears Audio Feedback
```

---

## 📦 Core Components

### 1. **VoiceGuidedNav Class** (`client/src/utils/voiceGuidance.js`)

**Purpose:** Central utility class that handles voice announcements and audio cues.

**Key Methods:**

```javascript
constructor(a11yContext);
```

- Initializes voice guidance with accessibility context
- Sets up caching system for element analysis
- Stores reference to TTS speed preferences

#### Page Structure Methods

```javascript
announcePageStructure();
```

- Called when page loads
- Extracts page title, main heading, sections
- Announces: "Welcome to [Title]. Heading: [Heading]. Available sections: [list]"

```javascript
announceNavigationMenu();
```

- Lists all navigation items
- Counts menu items
- Helps users understand "where they are" in the app

```javascript
speakAvailableActions();
```

- Analyzes all clickable elements on page
- Announces buttons and what they do
- Announces forms and fields available

#### Element-Specific Announcement Methods

```javascript
announceHoveredElement(element);
```

- Called when user's mouse hovers over an interactive element
- Quickly identifies what type of element it is (button, link, input, etc.)
- Gives SHORT announcements for fast mouse movement
- Examples: "Button: Next", "Email address, text input", "Link: View Grades"
- Skips invisible or non-interactive elements
- This is the PRIMARY navigation method for mouse-using visually impaired users

```javascript
announceInputField(inputElement);
```

- Extracts label, type, required status, placeholder
- Generates contextual instructions (e.g., "Enter email" for email inputs)
- More detailed than hover announcement
- Used for Tab navigation or when explicitly focusing a field
- Caches for efficiency

```javascript
announceButton(buttonElement);
```

- Reads button text/aria-label
- Reports disabled state
- Describes button purpose from nearby text/context

```javascript
announceTable(tableElement);
```

- Counts rows and columns
- Extracts and reads column headers
- Announces row count

```javascript
announceErrors();
```

- Finds all visible error messages
- Reads them in sequence
- Helpful for form validation feedback

#### Modal/Dialog Methods

```javascript
announceModal(modalElement);
```

- Describes modal title
- Lists available buttons
- Explains how to close (Escape key, Close button)

#### Audio Feedback Methods

```javascript
playChime(type);
```

- Plays different audio tones
- Types: 'success', 'error', 'warning', 'info'
- User knows result of action without visual feedback

#### Voice Command Methods

```javascript
processVoiceCommand(transcript);
```

- Interprets user voice input
- Matches to available buttons/actions
- Executes matching action or announces "command not recognized"

```javascript
setupVoiceCommands();
```

- Initializes Web Speech API recognition
- Listens for voice input when activated
- Requires browser support (Chrome, Edge, Firefox)

#### Navigation Suggestion Methods

```javascript
suggestNavigation();
```

- Analyzes page state
- Suggests logical next steps
- Helps less-experienced users know what to do

#### Cache Management

```javascript
clearCache();
```

- Clears cached element analysis
- Called when DOM significantly changes
- Ensures accuracy after dynamic updates

---

### 2. **AccessibilityContext** (`client/src/context/AccessibilityContext.jsx`)

**Purpose:** Central state management for all accessibility features including voice guidance.

**New State Variables:**

```javascript
const [voiceGuidedNav, setVoiceGuidedNav] = useState(false);
const [autoAnnounceElements, setAutoAnnounceElements] = useState(false);
const [mouseHoverGuidance, setMouseHoverGuidance] = useState(false); // NEW: Mouse hover announcements
const [voiceNav, setVoiceNav] = useState(null); // VoiceGuidedNav instance
```

**Initialization in useEffect:**

```javascript
// On mount, create VoiceGuidedNav instance
const voiceNavInstance = new VoiceGuidedNav(a11yContext);
setVoiceNav(voiceNavInstance);

// If voice guidance enabled, announce page structure
if (voiceGuidedNav && voiceNavInstance) {
  voiceNavInstance.announcePageStructure();
}
```

**Auto-Guidance Setup Function (with Mouse Hover):**

```javascript
const setupAutoGuidance = () => {
  if (!voiceNav) return;

  // Listen for element focus
  document.addEventListener("focusin", (e) => {
    if (e.target.tagName === "INPUT") {
      voiceNav.announceInputField(e.target);
    }
    if (e.target.tagName === "BUTTON") {
      voiceNav.announceButton(e.target);
    }
    if (e.target.tagName === "TABLE") {
      voiceNav.announceTable(e.target);
    }
  });

  // Listen for clicks
  document.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      voiceNav.announceButton(e.target);
    }
  });

  // NEW: Listen for mouse hover (primary navigation for mouse users)
  let lastHoveredElement = null;
  document.addEventListener("mouseover", (e) => {
    if (!mouseHoverGuidance) return;

    // Only announce if we've moved to a different element
    const interactiveSelectors =
      'button, a, input, select, textarea, [role="button"], [role="tab"], [role="link"], label';
    const target = e.target.matches(interactiveSelectors)
      ? e.target
      : e.target.closest(interactiveSelectors);

    if (target && target !== lastHoveredElement) {
      lastHoveredElement = target;
      voiceNav.announceHoveredElement(e.target);
    }
  });

  // Reset hover tracking when mouse leaves
  document.addEventListener("mouseout", (e) => {
    lastHoveredElement = null;
  });
};
```

**Public Methods for Keyboard Shortcuts:**

```javascript
const speakPageGuide = () => {
  // Alt + N interaction
  voiceNav?.speakAvailableActions();
};

const announcePage = () => {
  // Alt + P interaction
  voiceNav?.announcePageStructure();
};

const announceNav = () => {
  // Alt + M interaction
  voiceNav?.announceNavigationMenu();
};
```

**Provider Value:**

```javascript
const value = {
  // ... existing properties
  voiceGuidedNav,
  setVoiceGuidedNav,
  autoAnnounceElements,
  setAutoAnnounceElements,
  speakPageGuide,
  announcePage,
  announceNav,
  voiceNav,
};
```

---

### 3. **Keyboard Shortcuts Integration** (`client/src/utils/a11y.js`)

**Purpose:** Wire up keyboard shortcuts to voice guidance methods.

**New Shortcut Handlers:**

```javascript
// Alt + P: Page Overview
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "p") {
    e.preventDefault();
    accessibilityContext.announcePage();
  }
});

// Alt + M: Menu Navigation
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "m") {
    e.preventDefault();
    accessibilityContext.announceNav();
  }
});

// Alt + N: Next Actions
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "n") {
    e.preventDefault();
    accessibilityContext.speakPageGuide();
  }
});

// Alt + V: Voice Commands (future enhancement)
document.addEventListener("keydown", (e) => {
  if (e.altKey && e.key === "v") {
    e.preventDefault();
    accessibilityContext.voiceNav?.setupVoiceCommands();
  }
});
```

**Important:** These handlers require `accessibilityContext` parameter to function, which is why `AccessibilityInitializer` wrapper is used.

---

### 4. **AccessibilityPanel Component** (`client/src/components/AccessibilityPanel.jsx`)

**Purpose:** User interface for controlling voice guidance settings.

**New "Voice Guidance" Section:**

```jsx
<div className="a11y-section">
  <h3>Voice Guidance</h3>

  <label className="setting-toggle">
    <input
      type="checkbox"
      checked={voiceGuidedNav}
      onChange={(e) => setVoiceGuidedNav(e.target.checked)}
    />
    <span>Voice Guide Every Action</span>
  </label>
  <p className="setting-desc">
    Speak out loud when you click buttons or focus form fields
  </p>

  <label className="setting-toggle">
    <input
      type="checkbox"
      checked={autoAnnounceElements}
      onChange={(e) => setAutoAnnounceElements(e.target.checked)}
    />
    <span>Auto-Announce Elements</span>
  </label>
  <p className="setting-desc">
    Automatically announce form fields and buttons as you navigate
  </p>

  <div className="keyboard-shortcuts">
    <h4>Keyboard Shortcuts</h4>
    <ul>
      <li>
        <kbd>Alt + P</kbd> - Page Overview
      </li>
      <li>
        <kbd>Alt + M</kbd> - Menu Navigation
      </li>
      <li>
        <kbd>Alt + N</kbd> - Next Actions
      </li>
      <li>
        <kbd>Alt + V</kbd> - Voice Commands
      </li>
    </ul>
  </div>
</div>
```

---

### 5. **AccessibilityInitializer Component** (NEW)

**Purpose:** Ensures accessibility setup happens after all context providers are ready.

**Implementation:**

```jsx
function AccessibilityInitializer({ children }) {
  const a11y = useAccessibility();

  useEffect(() => {
    // All setup happens here with context available
    injectA11yStyles();
    createSkipLinks();
    enhanceAriaLabels();
    setupKeyboardShortcuts(a11y); // <-- CRITICAL: Pass context

    return () => {
      // Cleanup if needed
    };
  }, [a11y]);

  return children;
}
```

**Wrapper Usage in App:**

```jsx
<AuthProvider>
  <AccessibilityProvider>
    <AccessibilityInitializer>
      <BrowserRouter>{/* All routes and content */}</BrowserRouter>
    </AccessibilityInitializer>
  </AccessibilityProvider>
</AuthProvider>
```

---

## 🔄 Data Flow Diagram

### When User Focuses on Form Field with Voice Guidance Enabled:

```
User Tab to Email Field
        ↓
focusin Event Triggered
        ↓
setupAutoGuidance Listener Fires
        ↓
Checks: e.target.tagName === 'INPUT'
        ↓
Calls: voiceNav.announceInputField(e.target)
        ↓
VoiceGuidedNav analyzes element:
  - Finds label: "Email Address"
  - Gets type: "email"
  - Checks required: true
  - Reads placeholder: "example@email.com"
        ↓
generateInputDescription() creates:
"Email Address, email input, required, example@email.com"
        ↓
a11y.speak() uses Web Speech API to speak text
        ↓
User Hears: "Email Address, email input, required, example@email.com"
```

### When User Presses Alt + P (Page Overview):

```
User Presses Alt + P
        ↓
Keyboard event listener catches
        ↓
Calls: accessibilityContext.announcePage()
        ↓
announcePage() calls: voiceNav.announcePageStructure()
        ↓
VoiceGuidedNav analyzes page:
  - Gets title: "Student Dashboard"
  - Gets h1: "My Learning Progress"
  - Gets sections: "Recent Lessons", "Active Quizzes", "My Grades"
  - Builds announcement string
        ↓
a11y.speak() announces full page structure
        ↓
User Hears: "Welcome to Student Dashboard. Heading: My Learning Progress.
            Available sections: Recent Lessons. Active Quizzes. My Grades."
```

---

## 🛠️ Implementation Details

### Text Element Label Detection

```javascript
getElementLabel(element) {
  // Priority 1: Associated label element
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`)
    if (label) return label.textContent
  }

  // Priority 2: aria-label attribute
  if (element.getAttribute('aria-label')) {
    return element.getAttribute('aria-label')
  }

  // Priority 3: placeholder attribute
  if (element.placeholder) {
    return element.placeholder
  }

  // Priority 4: parent label
  const parentLabel = element.closest('label')
  if (parentLabel) return parentLabel.textContent

  // Default fallback
  return 'unlabeled field'
}
```

### Context-Aware Instructions

```javascript
getFieldInstruction(type) {
  const instructions = {
    'email': 'Enter your email address',
    'password': 'Enter your password for security',
    'text': 'Type your response here',
    'number': 'Enter a number',
    'date': 'Select a date',
    'checkbox': 'Check this box if you agree',
    'radio': 'Select one option using arrow keys'
  }
  return instructions[type] || 'Enter your response'
}
```

---

## ⚙️ Configuration & Customization

### Enabling Voice Guidance for Different User Types

In login or settings:

```javascript
// When user selects "Visually Impaired" during registration
const accessibilityType = "VISUALLY_IMPAIRED";

if (accessibilityType === "VISUALLY_IMPAIRED") {
  setAccessibilitySettings({
    screenReaderMode: true,
    voiceGuidedNav: true, // AUTO-ENABLE
    autoAnnounceElements: true, // AUTO-ENABLE
    keyboardNavEnabled: true,
    ttsSpeed: 1.0,
  });
}
```

### Disabling Features for Testing

```javascript
// In development, to test without constant voice:
const isProd = process.env.NODE_ENV === "production";
const autoEnableVoice = isProd && isVisuallyImpaired;

setVoiceGuidedNav(autoEnableVoice);
```

---

## 🐛 Debugging Voice Guidance

### Enable Debug Logging

```javascript
// In VoiceGuidedNav constructor
this.DEBUG = process.env.NODE_ENV === "development";

// In announcement methods
if (this.DEBUG) {
  console.log("[VoiceNav]", type, element, announcement);
}
```

### Check if Web Speech API is Available

```javascript
const checkWebSpeechAPI = () => {
  const supported = window.speechSynthesis !== undefined;
  console.log("Web Speech API available:", supported);
  return supported;
};
```

### Monitor Active Announcements

```javascript
// Add to VoiceGuidedNav
this.activeAnnouncement = null

speak(text) {
  this.activeAnnouncement = text
  if (this.DEBUG) console.log('Speaking:', text)
  this.a11y.speak(text)
}
```

---

## 🧪 Testing Voice Guidance

### Unit Test Example

```javascript
describe("VoiceGuidedNav", () => {
  let voiceNav;
  let a11yContext;

  beforeEach(() => {
    a11yContext = { speak: jest.fn() };
    voiceNav = new VoiceGuidedNav(a11yContext);
  });

  test("announceButton reads button text", () => {
    const button = document.createElement("button");
    button.textContent = "Submit Quiz";

    voiceNav.announceButton(button);

    expect(a11yContext.speak).toHaveBeenCalledWith(
      expect.stringContaining("Submit Quiz"),
    );
  });
});
```

### Manual Testing Checklist

- [ ] Register with "Visually Impaired" option
- [ ] Login and open dashboard
- [ ] Enable "Voice Guide Every Action" in settings
- [ ] Tab to email field → Hear "Email, email input, required"
- [ ] Click a button → Hear button description
- [ ] Press Alt + P → Hear page overview
- [ ] Press Alt + M → Hear menu items
- [ ] Press Alt + N → Hear available actions
- [ ] Change TTS speed → Verify voice speed changes
- [ ] Open different pages → Hear appropriate announcements

---

## 🔗 Integration Points

### With Existing Accessibility Features

**Screen Reader Mode:**

- Voice guidance COMPLEMENTS screen readers
- Both can be enabled simultaneously
- Voice guidance provides extra help for mouse users

**Text-to-Speech:**

- Uses same `a11y.speak()` method
- Respects same TTS speed preferences
- Voice guidance is TTS-powered

**Keyboard Navigation:**

- Alt shortcuts work with keyboard nav
- Voice guidance helps keyboard users too
- Fully compatible

---

## 📈 Performance Considerations

### Element Analysis Caching

```javascript
this.elementCache = new Map()

// Cache results to avoid repeated DOM traversals
cacheElement(element, data) {
  const key = element === document.body ? 'page' : element.id || element
  this.elementCache.set(key, data)
}

getCachedAnalysis(element) {
  const key = element === document.body ? 'page' : element.id || element
  return this.elementCache.get(key)
}
```

### Lazy Analysis

```javascript
// Don't analyze every element immediately
// Only analyze when user interacts
announceButton(button) {
  // Quick analysis, not deep
  const text = button.textContent || button.getAttribute('aria-label')
  const disabled = button.disabled
  // Minimal DOM traversal
  this.a11y.speak(`${text}, ${disabled ? 'disabled' : 'button'}`)
}
```

---

## 🚀 Future Enhancements

### 1. Advanced Voice Commands

```javascript
// "Click submit button"
// "Go to next question"
// "Read quiz instructions"
```

### 2. Context-Aware Suggestions

```javascript
// On quiz: "You can take the quiz, review materials, or go back"
// On form: "You have 3 more fields to fill before you can submit"
```

### 3. Audio Cues

```javascript
// Success: bell sound
// Error: buzzer sound
// Warning: beep sound
// Info: chime sound
```

### 4. Voice Preference Learning

```javascript
// Track which announcements user skips
// Adjust detail level over time
// Learn user's preferred pace
```

### 5. Lesson-Specific Guidance

```javascript
// Special announcements for video content
// Captions synchronization
// Interactive element guidance
```

---

## 📚 Related Files

| File                                                 | Purpose                           |
| ---------------------------------------------------- | --------------------------------- |
| `client/src/utils/voiceGuidance.js`                  | Core VoiceGuidedNav class         |
| `client/src/context/AccessibilityContext.jsx`        | State management & integration    |
| `client/src/utils/a11y.js`                           | Keyboard shortcuts setup          |
| `client/src/components/AccessibilityPanel.jsx`       | User settings UI                  |
| `client/src/components/AccessibilityInitializer.jsx` | App initialization wrapper        |
| `client/src/App.jsx`                                 | App structure with initialization |

---

## 🤝 Contributing

When enhancing voice guidance:

1. **Keep announcements concise** - Usually 1-2 sentences max
2. **Use consistent phrasing** - "Button: [name]", "Form field: [label]"
3. **Add to VoiceGuidedNav** - All voice logic goes in this class
4. **Test with actual screen reader** - Ensure compatibility
5. **Update documentation** - Keep guides in sync with changes
6. **Consider performance** - Don't cause page slowdown

---

## 📞 Support

For issues or questions about voice guidance implementation:

1. Check browser console for errors
2. Enable DEBUG mode in VoiceGuidedNav
3. Verify Web Speech API availability
4. Test with different browsers (Chrome, Firefox, Edge)
5. Check accessibility context is properly initialized

---

**Last Updated:** When voice guidance system was implemented  
**Maintained By:** Development Team  
**Status:** Production Ready
