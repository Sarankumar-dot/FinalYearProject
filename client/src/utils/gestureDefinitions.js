/**
 * gestureDefinitions.js
 *
 * Defines 8 recognizable sign language gestures using MediaPipe hand landmark
 * geometry.  Each gesture is a plain object with:
 *
 *   name        – display name
 *   emoji       – emoji icon for UI
 *   description – short explanation of the sign
 *   match(landmarks, handedness)
 *               – returns a confidence score 0‒1 for the given 21‑landmark
 *                 array.  `handedness` is "Left" | "Right".
 *
 * MediaPipe Hands landmark indices:
 *   0  WRIST
 *   1  THUMB_CMC   2  THUMB_MCP   3  THUMB_IP   4  THUMB_TIP
 *   5  INDEX_MCP   6  INDEX_PIP   7  INDEX_DIP  8  INDEX_TIP
 *   9  MIDDLE_MCP 10  MIDDLE_PIP 11  MIDDLE_DIP 12  MIDDLE_TIP
 *  13  RING_MCP   14  RING_PIP   15  RING_DIP   16  RING_TIP
 *  17  PINKY_MCP  18  PINKY_PIP  19  PINKY_DIP  20  PINKY_TIP
 */

// ─── helpers ────────────────────────────────────────────────────────────────

/** Euclidean distance between two 3‑D landmarks. */
function dist(a, b) {
  return Math.sqrt(
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2,
  );
}

/** Returns true when a finger tip is further from the wrist than its PIP joint
 *  (i.e. the finger is extended). */
function isFingerExtended(landmarks, tipIdx, pipIdx) {
  const wrist = landmarks[0];
  return dist(landmarks[tipIdx], wrist) > dist(landmarks[pipIdx], wrist);
}

/** Returns true when a finger tip is closer to the wrist than its PIP joint
 *  (i.e. the finger is curled). */
function isFingerCurled(landmarks, tipIdx, pipIdx) {
  return !isFingerExtended(landmarks, tipIdx, pipIdx);
}

/** Check if thumb is extended (special case — uses CMC instead of PIP). */
function isThumbExtended(landmarks) {
  const wrist = landmarks[0];
  return dist(landmarks[4], wrist) > dist(landmarks[2], wrist);
}

/** Returns the number of extended fingers (excluding thumb). */
function countExtendedFingers(lm) {
  let n = 0;
  if (isFingerExtended(lm, 8, 6)) n++;   // index
  if (isFingerExtended(lm, 12, 10)) n++;  // middle
  if (isFingerExtended(lm, 16, 14)) n++;  // ring
  if (isFingerExtended(lm, 20, 18)) n++;  // pinky
  return n;
}

/** Checks whether all four fingers are extended. */
function allFingersExtended(lm) {
  return countExtendedFingers(lm) === 4;
}

/** Checks whether all four fingers are curled. */
function allFingersCurled(lm) {
  return countExtendedFingers(lm) === 0;
}

/** Angle (radians) between vectors AB and AC. */
function angleBetween(a, b, c) {
  const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
  const dot = ab.x * ac.x + ab.y * ac.y + ab.z * ac.z;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2);
  const magAC = Math.sqrt(ac.x ** 2 + ac.y ** 2 + ac.z ** 2);
  if (magAB === 0 || magAC === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (magAB * magAC))));
}

/** Is the palm facing the camera? (positive z‑normal of the palm triangle). */
function isPalmFacingCamera(lm) {
  // Triangle: wrist(0) → index_mcp(5) → pinky_mcp(17)
  const a = lm[0];
  const b = lm[5];
  const c = lm[17];
  const v1 = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const v2 = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
  // Cross product z‑component
  const crossZ = v1.x * v2.y - v1.y * v2.x;
  return crossZ > 0; // positive → palm toward camera
}

// ─── gesture definitions ────────────────────────────────────────────────────

export const GESTURES = [
  // ───────────── 1. HELLO ─────────────
  // Open hand, all fingers + thumb extended, palm facing camera — the classic
  // wave/hello sign.
  {
    name: 'Hello',
    emoji: '👋',
    description: 'Open hand wave — all fingers extended, palm facing forward',
    match(lm) {
      const extended = allFingersExtended(lm) && isThumbExtended(lm);
      const palmForward = isPalmFacingCamera(lm);
      if (extended && palmForward) return 0.92;
      if (extended) return 0.65;
      return 0;
    },
  },

  // ───────────── 2. THANK YOU ─────────────
  // Flat hand (fingers together, extended) touching chin/lips area then moving
  // forward.  In a single frame we detect: open hand near face level with
  // fingertips pointing upward.
  {
    name: 'Thank You',
    emoji: '🙏',
    description: 'Flat open hand near chin, fingertips up',
    match(lm) {
      const extended = allFingersExtended(lm);
      // Fingertips should be ABOVE wrist (y axis is inverted in screen coords)
      const tipsAboveWrist =
        lm[8].y < lm[0].y && lm[12].y < lm[0].y && lm[20].y < lm[0].y;
      // Hand should be relatively high (chin area ≈ upper portion of frame)
      const handHigh = lm[0].y < 0.5;
      // Palm facing forward (away from signer)
      const palmOut = isPalmFacingCamera(lm);

      let score = 0;
      if (extended && tipsAboveWrist && handHigh && palmOut) score = 0.90;
      else if (extended && tipsAboveWrist && handHigh) score = 0.70;
      else if (extended && tipsAboveWrist) score = 0.40;
      return score;
    },
  },

  // ───────────── 3. YES ─────────────
  // Fist with thumb up — the "thumbs up" gesture commonly used for "yes".
  {
    name: 'Yes',
    emoji: '👍',
    description: 'Fist with thumb pointing up (thumbs up)',
    match(lm) {
      const fist = allFingersCurled(lm);
      const thumbUp = isThumbExtended(lm);
      // Thumb tip should be above thumb CMC (pointing upward)
      const thumbPointsUp = lm[4].y < lm[2].y;

      if (fist && thumbUp && thumbPointsUp) return 0.93;
      if (fist && thumbUp) return 0.70;
      return 0;
    },
  },

  // ───────────── 4. NO ─────────────
  // Index and middle finger extended (like scissors), other fingers curled.
  // In ASL the "no" is a pinching motion with index+middle against thumb,
  // but the static "two‑finger" pose is the most reliably detected frame.
  {
    name: 'No',
    emoji: '✋',
    description: 'Index and middle fingers extended, others curled',
    match(lm) {
      const indexUp = isFingerExtended(lm, 8, 6);
      const middleUp = isFingerExtended(lm, 12, 10);
      const ringDown = isFingerCurled(lm, 16, 14);
      const pinkyDown = isFingerCurled(lm, 20, 18);

      if (indexUp && middleUp && ringDown && pinkyDown) return 0.90;
      return 0;
    },
  },

  // ───────────── 5. HELP ─────────────
  // Fist placed on open palm — detected as one hand with thumb on top of a
  // flat surface.  With single‑hand detection we approximate: fist with thumb
  // extended to the side and hand oriented horizontally.
  {
    name: 'Help',
    emoji: '🆘',
    description: 'Thumbs up on flat palm — fist with thumb extended sideways',
    match(lm) {
      const fist = allFingersCurled(lm);
      const thumbOut = isThumbExtended(lm);
      // Thumb should be roughly horizontal (tip.y ≈ cmc.y)
      const thumbHorizontal = Math.abs(lm[4].y - lm[2].y) < 0.06;

      if (fist && thumbOut && thumbHorizontal) return 0.88;
      if (fist && thumbOut) return 0.50;
      return 0;
    },
  },

  // ───────────── 6. WATER ─────────────
  // ASL "W" hand‑shape touching chin — three fingers (index, middle, ring)
  // extended, pinky curled, thumb curled or touching.
  {
    name: 'Water',
    emoji: '💧',
    description: 'Three middle fingers extended (W shape), pinky curled',
    match(lm) {
      const indexUp = isFingerExtended(lm, 8, 6);
      const middleUp = isFingerExtended(lm, 12, 10);
      const ringUp = isFingerExtended(lm, 16, 14);
      const pinkyDown = isFingerCurled(lm, 20, 18);

      if (indexUp && middleUp && ringUp && pinkyDown) return 0.88;
      return 0;
    },
  },

  // ───────────── 7. FOOD ─────────────
  // Fingers and thumb pinched together (all fingertips touching) — the ASL
  // sign for "eat/food" involves bringing a flat O to the mouth.  We detect
  // the pinch: all fingertips close to thumb tip.
  {
    name: 'Food',
    emoji: '🍽️',
    description: 'All fingertips pinched together (flat O shape)',
    match(lm) {
      const thumbTip = lm[4];
      const d1 = dist(lm[8], thumbTip);
      const d2 = dist(lm[12], thumbTip);
      const d3 = dist(lm[16], thumbTip);
      const d4 = dist(lm[20], thumbTip);

      const threshold = 0.08; // normalized coordinate distance
      const allPinched = d1 < threshold && d2 < threshold && d3 < threshold && d4 < threshold;
      const mostPinched = d1 < threshold && d2 < threshold && d3 < threshold;

      if (allPinched) return 0.92;
      if (mostPinched && d4 < threshold * 1.5) return 0.75;
      return 0;
    },
  },

  // ───────────── 8. GOOD MORNING ─────────────
  // Combination sign — flat open hand rising from chest.  In a single frame
  // we detect: all fingers extended, palm facing camera, hand in the lower
  // half of the frame (representing the "rising" portion of the sign).
  {
    name: 'Good Morning',
    emoji: '🌅',
    description: 'Open hand low, palm up — rising gesture',
    match(lm) {
      const extended = allFingersExtended(lm) && isThumbExtended(lm);
      // Hand in lower half of frame
      const handLow = lm[0].y > 0.5;
      // Palm NOT facing camera (facing up) — inverted palm check
      const palmUp = !isPalmFacingCamera(lm);

      if (extended && handLow && palmUp) return 0.85;
      if (extended && handLow) return 0.60;
      return 0;
    },
  },
];

/**
 * Runs all gesture matchers against the provided landmarks and returns the
 * best match (or null if no gesture exceeds the confidence threshold).
 *
 * @param {Array} landmarks – 21 MediaPipe hand landmarks
 * @param {string} handedness – "Left" | "Right"
 * @param {number} threshold – minimum confidence to accept (default 0.70)
 * @returns {{ name: string, emoji: string, confidence: number } | null}
 */
export function recognizeGesture(landmarks, handedness = 'Right', threshold = 0.70) {
  if (!landmarks || landmarks.length < 21) return null;

  let best = null;
  let bestScore = 0;

  for (const gesture of GESTURES) {
    const score = gesture.match(landmarks, handedness);
    if (score > bestScore) {
      bestScore = score;
      best = gesture;
    }
  }

  if (best && bestScore >= threshold) {
    return {
      name: best.name,
      emoji: best.emoji,
      description: best.description,
      confidence: Math.round(bestScore * 100),
    };
  }

  return null;
}

export default GESTURES;
