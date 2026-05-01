# 🎙️ Voice Guidance Quick Reference & Testing Guide

## ⚡ Quick Start For Users

### First Time Setup (< 2 minutes)

1. **Register** → Select "Visually Impaired" accessibility
2. **Login**
3. **Press Alt + A** → Open accessibility settings
4. **Adjust voice speed** if needed (0.5× to 2.0×)
5. **Close settings** → Ready to use!

### Key Shortcuts

| Key         | Action        | Hear                |
| ----------- | ------------- | ------------------- |
| **Alt + P** | Page Overview | What's on this page |
| **Alt + M** | Menu Items    | Navigation options  |
| **Alt + N** | Next Actions  | What you can do     |
| **Alt + A** | Settings      | Accessibility panel |

### Enabling Voice Guidance

1. **Alt + A** to open settings
2. Look for **"Voice Guidance"** section
3. Toggle **"Voice Guide Every Action"** ✓
4. Toggle **"Auto-Announce Elements"** ✓
5. Done! Voice guidance is on

---

## 🧪 Testing Checklist for Developers

### Pre-Testing Setup

- [ ] Fresh browser (clear cache)
- [ ] Open DevTools Console (F12)
- [ ] Register as "Visually Impaired" user
- [ ] Login successfully
- [ ] Navigate to dashboard

### Feature Tests

#### ✅ Voice Guidance Enabled

- [ ] In settings, toggle "Voice Guide Every Action" ON
- [ ] Toggle "Auto-Announce Elements" ON
- [ ] Close settings panel
- [ ] Refresh page
- [ ] Should hear page announcement

#### ✅ Tab Navigation with Announcements

- [ ] Press Tab to move to form field
- [ ] **Should hear:** "Email, email input, required, example@email.com"
- [ ] Press Tab to next field
- [ ] **Should hear:** Field description
- [ ] Continue through all fields
- [ ] **Should hear:** Each field announced

#### ✅ Button Clicking with Announcements

- [ ] Click any button on page
- [ ] **Should hear:** "Button: [button name]"
- [ ] Click another button
- [ ] **Should hear:** New button announcement

#### ✅ Mouse Hover Announcements (NEW!) ⭐

- [ ] In settings, toggle "Voice on Mouse Hover" ON
- [ ] Move mouse over a button
- [ ] **Should hear:** Short announcement like "Button: Next"
- [ ] Move mouse to another button
- [ ] **Should hear:** New button announcement (different from previous)
- [ ] Move mouse over a form field
- [ ] **Should hear:** "Email, text input" or similar
- [ ] Move mouse over a link
- [ ] **Should hear:** "Link: [name]"
- [ ] Move mouse quickly across multiple elements
- [ ] **Should hear:** Each element announced as you hover
- [ ] Move mouse away from page
- [ ] **Should stop hearing** announcements
- [ ] Hover on same element twice
- [ ] **Should only hear** first time (no repeat for same element)

#### ✅ Keyboard Shortcut Alt + P (Page Overview)

- [ ] Navigate to any page
- [ ] Press Alt + P
- [ ] **Should hear:** Page title, main heading, sections available
- [ ] Example: "Welcome to Student Dashboard. Heading: My Learning Progress. Available sections: Recent Lessons. Active Quizzes."

#### ✅ Keyboard Shortcut Alt + M (Menu Navigation)

- [ ] Press Alt + M anywhere in app
- [ ] **Should hear:** All navigation menu items
- [ ] Example: "Navigation menu has 4 items: Dashboard. Courses. Progress. Settings."

#### ✅ Keyboard Shortcut Alt + N (Next Actions)

- [ ] Open a page with buttons or interactive elements
- [ ] Press Alt + N
- [ ] **Should hear:** Available actions/buttons on page

#### ✅ TTS Speed Control

- [ ] Open settings (Alt + A)
- [ ] Find "Text-to-Speech" section
- [ ] Adjust speed slider to **0.5×**
- [ ] Hover over a button → Should hear slower voice
- [ ] Adjust to **1.5×**
- [ ] Hover over a button → Should hear faster voice
- [ ] Adjust to **1.0×** (normal) to continue testing

#### ✅ Form Field Interaction with Hover

- [ ] Move mouse to email field
- [ ] **Should hear:** "Email, text input, required"
- [ ] Move mouse to password field
- [ ] **Should hear:** "Password, password input, required"
- [ ] Navigate to login form using Tab
- [ ] **Should also hear:** Field announcements
- [ ] Type email address
- [ ] Press Tab
- [ ] **Should hear:** "Password, password input, required"
- [ ] Type password
- [ ] Press Tab
- [ ] **Should hear:** Button name
- [ ] Press Enter → Submit
- [ ] **Should hear:** "Submitting..." or success message

#### ✅ Quiz Navigation

- [ ] Open a quiz
- [ ] Press Alt + P
- [ ] **Should hear:** "Quiz: [Name]. Contains [X] questions"
- [ ] Press Tab through quiz
- [ ] **Should hear:** Question details and answer options announced
- [ ] Select an answer
- [ ] Press Tab to submit button
- [ ] **Should hear:** "Submit button"

#### ✅ Auto-Announce When Enabled (Keyboard Navigation)

This is for keyboard-only users (not mouse hover):

- [ ] Toggle "Auto-Announce Elements" ON
- [ ] Close settings
- [ ] Return to form
- [ ] Press Tab to move to email field
- [ ] **Should hear:** Field announced automatically (without clicking)
- [ ] Press Tab to next field
- [ ] **Should hear:** Next field announced
- [ ] This works WITHOUT mouse hover enabled - it's for Tab navigation users

#### ✅ Mouse Hover Disabled, Other Features Enabled

- [ ] Toggle "Voice on Mouse Hover" OFF
- [ ] Keep "Voice Guide Every Action" ON
- [ ] Move mouse over button → Should NOT hear
- [ ] Click button → SHOULD hear announcement
- [ ] Tab to field → SHOULD hear announcement (if auto-announce is on)

#### ✅ Voice Guidance When All Disabled

- [ ] Toggle "Voice on Mouse Hover" OFF
- [ ] Toggle "Voice Guide Every Action" OFF
- [ ] Toggle "Auto-Announce Elements" OFF
- [ ] Move mouse over button → No voice
- [ ] Click button → No voice announcement
- [ ] Tab through form → No voice announcements
- [ ] Shortcut Alt + P SHOULD still work (shortcuts always work)
- [ ] Other a11y features still work (keyboard nav, skip links)

#### ✅ Cross-Browser Compatibility

Test in each browser:

- [ ] Chrome (Full support expected)
- [ ] Firefox (Full support expected)
- [ ] Edge (Full support expected)
- [ ] Safari (May have limitations, note them)

---

## 🔍 Common Issues & Solutions

### Issue: No Voice When Clicking Buttons

**Diagnosis:**

1. Check browser volume is NOT muted
2. Check "Voice Guide Every Action" is enabled in settings
3. Check browser console for errors (F12 → Console)
4. Expected error level: 0 errors

**Solution:**

```javascript
// In browser console, test Web Speech API:
window.speechSynthesis.speak(new SpeechSynthesisUtterance("test"));
// Should hear "test" spoken

// If nothing, browser doesn't support Web Speech API
// Check browser: Chrome, Firefox, Edge should work
```

### Issue: Voice Is Too Fast or Too Slow

**Solution:**

1. Open settings (Alt + A)
2. Find "Text-to-Speech" section
3. Adjust speed slider
4. Test with button click to verify new speed
5. Slider range: 0.5× (very slow) to 2.0× (very fast)

### Issue: Announcements Are Covering Each Other

**Diagnosis:**

- Two voice announcements playing at same time
- Last one is heard, earlier one is cut off

**Solution:**

1. None needed - this is browser behavior
2. Could improve by adding queue in future
3. Currently: shorter announcements = better

### Issue: Some Fields Not Getting Announced

**Diagnosis:**

1. Check field has proper label
2. Check field has proper ARIA attributes
3. Check field is visible (not hidden CSS)

**Solution:**

```html
<!-- Good labeling (will be announced) -->
<label for="email">Email Address</label>
<input id="email" type="email" required />

<!-- Fallback (if no label) -->
<input type="email" aria-label="Email Address" required />

<!-- Will NOT be announced (no label) -->
<input type="email" placeholder="Enter email" />
```

### Issue: No Voice Feedback When Moving Mouse Over Elements

**Diagnosis:**

1. Check "Voice on Mouse Hover" IS enabled in settings (Alt + A)
2. Check browser volume not muted
3. Check you're moving mouse (not just hovering statically)
4. Check you're hovering OVER interactive elements (buttons, inputs, links)
5. Hovering over plain text doesn't trigger announcement

**Solution:**

```javascript
// In console, verify the setting is on:
const prefs = localStorage.getItem("sas_a11y");
const parsed = JSON.parse(prefs);
console.log("Mouse Hover Guidance enabled:", parsed.mouseHoverGuidance);
```

### Issue: Mouse Hover Only Announces Once Per Element

**This is CORRECT behavior** - No announcement should repeat for same element:

- Hover over button A → "Button: Submit"
- Move to button B → "Button: Cancel"
- Move back to button A → **No announcement** (already heard it)
- Move to button C → "Button: Next"

This prevents repetitive announcements during quick mouse movements.

### Issue: Alt + P/M/N Not Working

**Diagnosis:**

1. Check Alt isn't being captured by browser
2. Check accessibilityContext is properly initialized
3. Check keyboard shortcuts are enabled

**Solution:**

1. Try in different browser
2. Check browser extensions aren't blocking
3. Try different key combo in future version

---

## 📊 Expected Behavior By Page

### Login Page

**Expected Announcements:**

- On load (Alt + P): "Login page. Form with 2 fields: Email, Password"
- Tab to email: "Email, email input, required, example@email.com"
- Tab to password: "Password, password input, required"
- Tab to submit: "Button: Sign In"

### Student Dashboard

**Expected Announcements:**

- On load (Alt + P): "Student Dashboard. Recent lessons. Active quizzes. My progress tabs"
- Alt + M: "Navigation: Dashboard, Courses, Progress, Settings"
- Alt + N: "You can browse courses, view your progress, take quizzes"

### Quiz Page

**Expected Announcements:**

- On load (Alt + P): "Quiz: [Name]. Contains [X] questions"
- Tab through: Question text, answer options, submit/next button
- Click answer: "Option [A/B/C/D] selected"
- Click submit: "Button: Submit Quiz"

### Lesson Page

**Expected Announcements:**

- On load (Alt + P): "Lesson: [Name]. Video, content, and quiz available"
- Tab to video: "Video player with controls"
- Tab to content: "Text content: [beginning of text]"
- Tab to quiz button: "Button: Take Quiz"

---

## 🐛 Debug Mode Activation

### Enable Console Logging

Add to browser console:

```javascript
// Enable debug logging in VoiceGuidedNav
localStorage.setItem("VOICE_GUIDANCE_DEBUG", "true");
location.reload();
```

Expected output in console:

```
[VoiceNav] Initializing voice guidance
[VoiceNav] Found 12 interactive elements on page
[VoiceNav] Announcing page structure...
[VoiceNav] Speaking: "Welcome to Student Dashboard..."
```

### Check Web Speech API Status

```javascript
// In browser console
console.log("Web Speech API:", window.speechSynthesis);
console.log("Available voices:", speechSynthesis.getVoices().length);
console.log("Currently speaking:", speechSynthesis.speaking);
```

### Monitor Element Detection

```javascript
// In browser console
const inputs = document.querySelectorAll("input");
console.log("Found inputs:", inputs.length);
inputs.forEach((input) => {
  console.log(
    `Input: ${input.id} | Label: ${input.name} | Type: ${input.type}`,
  );
});
```

---

## 📈 Performance Metrics

### Expected Performance

| Action                        | Expected Time | Max Acceptable |
| ----------------------------- | ------------- | -------------- |
| Alt + P announcement          | < 500ms       | 1s             |
| Alt + M announcement          | < 300ms       | 800ms          |
| Alt + N announcement          | < 400ms       | 1s             |
| Button click announcement     | < 200ms       | 500ms          |
| Tab to field announcement     | < 300ms       | 500ms          |
| Page load + auto-announcement | < 2s          | 3s             |

### Measuring Performance

```javascript
// In browser console
console.time("voice-announcement");
accessibilityContext.announcePage();
console.timeEnd("voice-announcement");
```

---

## 📝 Test Report Template

```markdown
## Voice Guidance Test Report

**Date:** [Date]
**Tester:** [Name]
**Browser:** [Chrome/Firefox/Edge] v[version]
**OS:** [Windows/Mac/Linux]

### Setup

- [ ] Registered as "Visually Impaired" user
- [ ] Logged in successfully
- [ ] Settings panel opens with Alt + A
- [ ] Voice guidance toggles visible

### Audio Tests

- [ ] Volume is not muted: YES / NO
- [ ] Web Speech API works: YES / NO
- [ ] Voice synthesis available: YES / NO

### Feature Tests

| Feature                 | Status          | Notes     |
| ----------------------- | --------------- | --------- |
| Alt + P                 | ✓ PASS / ✗ FAIL | [Details] |
| Alt + M                 | ✓ PASS / ✗ FAIL | [Details] |
| Alt + N                 | ✓ PASS / ✗ FAIL | [Details] |
| Button announcement     | ✓ PASS / ✗ FAIL | [Details] |
| Form field announcement | ✓ PASS / ✗ FAIL | [Details] |
| Speed adjustment        | ✓ PASS / ✗ FAIL | [Details] |
| Quiz voice guidance     | ✓ PASS / ✗ FAIL | [Details] |

### Issues Found

1. [Issue description]
2. [Issue description]

### Recommendations

1. [Recommendation]
2. [Recommendation]
```

---

## 🎯 Specific Test Scenarios

### Scenario 1: Visually Impaired Student Takes Quiz

**Steps:**

1. Login with "Visually Impaired" option selected
2. Navigate to "Courses" (Tab or Alt + M)
3. Select a course (Tab + Enter)
4. Click "Take Quiz" button
5. Press Alt + P to hear quiz overview
6. Tab through all questions
7. Select answers using Tab + Space/Arrow
8. Tab to Submit button
9. Press Enter to submit

**Expected Result:** Every interactive element should be announced clearly, student never needs to ask for help

### Scenario 2: Keyboard-Only Navigation

**Steps:**

1. Login with "Visually Impaired" option
2. Close mouse/trackpad
3. Use only keyboard to navigate entire site
4. Tab through all pages
5. Complete an assignment
6. Submit quiz

**Expected Result:** All features should be accessible with keyboard alone, voice guidance helps

### Scenario 3: Setting Adjustments

**Steps:**

1. Login as Visually Impaired user
2. Alt + A to open settings
3. Toggle "Voice Guide Every Action" OFF
4. Click buttons → No announcements
5. Toggle ON again
6. Click buttons → Announcements resume
7. Adjust voice speed to 0.5×
8. Click button → Hear slow voice
9. Adjust to 2.0×
10. Click button → Hear fast voice

**Expected Result:** All settings respond immediately and persistence across page reloads

---

## ✅ Acceptance Criteria

Voice guidance system is **READY FOR PRODUCTION** when:

- [ ] ✅ All keyboard shortcuts work (Alt + P/M/N/A/S/H)
- [ ] ✅ Auto-announcements work on form fields (focus)
- [ ] ✅ Auto-announcements work on buttons (click)
- [ ] ✅ Voice speed control affects all voice output
- [ ] ✅ Settings persist across page reloads
- [ ] ✅ Works in Chrome, Firefox, Edge
- [ ] ✅ No JavaScript errors in console
- [ ] ✅ Performance acceptable (< 1s for announcements)
- [ ] ✅ Blind user can complete a quiz without sighted help
- [ ] ✅ Keyboard-only navigation possible throughout
- [ ] ✅ All form fields properly labeled
- [ ] ✅ Modal dialogs announce properly
- [ ] ✅ Error messages are readable
- [ ] ✅ Success messages are announced

---

## 📞 Questions to Ask During Testing

1. Could you complete the quiz without asking for help?
2. Was the voice clear and easy to understand?
3. Was the voice speed comfortable?
4. Did you know what to do at each step?
5. What announcements were most helpful?
6. What announcements seemed unnecessary?
7. What would you change about the voice guidance?
8. Did you use mostly Tab or mostly mouse?
9. Would you recommend this to other students?
10. What else would help you use the platform?

---

## 🚀 Deployment Checklist

Before releasing voice guidance to users:

- [ ] All tests passing in dev environment
- [ ] All tests passing in staging environment
- [ ] Blind user acceptance testing completed
- [ ] Documentation complete and reviewed
- [ ] Training provided for support staff
- [ ] Browser compatibility confirmed (Chrome/Firefox/Edge)
- [ ] Web Speech API fallback strategy in place
- [ ] Performance benchmarks met
- [ ] Analytics tracking enabled
- [ ] Error logging configured
- [ ] Rollback plan documented
- [ ] Users can disable feature if desired

---

**Last Updated:** When voice guidance was implemented  
**Next Review:** After user feedback is collected
