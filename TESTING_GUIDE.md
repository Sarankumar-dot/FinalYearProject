# 🧪 Accessibility Testing Guide

## Quick Start

### 1. Test Registration with Accessibility Options

1. Go to `http://localhost:5173/register`
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Student
3. **NEW**: Select accessibility need:
   - Try "Visually Impaired - Screen Reader Optimized"
4. Click "Create Account"
5. You'll be redirected to student dashboard with pre-configured accessibility settings

### 2. Test Each Accessibility Type

#### Type 1: Standard Access

- Register with "Standard Access" option
- Settings stay in default state
- Manually adjust as needed

#### Type 2: Visually Impaired

- Register with "Visually Impaired" option
- Auto-configured with:
  - ✓ High Contrast theme (you'll see darker colors)
  - ✓ Large font size
  - ✓ Keyboard navigation enabled
  - ✓ Auto text-to-speech enabled
  - ✓ Screen reader mode enabled

#### Type 3: Hearing Impaired

- Register with "Hearing Impaired" option
- Auto-configured with:
  - ✓ Large caption size
  - ✓ Clear visual indicators

---

## 🎹 Test Keyboard Navigation

### Keyboard Shortcuts

After logging in, try these:

| Shortcut        | What it does                 |
| --------------- | ---------------------------- |
| **Alt + A**     | Open Accessibility Panel     |
| **Alt + S**     | Skip to main content         |
| **Alt + H**     | Show help menu               |
| **Tab**         | Navigate to next element     |
| **Shift + Tab** | Navigate to previous element |
| **Enter/Space** | Activate buttons             |

### Full Keyboard Test

1. Don't use mouse
2. Press **Tab** repeatedly - focus should move through all elements
3. Press **Shift+Tab** - should move backward
4. For buttons: press **Enter** or **Space**
5. For dropdowns: use **Arrow Keys**
6. For checkboxes: press **Space**

---

## 🔊 Test Text-to-Speech

1. Open Accessibility Panel (**Alt + A**)
2. Expand "Text-to-Speech" section
3. Set speech speed to 1.0×
4. Close the panel
5. Listen - content should be read aloud
6. Open panel again and try adjusting speed:
   - 0.5× for slow
   - 1.5× for fast
   - 2.0× for very fast

---

## 🎨 Test Visual Themes

1. Open Accessibility Panel (**Alt + A**)
2. Expand "Theme" section
3. Try each option:
   - **Dark**: Default dark background
   - **Light**: Light background
   - **High Contrast**: Maximum contrast (best for visually impaired)
4. Notice colors and contrast change

---

## 🔤 Test Font Size Changes

1. Open Accessibility Panel (**Alt + A**)
2. Expand "Font Size" section
3. Click each size button (A, A, A, A)
4. Watch text size change throughout page
5. Try with different themes to see combination effects

---

## 📝 Test Captions

1. Go to a lesson with video
2. Open Accessibility Panel (**Alt + A**)
3. Expand "Captions & Transcripts" section
4. Try adjusting:
   - **Caption Size**: Small → Medium → Large
   - **Text Colour**: Click color picker
   - **Background**: See color preview
5. Changes apply to video in real-time

---

## 🖱️ Test Focus Management

### Visible Focus Indicators

1. Press **Tab** to navigate
2. You should see a **blue/purple outline** around focused elements
3. In High Contrast mode, focus is more obvious
4. Open Accessibility Panel → Navigation → Select "Enhanced" focus style
5. Notice focus outlines become even more visible

### Focus Trap in Dialog

1. Open Accessibility Panel (Alt + A)
2. Press **Tab** multiple times
3. Focus should loop within the panel, not escape to page behind
4. Close with **Escape** key

---

## ♿ Test with Screen Reader

### Using NVDA (Free, recommended)

1. Download [NVDA](https://www.nvaccess.org/) for Windows
2. Install and start NVDA
3. Navigate to `http://localhost:5173/login`
4. NVDA should announce elements as you Tab through
5. Register with "Visually Impaired" option
6. After login, NVDA will announce content

### What to Listen For

- ✓ Page title announced
- ✓ Form labels read
- ✓ Button purposes clear
- ✓ Error messages announced
- ✓ Navigation structure clear
- ✓ Live regions update announced

---

## 📋 Settings Panel Sections

### Expandable Sections

Each section has a collapse/expand toggle:

1. Click section header
2. Should collapse/expand smoothly
3. Should announce state change ("expanded", "collapsed")

### All Settings Available

From Accessibility Panel, you can adjust:

- ✅ Theme (3 options)
- ✅ Font Size (4 options)
- ✅ Text-to-Speech Speed (0.5× to 2.0×)
- ✅ Caption Size, Color
- ✅ Keyboard Navigation
- ✅ Screen Reader Mode
- ✅ Auto-play TTS
- ✅ Skip Links
- ✅ Focus Indicator Style

---

## 🎯 Test Persistence

### Settings Save

1. Change accessibility settings
2. Refresh page (**F5**)
3. Settings should remain the same ✓
4. Logout and log back in
5. Settings should still be there ✓

### Backend Sync

1. Make changes in panel
2. Settings saved to browser localStorage
3. Settings synced to server for logged-in user
4. Login from different device - settings appear

---

## 🔍 Quick Checklist

- [ ] Can register with accessibility type
- [ ] Keyboard-only navigation works
- [ ] Alt+A opens/closes settings
- [ ] Alt+S skips to main content
- [ ] Alt+H shows help
- [ ] Font sizes change accurately
- [ ] Themes apply correctly
- [ ] TTS works at different speeds
- [ ] Caption settings work
- [ ] Focus indicators visible
- [ ] Settings persist after refresh
- [ ] Settings persist after login
- [ ] Screen reader announces content
- [ ] No keyboard traps
- [ ] Forms fully accessible

---

## 🐛 Troubleshooting

### Text-to-Speech Not Working

- Browser might not have speech synthesis API
- Check if browser is supported (Chrome, Edge, Firefox all support it)
- Test in Settings → Toggle Auto-play off/on

### Settings Not Persisting

- Check browser localStorage:
  - Open DevTools → Application → Local Storage
  - Look for `sas_a11y` key
  - Should contain your settings
- Try clearing storage and re-setting

### Keyboard Navigation Not Working

- Ensure focus is on page (click page first)
- Some elements might not be focusable (check aria-hidden)
- Check if button actually has `onClick` handler

### Screen Reader Not Announcing

- Check element has proper aria-label
- Check aria-live region exists
- Verify screen reader is running
- Allow browser to have focus

---

## 📊 Browser Support

| Feature       | Chrome | Firefox | Safari | Edge |
| ------------- | ------ | ------- | ------ | ---- |
| Keyboard Nav  | ✅     | ✅      | ✅     | ✅   |
| TTS           | ✅     | ✅      | ✅     | ✅   |
| Themes        | ✅     | ✅      | ✅     | ✅   |
| ARIA Labels   | ✅     | ✅      | ✅     | ✅   |
| Focus Visible | ✅     | ✅      | ✅     | ✅   |
| Skip Links    | ✅     | ✅      | ✅     | ✅   |

---

## 🎓 Demo Scenarios

### Scenario 1: Visually Impaired User

1. Register with "Visually Impaired" option
2. Login
3. Take a quiz using only **Tab** key and **Enter**
4. Press **Alt+A** to adjust TTS speed
5. Complete quiz without seeing screen

### Scenario 2: Hearing Impaired User

1. Register with "Hearing Impaired" option
2. Login
3. View a lesson video (with captions)
4. Adjust caption size and colors
5. Take quiz reading all instructions

### Scenario 3: Standard User

1. Register with "Standard" option
2. Login
3. Manually enable high contrast theme
4. Increase font size to large
5. Enable keyboard navigation mode

---

## 📞 Issues to Report

If you find problems, note:

- [ ] Exact steps to reproduce
- [ ] Which browser/version
- [ ] Which accessibility feature involved
- [ ] Expected vs actual behavior
- [ ] Error messages in console

---

## ✅ Testing Complete!

Once you've tested all these features, your accessibility implementation is working correctly.

**Happy testing! 🎉**
