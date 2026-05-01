/**
 * signDictionary.js
 * Client-side sign language dictionary with A-Z fingerspelling poses
 * and backend API integration for word-level animations.
 */
import api from '../api/axios';

// ── Default pose (neutral standing position) ────────────────────────────────
const NEUTRAL_POSE = [
  {x:0.5,y:0.18},{x:0.5,y:0.2},{x:0.5,y:0.2},{x:0.5,y:0.2},{x:0.5,y:0.2},
  {x:0.48,y:0.2},{x:0.52,y:0.2},{x:0.48,y:0.22},{x:0.52,y:0.22},
  {x:0.48,y:0.22},{x:0.52,y:0.22},{x:0.42,y:0.3},{x:0.58,y:0.3},
  {x:0.38,y:0.42},{x:0.62,y:0.42},{x:0.35,y:0.54},{x:0.65,y:0.54},
  {x:0.35,y:0.55},{x:0.65,y:0.55},{x:0.35,y:0.56},{x:0.65,y:0.56},
  {x:0.35,y:0.55},{x:0.65,y:0.55},{x:0.45,y:0.62},{x:0.55,y:0.62},
];

// ── Closed fist base (used for many letters) ────────────────────────────────
function makeFist(cx, cy, s) {
  return [
    {x:cx,y:cy},                                                    // 0 wrist
    {x:cx-2*s,y:cy-3*s},{x:cx-3*s,y:cy-5*s},{x:cx-2*s,y:cy-6*s},{x:cx-1*s,y:cy-5*s}, // thumb
    {x:cx-1*s,y:cy-4*s},{x:cx-1*s,y:cy-5*s},{x:cx-1*s,y:cy-4.5*s},{x:cx-0.5*s,y:cy-4*s}, // index
    {x:cx,y:cy-4*s},{x:cx,y:cy-5*s},{x:cx,y:cy-4.5*s},{x:cx+0.2*s,y:cy-4*s},             // middle
    {x:cx+1*s,y:cy-4*s},{x:cx+1*s,y:cy-5*s},{x:cx+1*s,y:cy-4.5*s},{x:cx+1.2*s,y:cy-4*s}, // ring
    {x:cx+2*s,y:cy-3.5*s},{x:cx+2*s,y:cy-4.5*s},{x:cx+2*s,y:cy-4*s},{x:cx+2.2*s,y:cy-3.5*s}, // pinky
  ];
}

// ── ASL A-Z Fingerspelling Hand Poses ───────────────────────────────────────
// Each returns 21 landmark points for the RIGHT hand, normalized 0-1.
// Positioned in the signing space (right side of body).

function letterPose(letter) {
  const cx = 0.58, cy = 0.42, s = 0.018;
  const base = makeFist(cx, cy, s);

  const poses = {
    'A': base, // fist with thumb beside
    'B': (() => { // flat open hand, fingers up
      const h = [...base];
      h[6]={x:cx-1*s,y:cy-8*s};h[7]={x:cx-1*s,y:cy-9*s};h[8]={x:cx-1*s,y:cy-10*s};
      h[10]={x:cx,y:cy-8*s};h[11]={x:cx,y:cy-9*s};h[12]={x:cx,y:cy-10*s};
      h[14]={x:cx+1*s,y:cy-8*s};h[15]={x:cx+1*s,y:cy-9*s};h[16]={x:cx+1*s,y:cy-10*s};
      h[18]={x:cx+2*s,y:cy-7*s};h[19]={x:cx+2*s,y:cy-8*s};h[20]={x:cx+2*s,y:cy-9*s};
      return h;
    })(),
    'C': (() => { // curved open hand
      const h = [...base];
      h[4]={x:cx-2*s,y:cy-6*s};
      h[6]={x:cx-1.5*s,y:cy-7*s};h[7]={x:cx-0.5*s,y:cy-8*s};h[8]={x:cx+0.5*s,y:cy-7.5*s};
      h[10]={x:cx-0.5*s,y:cy-7.5*s};h[11]={x:cx+0.5*s,y:cy-8.5*s};h[12]={x:cx+1*s,y:cy-7.5*s};
      h[14]={x:cx+0.5*s,y:cy-7*s};h[15]={x:cx+1.5*s,y:cy-7.5*s};h[16]={x:cx+2*s,y:cy-7*s};
      h[18]={x:cx+1.5*s,y:cy-6*s};h[19]={x:cx+2.5*s,y:cy-6.5*s};h[20]={x:cx+2.5*s,y:cy-6*s};
      return h;
    })(),
    'D': (() => { // index up, others curled
      const h = [...base];
      h[6]={x:cx-1*s,y:cy-7*s};h[7]={x:cx-1*s,y:cy-9*s};h[8]={x:cx-1*s,y:cy-10*s};
      return h;
    })(),
    'E': (() => base)(), // all fingers curled into palm
    'F': (() => { // thumb+index circle, others up
      const h = [...base];
      h[4]={x:cx-0.5*s,y:cy-5.5*s};h[8]={x:cx-0.5*s,y:cy-5.5*s};
      h[10]={x:cx,y:cy-8*s};h[11]={x:cx,y:cy-9*s};h[12]={x:cx,y:cy-10*s};
      h[14]={x:cx+1*s,y:cy-8*s};h[15]={x:cx+1*s,y:cy-9*s};h[16]={x:cx+1*s,y:cy-10*s};
      h[18]={x:cx+2*s,y:cy-7*s};h[19]={x:cx+2*s,y:cy-8*s};h[20]={x:cx+2*s,y:cy-9*s};
      return h;
    })(),
    'G': (() => { // index pointing sideways
      const h = [...base];
      h[6]={x:cx+2*s,y:cy-5*s};h[7]={x:cx+4*s,y:cy-5*s};h[8]={x:cx+5*s,y:cy-5*s};
      return h;
    })(),
    'H': (() => { // index+middle pointing sideways
      const h = [...base];
      h[6]={x:cx+2*s,y:cy-5*s};h[7]={x:cx+4*s,y:cy-5*s};h[8]={x:cx+5*s,y:cy-5*s};
      h[10]={x:cx+2*s,y:cy-4*s};h[11]={x:cx+4*s,y:cy-4*s};h[12]={x:cx+5*s,y:cy-4*s};
      return h;
    })(),
    'I': (() => { // pinky up
      const h = [...base];
      h[18]={x:cx+2*s,y:cy-7*s};h[19]={x:cx+2*s,y:cy-8.5*s};h[20]={x:cx+2*s,y:cy-10*s};
      return h;
    })(),
    'J': (() => { // pinky up + motion (we show the static pose)
      const h = [...base];
      h[18]={x:cx+2*s,y:cy-7*s};h[19]={x:cx+2*s,y:cy-8.5*s};h[20]={x:cx+2*s,y:cy-10*s};
      return h;
    })(),
    'K': (() => { // index+middle up, thumb between
      const h = [...base];
      h[4]={x:cx-0.5*s,y:cy-6.5*s};
      h[6]={x:cx-1*s,y:cy-7*s};h[7]={x:cx-1*s,y:cy-9*s};h[8]={x:cx-1*s,y:cy-10*s};
      h[10]={x:cx+0.5*s,y:cy-7*s};h[11]={x:cx+1*s,y:cy-8.5*s};h[12]={x:cx+1.5*s,y:cy-9.5*s};
      return h;
    })(),
    'L': (() => { // L shape: thumb out, index up
      const h = [...base];
      h[2]={x:cx-3*s,y:cy-4*s};h[3]={x:cx-5*s,y:cy-4*s};h[4]={x:cx-6*s,y:cy-4*s};
      h[6]={x:cx-1*s,y:cy-7*s};h[7]={x:cx-1*s,y:cy-9*s};h[8]={x:cx-1*s,y:cy-10*s};
      return h;
    })(),
    'M': base, // three fingers over thumb
    'N': base, // two fingers over thumb
    'O': (() => { // all fingers curved to thumb
      const h = [...base];
      h[4]={x:cx,y:cy-5.5*s};h[8]={x:cx,y:cy-6*s};h[12]={x:cx+0.3*s,y:cy-5.8*s};
      h[16]={x:cx+0.5*s,y:cy-5.5*s};h[20]={x:cx+0.7*s,y:cy-5*s};
      return h;
    })(),
    'P': (() => { // K rotated downward
      const h = [...base];
      h[4]={x:cx-0.5*s,y:cy-3*s};
      h[6]={x:cx-1*s,y:cy-1*s};h[7]={x:cx-1*s,y:cy+1*s};h[8]={x:cx-1*s,y:cy+2*s};
      h[10]={x:cx+0.5*s,y:cy-1*s};h[11]={x:cx+1*s,y:cy+0.5*s};h[12]={x:cx+1.5*s,y:cy+1.5*s};
      return h;
    })(),
    'Q': (() => { // G pointing down
      const h = [...base];
      h[6]={x:cx-1*s,y:cy+1*s};h[7]={x:cx-1*s,y:cy+3*s};h[8]={x:cx-1*s,y:cy+4*s};
      h[4]={x:cx-2*s,y:cy+1*s};
      return h;
    })(),
    'R': (() => { // index+middle crossed up
      const h = [...base];
      h[6]={x:cx-0.5*s,y:cy-7*s};h[7]={x:cx,y:cy-9*s};h[8]={x:cx+0.5*s,y:cy-10*s};
      h[10]={x:cx+0.5*s,y:cy-7*s};h[11]={x:cx,y:cy-9*s};h[12]={x:cx-0.5*s,y:cy-10*s};
      return h;
    })(),
    'S': base, // fist with thumb across fingers
    'T': base, // thumb between index and middle
    'U': (() => { // index+middle up together
      const h = [...base];
      h[6]={x:cx-0.5*s,y:cy-7*s};h[7]={x:cx-0.5*s,y:cy-9*s};h[8]={x:cx-0.5*s,y:cy-10*s};
      h[10]={x:cx+0.5*s,y:cy-7*s};h[11]={x:cx+0.5*s,y:cy-9*s};h[12]={x:cx+0.5*s,y:cy-10*s};
      return h;
    })(),
    'V': (() => { // peace sign, fingers spread
      const h = [...base];
      h[6]={x:cx-1.5*s,y:cy-7*s};h[7]={x:cx-2*s,y:cy-9*s};h[8]={x:cx-2.5*s,y:cy-10*s};
      h[10]={x:cx+0.5*s,y:cy-7*s};h[11]={x:cx+1*s,y:cy-9*s};h[12]={x:cx+1.5*s,y:cy-10*s};
      return h;
    })(),
    'W': (() => { // three fingers spread up
      const h = [...base];
      h[6]={x:cx-2*s,y:cy-7*s};h[7]={x:cx-2.5*s,y:cy-9*s};h[8]={x:cx-3*s,y:cy-10*s};
      h[10]={x:cx,y:cy-7*s};h[11]={x:cx,y:cy-9*s};h[12]={x:cx,y:cy-10*s};
      h[14]={x:cx+2*s,y:cy-7*s};h[15]={x:cx+2.5*s,y:cy-9*s};h[16]={x:cx+3*s,y:cy-10*s};
      return h;
    })(),
    'X': (() => { // index hooked
      const h = [...base];
      h[6]={x:cx-1*s,y:cy-6*s};h[7]={x:cx-0.5*s,y:cy-7.5*s};h[8]={x:cx-1*s,y:cy-7*s};
      return h;
    })(),
    'Y': (() => { // thumb+pinky out (hang loose)
      const h = [...base];
      h[2]={x:cx-3*s,y:cy-4*s};h[3]={x:cx-5*s,y:cy-4*s};h[4]={x:cx-6*s,y:cy-4*s};
      h[18]={x:cx+2*s,y:cy-7*s};h[19]={x:cx+2*s,y:cy-8.5*s};h[20]={x:cx+2*s,y:cy-10*s};
      return h;
    })(),
    'Z': (() => { // index up (draws Z in motion, show static)
      const h = [...base];
      h[6]={x:cx-1*s,y:cy-7*s};h[7]={x:cx-1*s,y:cy-9*s};h[8]={x:cx-1*s,y:cy-10*s};
      return h;
    })(),
  };

  return poses[letter.toUpperCase()] || base;
}

/**
 * Get fingerspelling frames for a single letter.
 * Returns two frames: approach + hold.
 */
export function getLetterFrames(letter) {
  const hand = letterPose(letter);
  return [
    { landmarks: { pose: NEUTRAL_POSE, rightHand: hand, leftHand: makeFist(0.42, 0.54, 0.015) } },
    { landmarks: { pose: NEUTRAL_POSE, rightHand: hand, leftHand: makeFist(0.42, 0.54, 0.015) } },
  ];
}

/**
 * Build fingerspelling frames for an entire word.
 */
export function fingerspellWord(word) {
  const frames = [];
  for (const ch of word.toUpperCase()) {
    if (ch >= 'A' && ch <= 'Z') {
      frames.push(...getLetterFrames(ch));
    }
  }
  return { word, frames, isSpelled: true };
}

// ── Cache for fetched word animations ───────────────────────────────────────
const wordCache = new Map();

/**
 * Fetch animation frames for a single word from the backend.
 * Falls back to fingerspelling if not found.
 */
export async function fetchWordAnimation(word) {
  const key = word.toLowerCase().trim();
  if (wordCache.has(key)) return wordCache.get(key);

  try {
    const res = await api.get(`/signdict/word/${encodeURIComponent(key)}`);
    if (res.data?.frames?.length > 0) {
      const result = { word: key, frames: res.data.frames, isSpelled: false };
      wordCache.set(key, result);
      return result;
    }
  } catch (_) { /* fallback to fingerspelling */ }

  const spelled = fingerspellWord(key);
  wordCache.set(key, spelled);
  return spelled;
}

/**
 * Build a complete animation timeline from a text string.
 * Returns an array of { word, frameIndex, landmarks } entries.
 */
export async function buildTimeline(text) {
  if (!text) return [];

  const words = text
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 0)
    .slice(0, 200); // cap at 200 words

  const timeline = [];

  for (const word of words) {
    const anim = await fetchWordAnimation(word);
    for (let i = 0; i < anim.frames.length; i++) {
      timeline.push({
        word: anim.word,
        isSpelled: anim.isSpelled,
        landmarks: anim.frames[i].landmarks,
        wordIndex: timeline.length === 0 ? 0 : timeline[timeline.length - 1].wordIndex + (i === 0 ? 1 : 0),
      });
    }
  }

  // Assign correct word indices
  let wIdx = 0;
  let lastWord = '';
  for (const entry of timeline) {
    if (entry.word !== lastWord) { wIdx++; lastWord = entry.word; }
    entry.wordIndex = wIdx - 1;
  }

  return timeline;
}

/**
 * Return total unique word count in a timeline.
 */
export function getWordCount(timeline) {
  if (!timeline.length) return 0;
  return timeline[timeline.length - 1].wordIndex + 1;
}
