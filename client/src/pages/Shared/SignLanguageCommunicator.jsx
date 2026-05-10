import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { HandGestureRecognizer, drawHandLandmarks } from '../../utils/handGestureRecognizer';
import { GESTURES } from '../../utils/gestureDefinitions';
import {
  FaVideo,
  FaVideoSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaTrashAlt,
  FaHandsHelping,
  FaInfoCircle,
  FaSave,
  FaCircle,
} from 'react-icons/fa';
import api from '../../api/axios';

/**
 * SignLanguageCommunicator
 *
 * Real‑time webcam‑based sign language recognition page.
 * Accessible to hearing‑impaired students and all teachers.
 */
export default function SignLanguageCommunicator() {
  const { user } = useAuth();
  const { prefs, speak, stopSpeech, announce } = useAccessibility();

  // ─── access guard ──────────────────────────────────────────────────────
  const isTeacher = user?.role === 'teacher';
  const isHearingImpaired = user?.accessibilityType === 'hearing-impaired';
  if (!isTeacher && !isHearingImpaired) {
    return <Navigate to={`/${user?.role || 'student'}`} replace />;
  }

  // ─── refs ──────────────────────────────────────────────────────────────
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognizerRef = useRef(null);
  const conversationEndRef = useRef(null);

  // ─── state ─────────────────────────────────────────────────────────────
  const [cameraStatus, setCameraStatus] = useState('off'); // off | loading | active | error
  const [cameraError, setCameraError] = useState('');
  const [currentGesture, setCurrentGesture] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [modelLoading, setModelLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [saving, setSaving] = useState(false);

  // Scroll conversation to bottom when new items arrive
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // ─── camera controls ──────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraStatus('loading');
    setCameraError('');
    setModelLoading(true);

    try {
      // Request webcam
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();

      // Initialize recognizer
      const recognizer = new HandGestureRecognizer();
      await recognizer.init(video, canvasRef.current);
      recognizerRef.current = recognizer;

      setModelLoading(false);
      setCameraStatus('active');
      announce('Camera started. Show hand gestures to begin signing.');

      // Start detection
      recognizer.startDetection(
        // onResult — a gesture has been confirmed
        (result) => {
          setCurrentGesture(result);
          setConversation((prev) => [
            ...prev,
            {
              id: Date.now(),
              gesture: result.name,
              emoji: result.emoji,
              confidence: result.confidence,
              timestamp: new Date().toLocaleTimeString(),
            },
          ]);
          announce(`Detected: ${result.name}`);
        },
        // onLandmarks — raw landmarks every frame for overlay drawing
        (multiHandLandmarks) => {
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            drawHandLandmarks(ctx, multiHandLandmarks, canvas.width, canvas.height);
          }
        },
      );
    } catch (err) {
      console.error('Camera error:', err);
      setCameraStatus('error');
      setModelLoading(false);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a webcam and try again.');
      } else {
        setCameraError(err.message || 'Failed to start camera.');
      }
    }
  }, [announce]);

  const stopCamera = useCallback(() => {
    // Stop recognizer
    if (recognizerRef.current) {
      recognizerRef.current.destroy();
      recognizerRef.current = null;
    }

    // Stop video stream
    const video = videoRef.current;
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    setCameraStatus('off');
    setCurrentGesture(null);
    announce('Camera stopped.');
  }, [announce]);

  // ─── voice output ─────────────────────────────────────────────────────

  // Speak detected gesture using the platform's existing TTS engine
  useEffect(() => {
    if (voiceEnabled && currentGesture) {
      speak(currentGesture.gesture || currentGesture.name);
    }
  }, [currentGesture, voiceEnabled]);

  const toggleVoice = () => {
    setVoiceEnabled((v) => {
      const next = !v;
      if (!next) stopSpeech();
      announce(next ? 'Voice output enabled' : 'Voice output disabled');
      return next;
    });
  };

  // ─── conversation controls ────────────────────────────────────────────

  const clearConversation = () => {
    setConversation([]);
    setCurrentGesture(null);
    announce('Conversation cleared');
  };

  const saveConversation = async () => {
    if (conversation.length === 0) return;
    setSaving(true);
    try {
      await api.post('/conversations', {
        messages: conversation,
        savedAt: new Date().toISOString(),
      });
      announce('Conversation saved');
    } catch {
      announce('Failed to save conversation');
    } finally {
      setSaving(false);
    }
  };

  // ─── status indicator ────────────────────────────────────────────────

  const statusConfig = {
    off: { color: '#64748b', label: 'Camera Off', icon: '🔴' },
    loading: { color: '#fbbf24', label: 'Starting…', icon: '🟡' },
    active: { color: '#34d399', label: 'Camera Active', icon: '🟢' },
    error: { color: '#fb7185', label: 'Error', icon: '🔴' },
  };
  const status = statusConfig[cameraStatus];

  // ─── render ───────────────────────────────────────────────────────────

  return (
    <main
      className="animate-fade-in"
      role="main"
      aria-label="AI Sign Language Communicator"
      style={{ position: 'relative' }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #818cf8, #22d3ee)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            🤟
          </div>
          <div>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.5rem',
                fontWeight: 700,
                margin: 0,
              }}
            >
              AI Sign Language Communicator
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: '0.15rem 0 0' }}>
              Show hand gestures to your webcam — they'll be converted to text and speech in real time.
            </p>
          </div>

          {/* Guide toggle */}
          <button
            onClick={() => setShowGuide((s) => !s)}
            className="btn btn-secondary"
            style={{ marginLeft: 'auto', fontSize: '0.8rem', padding: '0.5rem 0.875rem' }}
            aria-label={showGuide ? 'Hide gesture guide' : 'Show gesture guide'}
          >
            <FaInfoCircle /> {showGuide ? 'Hide Guide' : 'Gesture Guide'}
          </button>
        </div>
      </div>

      {/* ── Gesture Reference Guide (collapsible) ── */}
      {showGuide && (
        <div
          className="card animate-fade-in"
          style={{ marginBottom: '1.5rem' }}
          role="region"
          aria-label="Supported gestures reference"
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
            Supported Gestures
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {GESTURES.map((g) => (
              <div
                key={g.name}
                style={{
                  background: 'var(--color-surface2)',
                  borderRadius: 10,
                  padding: '0.75rem 1rem',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{g.emoji}</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{g.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  {g.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Grid: Camera + Conversation ── */}
      <div className="sign-communicator-grid">
        {/* ── LEFT: Camera & Detection ── */}
        <div className="card" style={{ padding: '1rem' }}>
          {/* Camera status bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className={`camera-status camera-status--${cameraStatus}`} aria-hidden="true" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{status.label}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {cameraStatus !== 'active' ? (
                <button
                  onClick={startCamera}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  disabled={cameraStatus === 'loading'}
                  aria-label="Start camera"
                >
                  <FaVideo /> {cameraStatus === 'loading' ? 'Starting…' : 'Start Camera'}
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="btn btn-danger"
                  style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                  aria-label="Stop camera"
                >
                  <FaVideoSlash /> Stop Camera
                </button>
              )}
            </div>
          </div>

          {/* Camera feed container */}
          <div className="camera-container" role="img" aria-label="Webcam feed with hand tracking overlay">
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 12,
                display: cameraStatus === 'active' ? 'block' : 'none',
                transform: 'scaleX(-1)',
              }}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="camera-overlay"
              style={{
                display: cameraStatus === 'active' ? 'block' : 'none',
                transform: 'scaleX(-1)',
              }}
              aria-hidden="true"
            />

            {/* Placeholder when camera is off */}
            {cameraStatus === 'off' && (
              <div className="camera-placeholder">
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📹</div>
                <p style={{ fontWeight: 600 }}>Camera is off</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: 280 }}>
                  Click "Start Camera" to begin real-time sign language recognition
                </p>
              </div>
            )}

            {/* Loading state */}
            {cameraStatus === 'loading' && (
              <div className="camera-placeholder">
                <div style={{ fontSize: '2.5rem', animation: 'pulse 1.5s ease-in-out infinite' }}>🤟</div>
                <p style={{ fontWeight: 600 }}>
                  {modelLoading ? 'Loading AI model…' : 'Accessing camera…'}
                </p>
                <div
                  style={{
                    width: 120,
                    height: 4,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    overflow: 'hidden',
                    marginTop: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '40%',
                      height: '100%',
                      background: 'linear-gradient(90deg, #818cf8, #22d3ee)',
                      borderRadius: 2,
                      animation: 'loading-slide 1.2s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Error state */}
            {cameraStatus === 'error' && (
              <div className="camera-placeholder">
                <div style={{ fontSize: '2.5rem' }}>⚠️</div>
                <p style={{ fontWeight: 600, color: 'var(--color-danger)' }}>Camera Error</p>
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    maxWidth: 300,
                    textAlign: 'center',
                  }}
                >
                  {cameraError}
                </p>
                <button
                  onClick={startCamera}
                  className="btn btn-primary"
                  style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* ── Detected Gesture Display ── */}
          {currentGesture && (
            <div
              className="gesture-display animate-fade-in"
              role="status"
              aria-live="polite"
              aria-label={`Detected gesture: ${currentGesture.gesture || currentGesture.name}`}
            >
              <div style={{ fontSize: '2rem' }}>{currentGesture.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', fontFamily: 'Outfit, sans-serif' }}>
                  {currentGesture.gesture || currentGesture.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  Confidence: {currentGesture.confidence}%
                </div>
              </div>
              {/* Confidence bar */}
              <div className="confidence-bar-container">
                <div
                  className="confidence-bar-fill"
                  style={{ width: `${currentGesture.confidence}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Conversation Panel ── */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          {/* Panel header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>
              <FaHandsHelping style={{ verticalAlign: '-2px', marginRight: '0.4rem' }} />
              Conversation
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {/* Voice toggle */}
              <button
                onClick={toggleVoice}
                className={`btn ${voiceEnabled ? 'btn-success' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                aria-label={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
                aria-pressed={voiceEnabled}
              >
                {voiceEnabled ? <FaVolumeUp /> : <FaVolumeMute />}{' '}
                {voiceEnabled ? 'Voice ON' : 'Voice OFF'}
              </button>

              {/* Save */}
              <button
                onClick={saveConversation}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                disabled={conversation.length === 0 || saving}
                aria-label="Save conversation"
              >
                <FaSave /> {saving ? 'Saving…' : 'Save'}
              </button>

              {/* Clear */}
              <button
                onClick={clearConversation}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
                disabled={conversation.length === 0}
                aria-label="Clear conversation"
              >
                <FaTrashAlt /> Clear
              </button>
            </div>
          </div>

          {/* Conversation items */}
          <div
            className="conversation-panel"
            role="log"
            aria-label="Conversation history"
            aria-live="polite"
          >
            {conversation.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--color-text-muted)',
                  textAlign: 'center',
                  padding: '2rem',
                }}
              >
                <FaHandsHelping style={{ fontSize: '2.5rem', opacity: 0.2, marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>No gestures detected yet</p>
                <p style={{ fontSize: '0.8rem', maxWidth: 250, marginTop: '0.25rem' }}>
                  Start the camera and show hand signs to begin communicating
                </p>
              </div>
            ) : (
              conversation.map((item) => (
                <div key={item.id} className="conversation-item animate-fade-in">
                  <span className="conversation-item-emoji">{item.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600 }}>{item.gesture}</span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)',
                        marginLeft: '0.5rem',
                      }}
                    >
                      {item.confidence}% confident
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.timestamp}
                  </span>
                </div>
              ))
            )}
            <div ref={conversationEndRef} />
          </div>

          {/* Generated text summary */}
          {conversation.length > 0 && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'var(--color-surface2)',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: '0.35rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Generated Text
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                {conversation.map((c) => c.gesture).join(' → ')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pulse animation + loading keyframes */}
      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes loading-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }
      `}</style>
    </main>
  );
}
