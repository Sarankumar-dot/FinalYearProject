# 🧪 Voice Guidance Testing Guide

## Quick Test Checklist

After the voice auto-enable fix, use this guide to verify everything is working.

---

## ✅ Step 1: Browser DevTools Console Test

### Opening DevTools

- **Windows/Linux:** Press `F12`
- **Mac:** Press `Cmd + Option + I`
- Go to **Console** tab

### Checking Console Logs (After Login as Visually-Impaired)

You should see these messages in the console:

```
✓ Visually impaired user detected, enabling voice features
🎙️ Initializing voice guidance with settings: {
  voiceGuidedNav: true,
  autoAnnounceElements: true,
  mouseHoverGuidance: true,
  screenReaderMode: true,
  ttsSpeed: 1
}
✓ Setting up auto-guidance listeners
```

**If you DON'T see these messages:**

- Check if you're logged in (check top-right username)
- Check if you selected "Visually Impaired" during registration
- The settings might not be saved correctly in the backend

---

## ✅ Step 2: Test Web Speech API Availability

Copy this into your browser console:

```javascript
if (window.speechSynthesis) {
  console.log("✅ Web Speech API is AVAILABLE");
  console.log("Voices available:", window.speechSynthesis.getVoices().length);
} else {
  console.log("❌ Web Speech API NOT available - check browser compatibility");
}
```

**Expected Output:**

```
✅ Web Speech API is AVAILABLE
Voices available: 10-30
```

**If NOT available:**

- ❌ Chrome: Should work (check if updated)
- ❌ Firefox: Should work
- ❌ Edge: Should work
- ❌ Safari: Limited support
- ❌ Opera: Limited support

---

## ✅ Step 3: Test Voice Output

Copy this into your browser console:

```javascript
const test = new SpeechSynthesisUtterance(
  "Test message. If you hear this, voice is working.",
);
test.rate = 1.0;
window.speechSynthesis.speak(test);
```

**Expected Result:**

- 🔊 You should **HEAR** a voice saying the message
- Check your speaker volume is not muted
- Check system volume is not muted

---

## ✅ Step 4: Test Mouse Hover Announcement

### Manual Test

1. Open DevTools Console (F12 → Console tab)
2. Login as visually-impaired student
3. Move your mouse over any button on the page
4. Watch the console for this message:

```
🖱️ Announcing hovered element: [ELEMENT_NAME]
```

**Examples of messages you should see:**

- 🖱️ Announcing hovered element: Button: Next
- 🖱️ Announcing hovered element: Email, text input
- 🖱️ Announcing hovered element: Link: Dashboard

**If you HEAR a voice announcement:**

- ✅ Mouse hover voice is working!

**If DevTools shows the log but you DON'T hear the voice:**

- Speaker might be muted
- System volume might be muted
- Browser tab might be muted (check browser tab for icon)

---

## ✅ Step 5: Test Keyboard Navigation

### Manual Test

1. Login as visually-impaired student
2. Press `Tab` to move focus to the next element
3. You should **HEAR** a voice announcing the element
4. Check console for:

```
🎙️ Announcing focused element: [ELEMENT_NAME]
```

**If it doesn't work:**

- Check console for any error messages
- Make sure `voiceGuidedNav: true` in localStorage
- Try pressing `Alt+N` to toggle the feature

---

## 🧪 Automated Testing with Test Utility

We created a test utility file at `client/src/utils/testVoice.js`.

### Option 1: Run via Browser Console

Once the app loads, paste this in the console:

```javascript
// Run full diagnostic
VoiceTest.runFullVoiceTest();
```

This will:

1. Check if user is logged in as visually-impaired
2. Check if voice settings are enabled
3. Test Web Speech API availability
4. Provide a summary of what's working/not working

### Option 2: Run Individual Tests

```javascript
// Check current user
VoiceTest.checkUserType();

// Check accessibility settings in localStorage
VoiceTest.testVoiceSettings();

// Test Web Speech API
VoiceTest.testWebSpeechAPI();

// Create test elements for hover/keyboard testing
VoiceTest.testMouseHoverVoice();
VoiceTest.testKeyboardVoice();
```

---

## 🔧 Troubleshooting

### "No voice at all"

**Check these in order:**

1. **Is the user actually visually-impaired?**

   ```javascript
   const user = JSON.parse(localStorage.getItem("sas_user"));
   console.log(user.accessibilityType); // Should be "visually-impaired"
   ```

2. **Are the settings enabled?**

   ```javascript
   const prefs = JSON.parse(localStorage.getItem("sas_a11y"));
   console.log({
     voiceGuidedNav: prefs.voiceGuidedNav, // Should be true
     autoAnnounceElements: prefs.autoAnnounceElements, // Should be true
     mouseHoverGuidance: prefs.mouseHoverGuidance, // Should be true
   });
   ```

3. **Is Web Speech API available?**

   ```javascript
   console.log(!!window.speechSynthesis); // Should be true
   ```

4. **Is browser volume muted?**
   - Check system volume (bottom-right on Windows/Mac)
   - Check browser volume (speaker icon on browser tab)
   - Check application volume (some systems have per-app volume)

5. **Check browser compatibility:**
   - ✅ Chrome/Chromium (best)
   - ✅ Firefox (good)
   - ✅ Edge (good)
   - ⚠️ Safari (limited)
   - ❌ Opera (limited)

### "Console shows logs but no voice"

**This usually means:**

- Volume is muted somewhere
- TTS speed too high (check `prefs.ttsSpeed`)
- Voice language mismatch

**Fix:**

```javascript
// Test with explicit settings
const utterance = new SpeechSynthesisUtterance("Test message");
utterance.rate = 0.8; // Slower than default
utterance.volume = 1.0; // 100% volume
utterance.pitch = 1.0;
window.speechSynthesis.speak(utterance);
```

### "Console shows no logs but should be working"

**This usually means:**

- User accessibility type not saved correctly
- User logged in before fix was deployed
- Browser cache not cleared

**Fix:**

1. Open DevTools: F12
2. Application tab → Storage → Clear all
3. Refresh page: Ctrl+Shift+R (hard refresh)
4. Login again as visually-impaired student
5. Check console for initialization logs

### "Works on desktop but not mobile"

**Note:** Mobile browsers have limited Web Speech API support

- ✅ Chrome Mobile (good)
- ✅ Firefox Mobile (good)
- ⚠️ Safari Mobile (limited)
- Mobile keyboard navigation may be limited due to touch interface

---

## 📊 Expected Behavior After Fix

### Login as Visually-Impaired Student

**Immediately (on page load):**

- Console shows: "✓ Visually impaired user detected, enabling voice features"
- Settings auto-loaded from localStorage with all voice features enabled

### Keyboard Navigation

**When pressing Tab:**

- Hear voice announcement of focused element
- Console shows: "🎙️ Announcing focused element: [NAME]"

### Mouse Hover

**When moving mouse over buttons/links:**

- Hear brief voice announcement
- Console shows: "🖱️ Announcing hovered element: [NAME]"

**When clicking:**

- Brief confirmation sound (optional, depends on settings)

---

## 🚀 Final Verification

Once all tests pass, the system is working correctly. You can:

1. ✅ Close DevTools (F12)
2. ✅ Navigate the app normally
3. ✅ Hover over buttons/fields and hear announcements
4. ✅ Use Tab to navigate and hear element names
5. ✅ Use Alt+P/M/N/V shortcuts for quick navigation

---

## 📝 Reporting Issues

If voice still doesn't work after all checks:

1. Run the full diagnostic:

   ```javascript
   VoiceTest.runFullVoiceTest();
   ```

2. Screenshot the console output

3. Check:
   - Browser and version
   - Operating system
   - User accessibility type selected during registration
   - Whether same user works on different browser

4. Report with:
   - Console output screenshot
   - Browser/OS info
   - Steps to reproduce
   - Expected vs actual behavior
