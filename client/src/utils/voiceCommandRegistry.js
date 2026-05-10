/**
 * voiceCommandRegistry.js
 *
 * Defines all voice commands organized by category.
 * Each command has pattern keywords, a handler function, and a description.
 *
 * The handler receives a `context` object with:
 *   navigate, speak, stopSpeech, prefs, update, user, pageContext, api
 *
 * Returns a spoken response string (or null for silent actions).
 */

import api from '../api/axios';

// ─── Command Definitions ────────────────────────────────────────────────────

const COMMANDS = [
  // ═══════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'navigation',
    intent: 'nav_dashboard',
    patterns: ['open dashboard', 'go to dashboard', 'go home', 'dashboard', 'home page', 'return to home', 'go to home'],
    description: 'Navigate to the Dashboard',
    handler: (ctx) => {
      ctx.navigate('/student');
      return 'Opening Dashboard now.';
    },
  },
  {
    category: 'navigation',
    intent: 'nav_courses',
    patterns: ['open courses', 'go to courses', 'show courses', 'browse courses', 'courses', 'view courses'],
    description: 'Navigate to Courses',
    handler: (ctx) => {
      ctx.navigate('/student/courses');
      return 'Opening Courses now.';
    },
  },
  {
    category: 'navigation',
    intent: 'nav_documents',
    patterns: ['open documents', 'go to documents', 'show documents', 'documents'],
    description: 'Navigate to Documents',
    handler: (ctx) => {
      ctx.navigate('/student/documents');
      return 'Opening Documents now.';
    },
  },
  {
    category: 'navigation',
    intent: 'nav_progress',
    patterns: ['show my progress', 'open progress', 'go to progress', 'my progress', 'view progress'],
    description: 'Navigate to My Progress',
    handler: (ctx) => {
      ctx.navigate('/student/progress');
      return 'Opening My Progress now.';
    },
  },
  {
    category: 'navigation',
    intent: 'nav_settings',
    patterns: ['open settings', 'go to settings', 'accessibility settings', 'open accessibility', 'settings'],
    description: 'Navigate to Settings',
    handler: (ctx) => {
      ctx.navigate('/student/settings');
      return 'Opening Settings now.';
    },
  },
  {
    category: 'navigation',
    intent: 'nav_back',
    patterns: ['go back', 'back', 'previous page', 'return', 'go back one page'],
    description: 'Go back to previous page',
    handler: (ctx) => {
      ctx.navigate(-1);
      return 'Going back.';
    },
  },
  {
    category: 'navigation',
    intent: 'nav_logout',
    patterns: ['logout', 'log out', 'sign out', 'sign me out'],
    description: 'Sign out of the platform',
    handler: (ctx) => {
      if (ctx.logout) {
        ctx.logout();
        ctx.navigate('/login');
      }
      return 'Signing you out. Goodbye!';
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PAGE AWARENESS
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'awareness',
    intent: 'where_am_i',
    patterns: ['where am i', 'what page is this', 'current page', 'what page', 'which page'],
    description: 'Announce current page',
    handler: (ctx) => {
      const pageName = ctx.pageContext?.pageName || document.title || 'unknown page';
      return `You are currently on the ${pageName} page.`;
    },
  },
  {
    category: 'awareness',
    intent: 'describe_page',
    patterns: ['what\'s on this page', 'describe page', 'describe this page', 'what is here', 'page overview'],
    description: 'Describe current page contents',
    handler: (ctx) => {
      const main = document.querySelector('main') || document.body;
      const headings = main.querySelectorAll('h1, h2, h3');
      const buttons = main.querySelectorAll('button');
      const links = main.querySelectorAll('a');
      const cards = main.querySelectorAll('.card');

      let desc = `This page contains: `;
      if (headings.length) desc += `${headings.length} section headings. `;
      if (cards.length) desc += `${cards.length} content cards. `;
      if (buttons.length) desc += `${buttons.length} buttons. `;
      if (links.length) desc += `${links.length} links. `;

      // Page-specific info
      if (ctx.pageContext?.lessonData) {
        const l = ctx.pageContext.lessonData;
        desc += `Viewing lesson: ${l.title}. Type: ${l.type}. `;
        if (l.transcript) desc += `Transcript available. `;
      }
      if (ctx.pageContext?.quizState) {
        const q = ctx.pageContext.quizState;
        desc += `Quiz: Question ${q.currentIndex + 1} of ${q.totalQuestions}. `;
      }

      return desc;
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // CONVERSATIONAL — Course queries
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'conversational',
    intent: 'list_courses',
    patterns: ['what courses are available', 'list courses', 'show all courses', 'available courses', 'how many courses', 'what lessons'],
    description: 'List all available courses',
    handler: async (ctx) => {
      try {
        const res = await api.get('/lessons');
        const lessons = res.data;
        if (!lessons || lessons.length === 0) {
          return 'There are no courses available at the moment.';
        }
        const names = lessons.slice(0, 8).map(l => l.title).join(', ');
        return `There are ${lessons.length} courses available. They include: ${names}.${lessons.length > 8 ? ' And more.' : ''}`;
      } catch {
        return 'Sorry, I could not fetch the course list right now.';
      }
    },
  },
  {
    category: 'conversational',
    intent: 'open_course_by_name',
    patterns: ['open the', 'open course', 'go to lesson', 'start lesson', 'open lesson', 'open '],
    description: 'Open a specific course by name',
    handler: async (ctx, params) => {
      try {
        const res = await api.get('/lessons');
        const lessons = res.data;
        let query = params?.remainder || '';
        // If query still has "open" due to some match, remove it
        if (query.startsWith('open ')) query = query.replace('open ', '');
        
        if (!query) return 'Please say the name of the course you want to open.';

        // Fuzzy match
        const match = lessons.find(l =>
          l.title.toLowerCase().includes(query.toLowerCase()) ||
          query.toLowerCase().includes(l.title.toLowerCase())
        );

        if (match) {
          ctx.navigate(`/student/lesson/${match._id}`);
          return `Opening ${match.title}.`;
        }
        return `No matching course found for "${query}". Say "what courses are available" to hear the list.`;
      } catch {
        return 'Sorry, I could not search for courses right now.';
      }
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // LEARNING / READING
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'learning',
    intent: 'read_lesson',
    patterns: ['read lesson', 'read content', 'read this', 'read aloud', 'start reading', 'read the lesson', 'read text', 'read page', 'read the page'],
    description: 'Read the current lesson content aloud',
    handler: (ctx) => {
      const lesson = ctx.pageContext?.lessonData;
      if (!lesson) return 'No lesson is currently open. Navigate to a lesson first.';

      const text = lesson.textContent || lesson.transcript || lesson.description;
      if (!text) return 'This lesson has no text content to read.';

      ctx.speak(text);
      return 'Reading lesson content now.';
    },
  },
  {
    category: 'learning',
    intent: 'pause_reading',
    patterns: ['pause reading', 'stop reading', 'pause', 'stop', 'be quiet', 'silence', 'shut up', 'stop talking'],
    description: 'Pause or stop the current reading',
    handler: (ctx) => {
      ctx.stopSpeech();
      return null; // Silent — don't speak after stopping
    },
  },
  {
    category: 'learning',
    intent: 'resume_reading',
    patterns: ['resume', 'continue reading', 'resume reading', 'continue', 'keep reading'],
    description: 'Resume reading from where it stopped',
    handler: (ctx) => {
      if (ctx.lastTTSText) {
        ctx.speak(ctx.lastTTSText);
        return 'Resuming reading.';
      }
      return 'No previous reading to resume.';
    },
  },
  {
    category: 'learning',
    intent: 'repeat',
    patterns: ['repeat', 'say that again', 'repeat last', 'what did you say', 'repeat that', 'again'],
    description: 'Repeat the last spoken response',
    handler: (ctx) => {
      if (ctx.lastTTSText) {
        return ctx.lastTTSText;
      }
      return 'Nothing to repeat.';
    },
  },
  {
    category: 'learning',
    intent: 'increase_speed',
    patterns: ['increase voice speed', 'faster', 'speed up', 'talk faster', 'increase speed', 'faster reading'],
    description: 'Increase text-to-speech speed',
    handler: (ctx) => {
      const newSpeed = Math.min(2.0, (ctx.prefs.ttsSpeed || 1.0) + 0.2);
      ctx.update('ttsSpeed', Math.round(newSpeed * 10) / 10);
      return `Voice speed increased to ${newSpeed.toFixed(1)}x.`;
    },
  },
  {
    category: 'learning',
    intent: 'decrease_speed',
    patterns: ['slow down', 'decrease speed', 'slower', 'talk slower', 'decrease voice speed', 'slow down reading'],
    description: 'Decrease text-to-speech speed',
    handler: (ctx) => {
      const newSpeed = Math.max(0.5, (ctx.prefs.ttsSpeed || 1.0) - 0.2);
      ctx.update('ttsSpeed', Math.round(newSpeed * 10) / 10);
      return `Voice speed decreased to ${newSpeed.toFixed(1)}x.`;
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // VIDEO CONTROLS
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'video',
    intent: 'play_video',
    patterns: ['play video', 'start video', 'play the video', 'resume video'],
    description: 'Play the video',
    handler: (ctx) => {
      const v = ctx.pageContext?.videoRef?.current;
      if (!v) return 'No video is available on this page.';
      v.play().catch(() => {});
      return 'Video playing.';
    },
  },
  {
    category: 'video',
    intent: 'pause_video',
    patterns: ['pause video', 'pause the video'],
    description: 'Pause the video',
    handler: (ctx) => {
      const v = ctx.pageContext?.videoRef?.current;
      if (!v) return 'No video is available on this page.';
      v.pause();
      return 'Video paused successfully.';
    },
  },
  {
    category: 'video',
    intent: 'stop_video',
    patterns: ['stop video', 'stop the video'],
    description: 'Stop the video and reset to beginning',
    handler: (ctx) => {
      const v = ctx.pageContext?.videoRef?.current;
      if (!v) return 'No video is available on this page.';
      v.pause();
      v.currentTime = 0;
      return 'Video stopped.';
    },
  },
  {
    category: 'video',
    intent: 'mute_video',
    patterns: ['mute video', 'mute', 'unmute video', 'unmute'],
    description: 'Toggle video mute',
    handler: (ctx) => {
      const v = ctx.pageContext?.videoRef?.current;
      if (!v) return 'No video is available on this page.';
      v.muted = !v.muted;
      return v.muted ? 'Video muted.' : 'Video unmuted.';
    },
  },
  {
    category: 'video',
    intent: 'volume_up',
    patterns: ['increase volume', 'volume up', 'louder'],
    description: 'Increase video volume',
    handler: (ctx) => {
      const v = ctx.pageContext?.videoRef?.current;
      if (!v) return 'No video is available on this page.';
      v.volume = Math.min(1, v.volume + 0.2);
      return `Volume increased to ${Math.round(v.volume * 100)} percent.`;
    },
  },
  {
    category: 'video',
    intent: 'volume_down',
    patterns: ['decrease volume', 'volume down', 'quieter', 'lower volume'],
    description: 'Decrease video volume',
    handler: (ctx) => {
      const v = ctx.pageContext?.videoRef?.current;
      if (!v) return 'No video is available on this page.';
      v.volume = Math.max(0, v.volume - 0.2);
      return `Volume decreased to ${Math.round(v.volume * 100)} percent.`;
    },
  },
  {
    category: 'video',
    intent: 'forward_video',
    patterns: ['forward video', 'skip forward', 'forward 10 seconds', 'fast forward', 'skip ahead'],
    description: 'Skip forward 10 seconds',
    handler: (ctx) => {
      const v = ctx.pageContext?.videoRef?.current;
      if (!v) return 'No video is available on this page.';
      v.currentTime = Math.min(v.duration, v.currentTime + 10);
      return 'Skipped forward 10 seconds.';
    },
  },
  {
    category: 'video',
    intent: 'rewind_video',
    patterns: ['rewind video', 'go back 10 seconds', 'rewind', 'skip back', 'backward'],
    description: 'Rewind 10 seconds',
    handler: (ctx) => {
      const v = ctx.pageContext?.videoRef?.current;
      if (!v) return 'No video is available on this page.';
      v.currentTime = Math.max(0, v.currentTime - 10);
      return 'Rewound 10 seconds.';
    },
  },
  {
    category: 'video',
    intent: 'replay_video',
    patterns: ['replay video', 'restart video', 'play from start', 'play again'],
    description: 'Replay the video from the beginning',
    handler: (ctx) => {
      const v = ctx.pageContext?.videoRef?.current;
      if (!v) return 'No video is available on this page.';
      v.currentTime = 0;
      v.play().catch(() => {});
      return 'Replaying video from the beginning.';
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // QUIZ
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'quiz',
    intent: 'start_quiz',
    patterns: ['start quiz', 'open quiz', 'begin quiz', 'take quiz'],
    description: 'Start the quiz for the current lesson',
    handler: (ctx) => {
      // Try to click quiz CTA button on the page
      const quizBtn = document.querySelector('a[href*="/student/quiz/"]');
      if (quizBtn) {
        quizBtn.click();
        return 'Starting quiz now.';
      }
      return 'No quiz is available on this page.';
    },
  },
  {
    category: 'quiz',
    intent: 'read_question',
    patterns: ['read question', 'what is the question', 'read current question', 'question'],
    description: 'Read the current quiz question aloud',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (!qs?.readQuestion) return 'No quiz is currently active.';
      qs.readQuestion();
      return null; // The readQuestion function handles TTS
    },
  },
  {
    category: 'quiz',
    intent: 'select_option_a',
    patterns: ['option a', 'select a', 'answer a', 'choose a', 'first option', 'a'],
    description: 'Select option A',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (!qs?.selectOption) return 'No quiz is currently active.';
      const result = qs.selectOption(0);
      return result ? `Selected option A: ${result}.` : 'Option A is not available.';
    },
  },
  {
    category: 'quiz',
    intent: 'select_option_b',
    patterns: ['option b', 'select b', 'answer b', 'choose b', 'second option', 'b'],
    description: 'Select option B',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (!qs?.selectOption) return 'No quiz is currently active.';
      const result = qs.selectOption(1);
      return result ? `Selected option B: ${result}.` : 'Option B is not available.';
    },
  },
  {
    category: 'quiz',
    intent: 'select_option_c',
    patterns: ['option c', 'select c', 'answer c', 'choose c', 'third option', 'c'],
    description: 'Select option C',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (!qs?.selectOption) return 'No quiz is currently active.';
      const result = qs.selectOption(2);
      return result ? `Selected option C: ${result}.` : 'Option C is not available.';
    },
  },
  {
    category: 'quiz',
    intent: 'select_option_d',
    patterns: ['option d', 'select d', 'answer d', 'choose d', 'fourth option', 'd'],
    description: 'Select option D',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (!qs?.selectOption) return 'No quiz is currently active.';
      const result = qs.selectOption(3);
      return result ? `Selected option D: ${result}.` : 'Option D is not available.';
    },
  },
  {
    category: 'quiz',
    intent: 'select_true',
    patterns: ['true', 'select true', 'answer true'],
    description: 'Select True for true/false question',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (!qs?.selectTrueFalse) return 'No quiz is currently active.';
      qs.selectTrueFalse('True');
      return 'Selected True.';
    },
  },
  {
    category: 'quiz',
    intent: 'select_false',
    patterns: ['false', 'select false', 'answer false'],
    description: 'Select False for true/false question',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (!qs?.selectTrueFalse) return 'No quiz is currently active.';
      qs.selectTrueFalse('False');
      return 'Selected False.';
    },
  },
  {
    category: 'quiz',
    intent: 'next_question',
    patterns: ['next question', 'next', 'go to next', 'skip question'],
    description: 'Go to the next question',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (qs?.goNext) { qs.goNext(); return 'Moving to next question.'; }
      // Fallback: try clicking next button
      const btn = document.getElementById('btn-next');
      if (btn) { btn.click(); return 'Moving to next.'; }
      return 'Cannot go to next question.';
    },
  },
  {
    category: 'quiz',
    intent: 'prev_question',
    patterns: ['previous question', 'previous', 'go back one question', 'go to previous'],
    description: 'Go to the previous question',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (qs?.goPrev) { qs.goPrev(); return 'Going to previous question.'; }
      const btn = document.getElementById('btn-prev');
      if (btn) { btn.click(); return 'Going back.'; }
      return 'Cannot go to previous question.';
    },
  },
  {
    category: 'quiz',
    intent: 'submit_quiz',
    patterns: ['submit quiz', 'finish quiz', 'submit answers', 'submit', 'done with quiz', 'finish'],
    description: 'Submit the quiz',
    handler: (ctx) => {
      const qs = ctx.pageContext?.quizState;
      if (qs?.submitQuiz) { qs.submitQuiz(); return 'Submitting quiz now.'; }
      return 'No quiz to submit.';
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'settings',
    intent: 'sleep',
    patterns: ['go to sleep', 'stop listening', 'sleep mode'],
    description: 'Put voice assistant to sleep',
    handler: (ctx) => {
      if (ctx.engine) {
        ctx.engine.wakeWordActive = false;
        ctx.engine._emitStatus('waiting-wake-word');
      }
      return 'Going to sleep. Say Hey Companion to wake me up.';
    },
  },
  {
    category: 'settings',
    intent: 'dark_mode',
    patterns: ['dark mode', 'switch to dark', 'dark theme'],
    description: 'Switch to dark theme',
    handler: (ctx) => {
      ctx.update('theme', 'dark');
      return 'Switched to dark mode.';
    },
  },
  {
    category: 'settings',
    intent: 'light_mode',
    patterns: ['light mode', 'switch to light', 'light theme'],
    description: 'Switch to light theme',
    handler: (ctx) => {
      ctx.update('theme', 'light');
      return 'Switched to light mode.';
    },
  },
  {
    category: 'settings',
    intent: 'high_contrast',
    patterns: ['high contrast', 'high contrast mode', 'contrast mode'],
    description: 'Switch to high contrast theme',
    handler: (ctx) => {
      ctx.update('theme', 'high-contrast');
      return 'Switched to high contrast mode.';
    },
  },
  {
    category: 'settings',
    intent: 'increase_font',
    patterns: ['increase font', 'bigger text', 'larger font', 'increase text size', 'make text bigger'],
    description: 'Increase font size',
    handler: (ctx) => {
      const sizes = ['small', 'medium', 'large', 'xlarge'];
      const idx = sizes.indexOf(ctx.prefs.fontSize || 'medium');
      if (idx < sizes.length - 1) {
        ctx.update('fontSize', sizes[idx + 1]);
        return `Font size increased to ${sizes[idx + 1]}.`;
      }
      return 'Font size is already at maximum.';
    },
  },
  {
    category: 'settings',
    intent: 'decrease_font',
    patterns: ['decrease font', 'smaller text', 'smaller font', 'decrease text size', 'make text smaller'],
    description: 'Decrease font size',
    handler: (ctx) => {
      const sizes = ['small', 'medium', 'large', 'xlarge'];
      const idx = sizes.indexOf(ctx.prefs.fontSize || 'medium');
      if (idx > 0) {
        ctx.update('fontSize', sizes[idx - 1]);
        return `Font size decreased to ${sizes[idx - 1]}.`;
      }
      return 'Font size is already at minimum.';
    },
  },
  {
    category: 'settings',
    intent: 'mic_off',
    patterns: ['turn off microphone', 'disable voice', 'mic off', 'turn off voice control'],
    description: 'Disable voice control',
    handler: (ctx) => {
      if (ctx.disableVoiceControl) ctx.disableVoiceControl();
      return 'Voice control disabled. Press Alt+V to re-enable.';
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // HELP
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'help',
    intent: 'help',
    patterns: ['help', 'what can i do', 'what commands', 'list commands', 'what can you do', 'help me'],
    description: 'List available voice commands',
    handler: (ctx) => {
      let response = `Here are all the commands you can use. `;
      
      response += `Navigation: Open Dashboard, Open Courses, Open Documents, Show My Progress, Open Settings, Go Back, and Logout. `;
      
      response += `General: Where am I, Describe page, What time is it, What courses are available, and Open followed by a course name. `;
      
      response += `Reading: Read lesson, Pause reading, Resume reading, Repeat, Increase voice speed, and Decrease voice speed. `;

      response += `Settings: Dark mode, Light mode, High contrast, Increase font, Decrease font, Turn off microphone, and Go to sleep. `;

      if (ctx.pageContext?.videoRef) {
        response += `Video Controls: Play video, Pause video, Stop video, Mute video, Increase volume, Decrease volume, Skip forward, Rewind video, and Replay video. `;
      }
      if (ctx.pageContext?.quizState || ctx.pageContext?.lessonData) {
        response += `Quiz Controls: Start quiz, Read question, Option A, Option B, Option C, Option D, True, False, Next question, Previous question, and Submit quiz. `;
      }

      return response;
    },
  },

  // ═══════════════════════════════════════════════════════════════════════
  // TIME
  // ═══════════════════════════════════════════════════════════════════════
  {
    category: 'conversational',
    intent: 'what_time',
    patterns: ['what time is it', 'tell me the time', 'current time', 'time'],
    description: 'Tell the current time',
    handler: () => {
      const now = new Date();
      return `The current time is ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    },
  },
];

// ─── Registry Class ─────────────────────────────────────────────────────────

export class VoiceCommandRegistry {
  constructor() {
    this.commands = COMMANDS;
  }

  /**
   * Find the best matching command for a given transcript.
   * Returns { intent, handler, response, params } or null.
   */
  findMatch(transcript) {
    const text = transcript.toLowerCase().trim();
    let bestMatch = null;
    let bestScore = 0;

    for (const cmd of this.commands) {
      for (const pattern of cmd.patterns) {
        const score = this._matchScore(text, pattern);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = cmd;
        }
      }
    }

    if (bestMatch && bestScore >= 0.6) {
      // Extract remainder (for conversational commands like "open the AI course")
      let remainder = text;
      for (const pattern of bestMatch.patterns) {
        remainder = remainder.replace(pattern, '').trim();
      }

      return {
        intent: bestMatch.intent,
        handler: bestMatch.handler,
        category: bestMatch.category,
        description: bestMatch.description,
        params: { remainder, rawText: text },
      };
    }

    return null;
  }

  /**
   * Get all commands grouped by category.
   */
  getCommandsByCategory() {
    const categories = {};
    for (const cmd of this.commands) {
      if (!categories[cmd.category]) categories[cmd.category] = [];
      categories[cmd.category].push(cmd);
    }
    return categories;
  }

  /**
   * Simple pattern matching score (0-1).
   */
  _matchScore(text, pattern) {
    // Exact match
    if (text === pattern) return 1.0;
    // Contains pattern
    if (text.includes(pattern)) return 0.9;
    // Pattern contains text
    if (pattern.includes(text)) return 0.75;
    // Word-level overlap
    const textWords = text.split(' ');
    const patternWords = pattern.split(' ');
    const matches = patternWords.filter(pw => textWords.includes(pw));
    if (matches.length > 0 && matches.length >= patternWords.length * 0.5) {
      return 0.6 + (matches.length / patternWords.length) * 0.3;
    }
    return 0;
  }
}

export default VoiceCommandRegistry;
