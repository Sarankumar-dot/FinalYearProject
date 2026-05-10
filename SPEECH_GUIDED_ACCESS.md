# Full Voice Control Mode — Integration Plan

Add a comprehensive voice-controlled accessibility system that enables visually impaired students to navigate, learn, and interact with the entire platform using natural voice commands. The system extends the existing `VoiceGuidedNav`, `AccessibilityContext`, and TTS infrastructure without rebuilding anything.

## User Review Required

> [!IMPORTANT]
> **Access restriction:** This feature is exclusively for **visually-impaired students only**. The Voice Control floating widget, wake word listener, and all command processing will only activate when `user.accessibilityType === 'visually-impaired'`. Teachers and hearing-impaired students will never see it.

> [!IMPORTANT]
> **No external APIs needed.** Uses the browser's native `webkitSpeechRecognition` (Web Speech API) for voice input and the existing `SpeechSynthesisUtterance` for TTS output. Works entirely offline/client-side. Chrome/Edge are fully supported.

> [!WARNING]
> **Browser compatibility:** The Web Speech API (`webkitSpeechRecognition`) works in Chrome, Edge, and Safari. Firefox has limited support. The feature will gracefully degrade with a message if the browser doesn't support it.

## Proposed Changes

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  VoiceControlProvider (React Context)                │
│  ┌───────────────────────────────────────────────┐   │
│  │ voiceCommandEngine.js                          │   │
│  │ ├─ SpeechRecognition (continuous listening)    │   │
│  │ ├─ Wake word detection ("Hey Companion")       │   │
│  │ ├─ Command parser (natural language → intent)  │   │
│  │ └─ Response builder (intent → spoken reply)    │   │
│  └───────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────┐   │
│  │ voiceCommandRegistry.js                        │   │
│  │ ├─ Navigation commands (open, go to, back)     │   │
│  │ ├─ Learning commands (read, pause, next)       │   │
│  │ ├─ Quiz commands (start, option A, submit)     │   │
│  │ ├─ Video commands (play, pause, mute, fwd)     │   │
│  │ ├─ Settings commands (speed, volume, theme)    │   │
│  │ └─ Conversational handlers (what courses, etc) │   │
│  └───────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────┐   │
│  │ VoiceControlWidget.jsx (floating UI)           │   │
│  │ ├─ Mic status indicator (listening/idle/error) │   │
│  │ ├─ Live transcript display                     │   │
│  │ ├─ Last response display                       │   │
│  │ └─ Settings quick-access                       │   │
│  └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### New Files Summary

| File | Purpose |
|---|---|
| `client/src/utils/voiceCommandEngine.js` | Core voice recognition engine with wake word, continuous listening, NLP-lite parser |
| `client/src/utils/voiceCommandRegistry.js` | All command definitions: navigation, learning, quiz, video, settings, conversational |
| `client/src/context/VoiceControlContext.jsx` | React context provider managing voice control state, integrating with AccessibilityContext |
| `client/src/components/VoiceControlWidget.jsx` | Floating mic widget UI — shows status, transcript, response |
| `client/src/components/VoiceControlSettings.jsx` | Voice control settings panel section (mic, speed, wake word, etc.) |

### Modified Files Summary

| File | Change |
|---|---|
| `client/src/context/AccessibilityContext.jsx` | Add `voiceControlEnabled` pref, expose `lastTTSText` for repeat |
| `client/src/components/AccessibilityPanel.jsx` | Add Voice Control settings section |
| `client/src/pages/Student/StudentLayout.jsx` | Mount `VoiceControlProvider` + `VoiceControlWidget` for VI students |
| `client/src/pages/Student/LessonViewer.jsx` | Expose lesson state to voice context (lesson data, video ref, TTS state) |
| `client/src/pages/Student/QuizPlayer.jsx` | Expose quiz state to voice context (current question, answer selection, submit) |
| `client/src/index.css` | Add styles for voice control widget |

---

### Component 1: Voice Command Engine

#### [NEW] [voiceCommandEngine.js](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/utils/voiceCommandEngine.js)

Core class `VoiceCommandEngine`:

**Speech Recognition:**
- Uses `webkitSpeechRecognition` with `continuous = true` and `interimResults = true`
- Auto-restarts on end/error for uninterrupted listening
- Configurable language (default: `en-US`)
- Sends final transcripts to the command parser

**Wake Word Detection:**
- Listens for "Hey Companion" or "Hello Assistant" before processing commands
- When wake word is detected, plays an audio chime and begins accepting commands for 10 seconds
- Wake word mode can be toggled on/off — when off, the mic processes all speech as commands
- Debounce: ignores duplicate triggers within 2 seconds

**Command Parser (NLP-lite):**
- Normalizes transcript (lowercase, trim, remove filler words)
- Matches against the command registry using fuzzy keyword matching
- Returns `{ intent, params, confidence }` or null if no match
- Supports compound commands: "Open courses and read lesson one"

**Anti-overlap:**
- Pauses recognition while TTS is speaking (prevents the system from hearing itself)
- Resumes listening after TTS finishes
- Queue-based response system — no overlapping speech

---

#### [NEW] [voiceCommandRegistry.js](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/utils/voiceCommandRegistry.js)

Defines all supported voice commands organized by category. Each command has:
- `patterns: string[]` — keyword patterns that trigger it
- `handler: (context, params) => string` — executes action, returns spoken response
- `description: string` — human-readable description for help

**1. Navigation Commands:**
| Voice Command | Action |
|---|---|
| "Open Dashboard" / "Go to Dashboard" / "Go home" | Navigate to `/student` |
| "Open Courses" / "Go to Courses" / "Show courses" | Navigate to `/student/courses` |
| "Open Settings" / "Accessibility Settings" | Navigate to `/student/settings` |
| "Open Documents" | Navigate to `/student/documents` |
| "Show My Progress" / "Open Progress" | Navigate to `/student/progress` |
| "Go Back" / "Go back" / "Previous page" | `navigate(-1)` |
| "Logout" / "Sign out" | Call `logout()` |

**2. Page Awareness:**
| Voice Command | Response |
|---|---|
| "Where am I?" / "What page is this?" | "You are currently on the Dashboard page" |
| "What's on this page?" / "Describe page" | Announces page structure and interactive elements |
| "How many courses?" | Fetches course count from `/api/lessons` |

**3. Learning / Reading Commands:**
| Voice Command | Action |
|---|---|
| "Read lesson" / "Read content" | Triggers TTS on lesson textContent/transcript |
| "Pause reading" / "Stop reading" | Calls `stopSpeech()` |
| "Resume" / "Continue reading" | Resumes TTS from last position |
| "Repeat" / "Say that again" | Re-speaks the last TTS output |
| "Next lesson" / "Previous lesson" | Navigates to adjacent lesson |
| "Increase voice speed" / "Faster" | Increases TTS speed by 0.2 |
| "Slow down" / "Decrease speed" | Decreases TTS speed by 0.2 |

**4. Video Commands:**
| Voice Command | Action |
|---|---|
| "Play video" / "Start video" | `videoRef.play()` |
| "Pause video" | `videoRef.pause()` |
| "Stop video" | Pause + seek to 0 |
| "Mute video" / "Unmute" | Toggle `videoRef.muted` |
| "Increase volume" / "Decrease volume" | Adjust `videoRef.volume` by ±0.2 |
| "Forward video" / "Skip forward" | `currentTime += 10` |
| "Rewind video" / "Go back 10 seconds" | `currentTime -= 10` |
| "Replay video" | Seek to 0 and play |

**5. Quiz Commands:**
| Voice Command | Action |
|---|---|
| "Start quiz" / "Open quiz" | Click the quiz CTA button |
| "Read question" | TTS reads current question + options |
| "Option A" / "Option B" / "Option C" / "Option D" | Selects the corresponding answer |
| "True" / "False" | Selects true/false answer |
| "Next question" | Clicks next button |
| "Previous question" | Clicks prev button |
| "Submit quiz" / "Finish quiz" | Clicks submit button |

**6. Conversational:**
| Voice Command | Response |
|---|---|
| "What courses are available?" | Fetches from `/api/lessons` and reads course list |
| "Open [course name]" | Fuzzy-matches against available lessons and navigates |
| "What time is it?" | Reads current time |
| "Help" / "What can I do?" | Lists available commands for current page |

**7. Settings Commands:**
| Voice Command | Action |
|---|---|
| "Turn off microphone" | Disables voice control |
| "Dark mode" / "Light mode" / "High contrast" | Changes theme |
| "Increase font" / "Decrease font" | Changes font size |

---

### Component 2: Voice Control Context

#### [NEW] [VoiceControlContext.jsx](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/context/VoiceControlContext.jsx)

React context that:
- Initializes `VoiceCommandEngine` on mount (only for VI students)
- Provides `voiceState` to all children: `{ isListening, isProcessing, lastTranscript, lastResponse, wakeWordActive }`
- Connects the command engine with React Router's `useNavigate()` for navigation commands
- Maintains a `pageContext` object that pages can update to register their state:
  ```js
  { 
    pageName: 'LessonViewer',
    lessonData: { ... },
    videoRef: ref,
    quizState: { currentQuestion, selectAnswer, submitQuiz },
  }
  ```
- Wraps `speak()` to track `lastTTSText` for the "repeat" command
- Handles the lifecycle: create engine → start → stop → cleanup

---

### Component 3: Floating Voice Widget

#### [NEW] [VoiceControlWidget.jsx](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/components/VoiceControlWidget.jsx)

A fixed-position floating widget in the bottom-right corner:

**UI Elements:**
- **Mic Button:** Large circular button with pulsing animation when listening
  - 🎤 (blue pulse) = Active and listening
  - 🎤 (gray) = Idle / mic off
  - 🎤 (red) = Error / not supported
- **Status Text:** "Listening…" / "Processing…" / "Say 'Hey Companion'…"
- **Transcript Bubble:** Shows the last recognized speech text (fades after 5s)
- **Response Bubble:** Shows the assistant's last spoken response (fades after 8s)
- **Quick Controls:** Compact row with mic toggle, speed ±, and settings link

**Design:**
- Glassmorphic card matching the platform's dark theme
- Uses existing CSS variables (`--color-surface`, `--glass-bg`, etc.)
- Smooth slide-up entrance animation
- Non-intrusive — doesn't overlap main content (positioned in corner with a small footprint)
- Fully keyboard accessible (Tab, Enter/Space to toggle)
- ARIA live regions for transcript/response announcements

**Visibility:**
- Only rendered when `user.accessibilityType === 'visually-impaired'`
- Can be minimized to just the mic button
- Keyboard shortcut `Alt+V` to toggle focus to the widget

---

### Component 4: Voice Control Settings

#### [NEW] [VoiceControlSettings.jsx](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/components/VoiceControlSettings.jsx)

A new section in the AccessibilityPanel with these controls:
- **Enable/Disable Voice Control** (main toggle)
- **Microphone ON/OFF** (toggle)
- **Voice Speed** (slider 0.5–2.0, synced with existing `ttsSpeed`)
- **Voice Volume** (slider 0–1)
- **Wake Word Activation** (toggle — "Hey Companion" / "Hello Assistant")
- **Repeat Last Response** (button)
- **Voice Command Help** (expandable list of available commands)

---

### Component 5: Modified Files

#### [MODIFY] [AccessibilityContext.jsx](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/context/AccessibilityContext.jsx)

- Add to `DEFAULTS`: `voiceControlEnabled: false`, `wakeWordEnabled: true`, `voiceVolume: 1.0`
- Auto-enable `voiceControlEnabled: true` for visually-impaired users (alongside the existing auto-enable block)
- Track `lastTTSText` in the speak function for the "repeat" feature
- Expose `lastTTSText` in the context value

#### [MODIFY] [AccessibilityPanel.jsx](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/components/AccessibilityPanel.jsx)

- Import and render `VoiceControlSettings` as a new collapsible section after the existing "Voice Guidance" section
- Only show this section for visually-impaired students

#### [MODIFY] [StudentLayout.jsx](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/pages/Student/StudentLayout.jsx)

- Import `VoiceControlProvider` and `VoiceControlWidget`
- Wrap the `<Outlet />` with `<VoiceControlProvider>` (only for VI students)
- Render `<VoiceControlWidget />` (conditionally for VI students)

#### [MODIFY] [LessonViewer.jsx](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/pages/Student/LessonViewer.jsx)

- Import `useVoiceControl` hook
- On mount, register page context with lesson data, video ref, and available actions
- On unmount, unregister page context

#### [MODIFY] [QuizPlayer.jsx](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/pages/Student/QuizPlayer.jsx)

- Import `useVoiceControl` hook
- On mount, register quiz state (current question, readQuestion, handleAnswer, goNext, goPrev, handleSubmit)
- On unmount, unregister

#### [MODIFY] [index.css](file:///c:/Users/Acer/Desktop/FinalYearProject/Codes/client/src/index.css)

- Add styles for the floating voice control widget:
  - `.voice-widget` — fixed position, glassmorphism, z-index
  - `.voice-mic-btn` — circular button with pulse animation
  - `.voice-mic-btn--active` — blue pulsing ring
  - `.voice-mic-btn--error` — red state
  - `.voice-transcript` — fade-in/out speech bubble
  - `.voice-response` — assistant response bubble
  - `@keyframes voice-pulse` — pulse ring animation

---

## Verification Plan

### Automated Tests
1. Start server + client
2. Browser subagent:
   - Register a visually-impaired student
   - Log in → verify the voice control widget appears in bottom-right
   - Verify the widget shows "Listening…" status
   - Navigate to courses, lessons — verify widget persists
   - Verify existing pages (dashboard, courses, quiz) still render correctly
   - Log in as hearing-impaired student → verify widget does NOT appear

### Manual Verification
- Test voice commands with a real microphone:
  - "Open Courses" → navigates to courses
  - "Go Back" → navigates back
  - "What courses are available?" → reads course list
  - "Read lesson" → TTS reads lesson content
  - "Pause reading" → stops TTS
  - "Option A" (during quiz) → selects answer
  - "Hey Companion, open dashboard" → wake word + navigate
