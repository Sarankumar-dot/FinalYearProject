/**
 * handGestureRecognizer.js
 *
 * Core engine that wraps MediaPipe Hands for real‑time hand landmark
 * detection and runs the gesture classifier from gestureDefinitions.js.
 *
 * Usage:
 *   import { HandGestureRecognizer } from './handGestureRecognizer';
 *
 *   const recognizer = new HandGestureRecognizer();
 *   await recognizer.init(videoElement);
 *   recognizer.startDetection((result) => { ... });
 *   recognizer.stopDetection();
 */

import { recognizeGesture } from './gestureDefinitions';

// ─── constants ──────────────────────────────────────────────────────────────

/** Minimum ms a gesture must be held before it is emitted. */
const HOLD_DURATION_MS = 1200;

/** Cooldown after a gesture is emitted — same gesture won't repeat for this long. */
const COOLDOWN_MS = 2500;

/** Min confidence to accept a gesture (0‑100). */
const CONFIDENCE_THRESHOLD = 70;

/** How often we run detection frames (ms). Lower = more responsive but more CPU. */
const DETECTION_INTERVAL_MS = 100;

// ─── class ──────────────────────────────────────────────────────────────────

export class HandGestureRecognizer {
  constructor() {
    this.hands = null;
    this.camera = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;
    this.isRunning = false;
    this.animFrameId = null;
    this.detectionTimer = null;

    // Debounce / cooldown state
    this._currentGesture = null;
    this._gestureStartTime = 0;
    this._lastEmittedGesture = null;
    this._lastEmitTime = 0;

    // Callbacks
    this._onResult = null;
    this._onLandmarks = null;

    // Latest landmarks for external drawing
    this.latestLandmarks = null;
    this.latestHandedness = null;
  }

  /**
   * Initialises MediaPipe Hands.
   * Call this once, passing the <video> element that displays the webcam feed.
   *
   * @param {HTMLVideoElement} videoElement
   * @param {HTMLCanvasElement} [canvasElement] – optional overlay canvas for landmarks
   * @returns {Promise<void>}
   */
  async init(videoElement, canvasElement = null) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    if (canvasElement) {
      this.canvasCtx = canvasElement.getContext('2d');
    }

    // Wait for the MediaPipe global to be available (loaded from CDN)
    await this._waitForMediaPipe();

    /* global Hands */
    this.hands = new window.Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    this.hands.onResults((results) => this._handleResults(results));

    // Initialize the model (downloads weights on first run)
    await this.hands.initialize();
  }

  /**
   * Starts the recognition loop.
   *
   * @param {Function} onResult – called with { name, emoji, confidence, description }
   *                               when a gesture is confirmed.
   * @param {Function} [onLandmarks] – called every frame with raw landmark data for overlay.
   */
  startDetection(onResult, onLandmarks = null) {
    if (this.isRunning) return;
    this.isRunning = true;
    this._onResult = onResult;
    this._onLandmarks = onLandmarks;
    this._runLoop();
  }

  /** Stops the recognition loop. */
  stopDetection() {
    this.isRunning = false;
    if (this.detectionTimer) {
      clearTimeout(this.detectionTimer);
      this.detectionTimer = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this._currentGesture = null;
    this._gestureStartTime = 0;
    this.latestLandmarks = null;
  }

  /** Clean up everything. */
  destroy() {
    this.stopDetection();
    if (this.hands) {
      this.hands.close();
      this.hands = null;
    }
  }

  // ─── private ────────────────────────────────────────────────────────────

  /** Polls the video element and sends frames to MediaPipe. */
  _runLoop() {
    if (!this.isRunning) return;

    const video = this.videoElement;
    if (video && video.readyState >= 2) {
      this.hands.send({ image: video }).catch(() => {});
    }

    this.detectionTimer = setTimeout(() => {
      this.animFrameId = requestAnimationFrame(() => this._runLoop());
    }, DETECTION_INTERVAL_MS);
  }

  /** Handles raw MediaPipe results. */
  _handleResults(results) {
    const { multiHandLandmarks, multiHandedness } = results;

    // Broadcast raw landmarks for overlay drawing
    if (this._onLandmarks) {
      this._onLandmarks(multiHandLandmarks || [], multiHandedness || []);
    }

    // Store for external access
    this.latestLandmarks = multiHandLandmarks || [];
    this.latestHandedness = multiHandedness || [];

    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      // No hand detected — reset current gesture tracking
      this._currentGesture = null;
      this._gestureStartTime = 0;
      return;
    }

    // Run classifier on the first detected hand
    const landmarks = multiHandLandmarks[0];
    const handedness = multiHandedness?.[0]?.label || 'Right';
    const gesture = recognizeGesture(landmarks, handedness, CONFIDENCE_THRESHOLD / 100);

    if (!gesture) {
      this._currentGesture = null;
      this._gestureStartTime = 0;
      return;
    }

    const now = Date.now();

    // Check if this is the same gesture being held
    if (this._currentGesture === gesture.name) {
      const holdTime = now - this._gestureStartTime;
      if (holdTime >= HOLD_DURATION_MS) {
        // Check cooldown — don't repeat the same gesture too quickly
        if (
          this._lastEmittedGesture !== gesture.name ||
          now - this._lastEmitTime >= COOLDOWN_MS
        ) {
          this._emitGesture(gesture);
        }
      }
    } else {
      // Different gesture — start a new hold timer
      this._currentGesture = gesture.name;
      this._gestureStartTime = now;
    }
  }

  /** Emits a confirmed gesture. */
  _emitGesture(gesture) {
    this._lastEmittedGesture = gesture.name;
    this._lastEmitTime = Date.now();
    this._currentGesture = null;
    this._gestureStartTime = 0;

    if (this._onResult) {
      this._onResult({
        ...gesture,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /** Waits for the MediaPipe Hands global to be loaded from CDN. */
  _waitForMediaPipe(timeout = 15000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (window.Hands) {
          resolve();
        } else if (Date.now() - start > timeout) {
          reject(new Error('MediaPipe Hands library failed to load. Check your internet connection.'));
        } else {
          setTimeout(check, 200);
        }
      };
      check();
    });
  }
}

// ─── landmark drawing utility ───────────────────────────────────────────────

/** Connections between hand landmarks for drawing the wireframe. */
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // index
  [0, 9], [9, 10], [10, 11], [11, 12],  // middle
  [0, 13], [13, 14], [14, 15], [15, 16],// ring
  [0, 17], [17, 18], [18, 19], [19, 20],// pinky
  [5, 9], [9, 13], [13, 17],            // palm
];

/**
 * Draws hand landmarks and connections on a canvas.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} multiHandLandmarks – array of hands, each with 21 landmarks
 * @param {number} width – canvas width
 * @param {number} height – canvas height
 */
export function drawHandLandmarks(ctx, multiHandLandmarks, width, height) {
  ctx.clearRect(0, 0, width, height);

  if (!multiHandLandmarks || multiHandLandmarks.length === 0) return;

  const colors = [
    { line: '#818cf8', dot: '#a78bfa', glow: 'rgba(129, 140, 248, 0.4)' },
    { line: '#22d3ee', dot: '#67e8f9', glow: 'rgba(34, 211, 238, 0.4)' },
  ];

  multiHandLandmarks.forEach((landmarks, handIdx) => {
    const c = colors[handIdx % colors.length];

    // Draw connections
    ctx.strokeStyle = c.line;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    for (const [a, b] of HAND_CONNECTIONS) {
      const la = landmarks[a];
      const lb = landmarks[b];
      ctx.beginPath();
      ctx.moveTo(la.x * width, la.y * height);
      ctx.lineTo(lb.x * width, lb.y * height);
      ctx.stroke();
    }

    // Draw landmark dots
    for (const lm of landmarks) {
      const x = lm.x * width;
      const y = lm.y * height;

      // Glow
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = c.glow;
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fillStyle = c.dot;
      ctx.fill();
    }
  });
}

export default HandGestureRecognizer;
