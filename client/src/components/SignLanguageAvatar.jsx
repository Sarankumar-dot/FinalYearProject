import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawSkeleton, interpolateFrames, drawWordLabel, clearCanvas } from '../utils/signAvatarRenderer';
import { buildTimeline, getWordCount } from '../utils/signDictionary';
import { FaPause, FaPlay, FaTachometerAlt, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

/**
 * SignLanguageAvatar — renders a 2D skeleton that signs the given text.
 *
 * Props:
 *   text      — the lesson transcript / description to sign
 *   width     — canvas width (default: container width)
 *   height    — canvas height (default: 400)
 *   onClose   — callback when avatar is dismissed
 */
export default function SignLanguageAvatar({ text, height = 400, onClose }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animRef = useRef(null);

  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1.0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(640);
  const [canvasHeight, setCanvasHeight] = useState(typeof height === 'number' ? height : 400);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const playingRef = useRef(true);
  const speedRef = useRef(1.0);

  // Keep refs in sync with state
  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  // Audio Speech Handler
  const handleSpeak = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!text) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Try to match speaking rate to signing speed
      utterance.rate = speedRef.current > 1.5 ? 1.5 : (speedRef.current < 0.5 ? 0.5 : speedRef.current);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  }, [isSpeaking, text]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Responsive canvas width and height
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) {
        setCanvasWidth(Math.floor(e.contentRect.width));
        setCanvasHeight(Math.floor(e.contentRect.height));
      }
    });
    obs.observe(el);
    setCanvasWidth(el.offsetWidth);
    setCanvasHeight(el.offsetHeight);
    return () => obs.disconnect();
  }, []);

  // Build timeline from text
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    buildTimeline(text)
      .then(tl => { if (!cancelled) { setTimeline(tl); setLoading(false); frameRef.current = 0; } })
      .catch(err => { if (!cancelled) { setError('Failed to load sign data'); setLoading(false); } });
    return () => { cancelled = true; };
  }, [text]);

  // Animation loop
  useEffect(() => {
    if (loading || timeline.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const FRAME_DURATION = 150; // ms per frame — normal natural signing speed

    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;

      if (playingRef.current && delta >= FRAME_DURATION / speedRef.current) {
        lastTimeRef.current = timestamp;
        frameRef.current = (frameRef.current + 1) % timeline.length;
        setCurrentFrame(frameRef.current);
      }

      const idx = frameRef.current;
      const nextIdx = (idx + 1) % timeline.length;
      const progress = playingRef.current
        ? Math.min(delta / (FRAME_DURATION / speedRef.current), 1)
        : 0;

      const interpolated = interpolateFrames(
        timeline[idx].landmarks,
        timeline[nextIdx].landmarks,
        progress
      );

      drawSkeleton(ctx, interpolated, canvas.width, canvas.height);

      const wordCount = getWordCount(timeline);
      drawWordLabel(
        ctx,
        timeline[idx].word + (timeline[idx].isSpelled ? ' (spelled)' : ''),
        timeline[idx].wordIndex,
        wordCount,
        canvas.width,
        canvas.height
      );

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); lastTimeRef.current = 0; };
  }, [timeline, loading]);

  // Loading state
  if (loading) return (
    <div ref={containerRef} style={{
      width: '100%', height, background: 'linear-gradient(135deg, #0f1117, #1a1d2e)',
      borderRadius: 12, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
    }}>
      <div style={{ fontSize: '3rem', animation: 'pulse 1.5s ease-in-out infinite' }}>🤟</div>
      <p style={{ color: '#a78bfa', fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>
        Preparing Sign Language Avatar...
      </p>
      <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: '40%', height: '100%', background: '#6c63ff', borderRadius: 2,
          animation: 'loading-slide 1.2s ease-in-out infinite',
        }} />
      </div>
      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes loading-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }
      `}</style>
    </div>
  );

  if (error) return (
    <div ref={containerRef} style={{
      width: '100%', height: 200, background: '#1a1d2e', borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ color: '#f87171' }}>{error}</p>
    </div>
  );

  const wordCount = timeline.length > 0 ? getWordCount(timeline) : 0;
  const currentWord = timeline[currentFrame]?.word || '';

  return (
    <div ref={containerRef} style={{ width: '100%', height, position: 'relative' }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ width: '100%', height: '100%', borderRadius: 12, display: 'block' }}
        aria-label={`Sign language avatar signing: ${currentWord}`}
        role="img"
      />

      {/* Controls overlay */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '0.75rem 1rem',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        borderRadius: '0 0 12px 12px',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        {/* Play/Pause */}
        <button
          onClick={() => setPlaying(p => !p)}
          style={{
            background: 'rgba(108,99,255,0.3)', border: '1px solid rgba(108,99,255,0.5)',
            borderRadius: 8, color: '#fff', padding: '0.4rem 0.6rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.75rem', fontWeight: 600,
          }}
          aria-label={playing ? 'Pause avatar' : 'Play avatar'}
        >
          {playing ? <FaPause /> : <FaPlay />}
        </button>

        {/* Audio/TTS */}
        <button
          onClick={handleSpeak}
          style={{
            background: isSpeaking ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)',
            border: `1px solid ${isSpeaking ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`,
            borderRadius: 8, color: '#fff', padding: '0.4rem 0.6rem',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.75rem', fontWeight: 600,
          }}
          aria-label={isSpeaking ? 'Stop audio' : 'Listen aloud'}
          title="Listen to text"
        >
          {isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>

        {/* Speed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#94a3b8' }}>
          <FaTachometerAlt />
          <select
            value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4, color: '#e2e8f0', fontSize: '0.7rem', padding: '0.2rem',
              cursor: 'pointer',
            }}
            aria-label="Signing speed"
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>

        {/* Current word */}
        <div style={{
          flex: 1, textAlign: 'center', color: '#a78bfa',
          fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          {currentWord} {timeline[currentFrame]?.isSpelled && '✋'}
        </div>

        {/* Word counter */}
        <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
          {timeline[currentFrame]?.wordIndex + 1 || 0}/{wordCount}
        </span>
      </div>
    </div>
  );
}
