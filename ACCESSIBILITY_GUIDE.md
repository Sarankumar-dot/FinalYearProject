# Accessibility Features Guide

## 🎯 Overview

This platform is built with comprehensive accessibility support to ensure **visually impaired**, **hearing impaired**, and all students can access educational content effectively.

---

## 👁️ For Visually Impaired Users

### Registration

When creating your account, **select "Visually Impaired - Screen Reader Optimized"** during signup. This will automatically enable:

- ✓ High contrast theme
- ✓ Larger font size (Large)
- ✓ Keyboard navigation mode
- ✓ Screen reader optimizations
- ✓ Enhanced text-to-speech with adjusted speed

### Screen Reader Support

- **Full semantic HTML structure** with ARIA labels
- **Live region announcements** for dynamic content updates
- **Alt text** on all images and icons
- **Descriptive link text** - links describe their purpose
- **Form labels** properly associated with inputs
- **Navigation landmarks** (main, nav, aside, footer roles)

### Keyboard Navigation

Navigate the entire website using only your keyboard:

| Shortcut        | Action                             |
| --------------- | ---------------------------------- |
| **Tab**         | Move to next focusable element     |
| **Shift + Tab** | Move to previous focusable element |
| **Alt + A**     | Open accessibility settings        |
| **Alt + S**     | Skip to main content               |
| **Alt + H**     | Show keyboard shortcuts help       |
| **Enter/Space** | Activate buttons and links         |
| **Arrow Keys**  | Navigate within menus and sliders  |

### Text-to-Speech

- **Auto-play on page load** - content is read aloud automatically
- **Adjustable speech speed** - control reading speed from 0.5× to 2.0×
- **Per-lesson TTS** - play audio on demand
- **All content spoken** - lessons, quizzes, navigation elements

### Accessibility Settings Panel

Press **Alt + A** to access the accessibility settings panel where you can:

- Change visual theme (Dark, Light, High Contrast)
- Adjust font size (Small, Medium, Large, X-Large)
- Control TTS speech speed
- Enable/disable features as needed
- Customize focus indicator style
- Enable skip links

---

## 👂 For Hearing Impaired Users

### Registration

Select **"Hearing Impaired - Captions & Transcripts"** during signup. This automatically enables:

- ✓ Large caption size
- ✓ Enhanced visual indicators
- ✓ Full transcripts for all video content

### Captions & Transcripts

#### Video Lessons

- **Always-on closed captions** for all video content
- **Customizable caption appearance**:
  - Font size: Small, Medium, Large
  - Text color: Adjustable
  - Background color: Adjustable
- **Speaker identification** - know who is speaking
- **Sound descriptions** - [doorbell rings], [music plays], [footsteps]

#### Quizzes & Assessments

- **Text-based questions** with full descriptions
- **No audio-only content** - all information available in text
- **Visual feedback** for correct/incorrect answers
- **Extended time options** for reading

### Customization

Access the **Captions & Transcripts** section in accessibility settings to adjust:

- Caption size
- Text color
- Background contrast
- Display position

---

## ♿ Universal Accessibility Features

### Color & Contrast

- **High Contrast Mode** - maximum visibility
- **WCAG AAA compliance** - meets highest accessibility standards
- **Multiple themes** - Choose what works best for you

### Focus Management

- **Clear focus indicators** - always know which element is selected
- **Enhanced focus mode** - larger, more visible focus outlines
- **Focus trapping** dialogs - keyboard stays within modal windows
- **Logical tab order** - navigation follows visual layout

### Motion & Animation

- **Respects prefers-reduced-motion** - removes animations if requested
- **Smooth scrolling options** - control animation speed
- **No auto-playing videos** - you control when content plays

### Forms & Input

- **Clear labels** on all form fields
- **Error messages** that explain what went wrong
- **Input validation** with helpful hints
- **Auto-complete support** for email/username

### Skip Links

- **Skip to main content** - bypass repetitive navigation
- **Skip to navigation** - jump to site menu
- **Skip to footer** - access footer links quickly

---

## 📟 Separate Login Options

### Standard Access

Default login for users without specific accessibility needs. All features still available in settings.

### Visually Impaired Login

Specialized login path with pre-configured settings optimized for screen reader users and keyboard navigation.

### Hearing Impaired Login

Specialized login path with pre-configured settings optimized for caption and transcript viewing.

> **Note**: You can change your accessibility profile anytime in settings (Alt + A).

---

## ⚙️ Accessibility Settings Panel

Access via **Alt + A** after logging in. Contains:

### Display Settings

- **Theme**: Dark, Light, High Contrast
- **Font Size**: 4 levels from Small to X-Large
- **Focus Indicator Style**: Standard or Enhanced

### Sound Settings

- **Text-to-Speech Speed**: 0.5× to 2.0×
- **Auto-play TTS**: Toggle auto speech on load
- **Screen Reader Mode**: Optimize for screen readers

### Caption Settings

- **Caption Size**: Small, Medium, Large
- **Text Color**: Adjustable
- **Background Color**: Adjustable

### Navigation

- **Enhanced Keyboard Navigation**: Power user mode
- **Skip Links**: Show bypass links
- **Screen Reader Mode**: Specialized for screen readers

---

## 🧪 Testing

### Tested With

- **Screen Readers**: NVDA, JAWS, VoiceOver
- **Magnification**: ZoomText, built-in magnifiers
- **Keyboard Only**: Complete navigation possible
- **High Contrast**: Windows High Contrast mode
- **Color Blind**: Deuteranopia, Protanopia, Tritanopia

### WCAG Compliance

- **Level A**: Minimum compliance
- **Level AA**: Enhanced compliance ✓ TARGET
- **Level AAA**: Maximum compliance (partial)

---

## 🚀 Getting Started

1. **Create Account**
   - Visit /register
   - Enter your details
   - Select your **accessibility needs**
   - Choose your role (Student, Teacher, Admin)

2. **Login**
   - Visit /login
   - Enter credentials
   - Settings auto-apply based on your preference

3. **Customize**
   - Press **Alt + A** anytime
   - Adjust settings to your preference
   - Changes save automatically

4. **Learn**
   - Browse courses
   - Watch lessons with captions
   - Complete assessments
   - Track progress

---

## 📞 Support & Feedback

Accessibility is a continuous improvement. If you encounter:

- **Issues with screen readers** - report the specific reader and version
- **Keyboard navigation problems** - describe the steps to reproduce
- **Visual accessibility issues** - specify the theme/size used
- **Caption problems** - note the video or lesson name

Report issues through the [Feedback Form] in settings.

---

## 🔗 Additional Resources

- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Keyboard Only Navigation Guide](https://www.a11y-101.com/design/keyboard-navigation)
- [Caption Standards](https://www.3playmedia.com/blog/captioning-standards-guidelines/)

---

## ✨ Features Summary Table

| Feature               | Visually Impaired | Hearing Impaired | All Users |
| --------------------- | ----------------- | ---------------- | --------- |
| Screen Reader Support | ✓                 | —                | ✓         |
| Keyboard Navigation   | ✓                 | —                | ✓         |
| Text-to-Speech        | ✓                 | —                | ✓         |
| Captions              | —                 | ✓                | ✓         |
| Transcripts           | —                 | ✓                | ✓         |
| High Contrast         | ✓                 | ✓                | ✓         |
| Font Size Control     | ✓                 | ✓                | ✓         |
| Skip Links            | ✓                 | —                | ✓         |
| Focus Indicators      | ✓                 | —                | ✓         |
| Reduced Motion        | ✓                 | ✓                | ✓         |

---

**Last Updated**: April 2026  
**Platform**: Sight & Sign - Accessible Learning Platform  
**Accessibility Target**: WCAG 2.1 Level AA
