import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';
import TTSPlayer from '../../components/TTSPlayer';
import SignLangPanel from '../../components/SignLangPanel';
import SignLanguageAvatar from '../../components/SignLanguageAvatar';
import {
  FaArrowLeft, FaBookmark, FaCheck, FaHandPaper,
  FaClosedCaptioning, FaDownload, FaVolumeUp,
  FaSignLanguage,
} from 'react-icons/fa';

// Convert YouTube watch URL → embed URL
function toYouTubeEmbed(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      return v ? `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1&cc_load_policy=1` : null;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}?rel=0&modestbranding=1&cc_load_policy=1`;
    }
  } catch (_) {}
  return null;
}

function isYouTubeUrl(url) { return url && (url.includes('youtube.com') || url.includes('youtu.be')); }

export default function LessonViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { prefs } = useAccessibility();

  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showSignLang, setShowSignLang] = useState(false);
  const [captionIdx, setCaptionIdx] = useState(0);
  const [signAvatarActive, setSignAvatarActive] = useState(false);
  const savedVideoTime = useRef(0);

  const videoRef = useRef(null);
  const captionTimer = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [lr, qr] = await Promise.all([
          api.get(`/lessons/${id}`),
          api.get(`/quizzes?lessonId=${id}`).catch(() => ({ data: [] })),
        ]);
        setLesson(lr.data);
        if (qr.data?.length > 0) setQuiz(qr.data[0]);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
    return () => { if (captionTimer.current) clearInterval(captionTimer.current); };
  }, [id]);

  // Caption ticker for non-YouTube videos
  const captionSentences = lesson?.transcript
    ? lesson.transcript.match(/[^.!?]+[.!?]+/g) || [lesson.transcript]
    : [];

  useEffect(() => {
    if (!captionSentences.length || isYouTubeUrl(lesson?.fileUrl)) return;
    captionTimer.current = setInterval(() => {
      if (videoRef.current?.paused) return;
      setCaptionIdx(i => (i + 1) % captionSentences.length);
    }, 4000);
    return () => clearInterval(captionTimer.current);
  }, [captionSentences.length, lesson?.fileUrl]);

  const markComplete = async () => {
    try { await api.post('/progress/lesson-complete', { lessonId: id, timeSpent: 600 }); setCompleted(true); }
    catch (e) { console.error(e); }
  };

  const toggleBookmark = async () => {
    try {
      await api.post('/progress/bookmark', { lessonId: id, action: bookmarked ? 'remove' : 'add' });
      setBookmarked(b => !b);
    } catch (e) { console.error(e); }
  };

  const captionStyle = {
    fontSize: prefs.captionSize === 'large' ? '1.2rem' : prefs.captionSize === 'small' ? '0.8rem' : '1rem',
    color: prefs.captionColour || '#ffffff',
    background: prefs.captionBg || 'rgba(0,0,0,0.78)',
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>Loading lesson...
    </div>
  );
  if (!lesson) return (
    <div style={{ padding: '2rem' }}>
      <p style={{ color: 'var(--color-text-muted)' }}>Lesson not found.</p>
      <button onClick={() => navigate('/student/courses')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>← Back to Courses</button>
    </div>
  );

  const embedUrl = lesson.fileUrl ? toYouTubeEmbed(lesson.fileUrl) : null;
  const isYT = !!embedUrl;

  return (
    <div className="animate-fade-in">
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/student/courses')} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
          <FaArrowLeft /> Back
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 }}>{lesson.title}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
            {lesson.subject && <span className="badge badge-purple" style={{ fontSize: '0.65rem', marginRight: '0.4rem' }}>{lesson.subject}</span>}
            {lesson.type}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={toggleBookmark} className={`btn ${bookmarked ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.8rem' }} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark lesson'}>
            <FaBookmark /> {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          {!completed ? (
            <button onClick={markComplete} className="btn btn-success" style={{ fontSize: '0.8rem' }} aria-label="Mark as completed">
              <FaCheck /> Mark Complete
            </button>
          ) : (
            <span className="badge badge-green" style={{ padding: '0.5rem 0.875rem', borderRadius: 8 }}>✓ Completed</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* ── Main content area ─────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 300 }}>

          {/* ── VIDEO (YouTube embed) ───── */}
          {lesson.type === 'video' && isYT && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                {/* YouTube iframe */}
                {!signAvatarActive && (
                  <iframe
                    src={embedUrl}
                    title={`Video: ${lesson.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    aria-label={`Video lesson: ${lesson.title}`}
                  />
                )}
                {/* Sign Language Avatar overlay */}
                {signAvatarActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    zIndex: 5, background: '#0d0f18', borderRadius: 8,
                  }}>
                    <SignLanguageAvatar
                      text={lesson.transcript || lesson.description || lesson.title}
                      height="100%"
                    />
                  </div>
                )}
                {/* Toggle button */}
                <button
                  onClick={() => { setSignAvatarActive(s => !s); setShowSignLang(s => !s); }}
                  style={{
                    position: 'absolute', bottom: 12, right: 12, zIndex: 10,
                    background: signAvatarActive ? '#6c63ff' : 'rgba(0,0,0,0.6)',
                    border: signAvatarActive ? '2px solid #a78bfa' : '2px solid rgba(255,255,255,0.2)',
                    borderRadius: '50%', width: 48, height: 48,
                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', transition: 'all 0.25s ease',
                    boxShadow: signAvatarActive ? '0 0 16px rgba(108,99,255,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                  aria-label={signAvatarActive ? 'Hide sign language avatar' : 'Show sign language avatar'}
                  aria-pressed={signAvatarActive}
                  title={signAvatarActive ? 'Return to video' : 'Sign Language Avatar'}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                >
                  <FaSignLanguage style={{ color: '#fff', fontSize: '1.2rem' }} />
                </button>
              </div>
              {lesson.transcript && showCaptions && !signAvatarActive && (
                <div aria-live="polite" style={{
                  ...captionStyle,
                  padding: '0.75rem 1.25rem', textAlign: 'center',
                  fontWeight: 500, lineHeight: 1.6, fontSize: '0.9rem',
                }}>
                  📝 {lesson.transcript.substring(0, 280)}
                  {lesson.transcript.length > 280 && '…'}
                </div>
              )}
            </div>
          )}

          {/* ── VIDEO (direct file URL) ── */}
          {lesson.type === 'video' && !isYT && lesson.fileUrl && (
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              {/* Direct video element */}
              <video
                ref={videoRef}
                src={lesson.fileUrl}
                controls
                style={{
                  width: '100%', borderRadius: 12, maxHeight: 480, background: '#000',
                }}
                aria-label={`Video lesson: ${lesson.title}`}
              />
              {/* Sign Language Avatar overlay */}
              {signAvatarActive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  zIndex: 5, background: '#0d0f18', borderRadius: 12,
                }}>
                  <SignLanguageAvatar
                    text={lesson.transcript || lesson.description || lesson.title}
                    height="100%"
                  />
                </div>
              )}
              {/* Toggle button */}
              <button
                onClick={() => {
                  setSignAvatarActive(s => {
                    if (!s && videoRef.current) {
                      savedVideoTime.current = videoRef.current.currentTime;
                      videoRef.current.pause();
                    }
                    if (s && videoRef.current) {
                      videoRef.current.currentTime = savedVideoTime.current;
                      videoRef.current.play().catch(() => {});
                    }
                    setShowSignLang(!s);
                    return !s;
                  });
                }}
                style={{
                  position: 'absolute', bottom: signAvatarActive ? 70 : 55, right: 12, zIndex: 10,
                  background: signAvatarActive ? '#6c63ff' : 'rgba(0,0,0,0.6)',
                  border: signAvatarActive ? '2px solid #a78bfa' : '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '50%', width: 48, height: 48,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'all 0.25s ease',
                  boxShadow: signAvatarActive ? '0 0 16px rgba(108,99,255,0.5)' : '0 2px 8px rgba(0,0,0,0.3)',
                }}
                aria-label={signAvatarActive ? 'Hide sign language avatar' : 'Show sign language avatar'}
                aria-pressed={signAvatarActive}
                title={signAvatarActive ? 'Return to video' : 'Sign Language Avatar'}
                onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                <FaSignLanguage style={{ color: '#fff', fontSize: '1.2rem' }} />
              </button>
              {/* Captions — hidden during avatar mode */}
              {lesson.transcript && showCaptions && !signAvatarActive && captionSentences[captionIdx] && (
                <div aria-live="polite" style={{
                  ...captionStyle,
                  position: 'absolute', bottom: 60, left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '0.5rem 1rem', borderRadius: 6,
                  maxWidth: '80%', textAlign: 'center', fontWeight: 600,
                }}>
                  {captionSentences[captionIdx].trim()}
                </div>
              )}
            </div>
          )}

          {/* ── VIDEO — no URL ── */}
          {lesson.type === 'video' && !lesson.fileUrl && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎬</div>
              <p style={{ color: 'var(--color-text-muted)' }}>No video URL provided for this lesson.</p>
            </div>
          )}

          {/* ── AUDIO ── */}
          {lesson.type === 'audio' && (
            <div className="card" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎵</div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.875rem' }}>{lesson.description}</p>
              {lesson.fileUrl ? (
                <audio controls style={{ width: '100%' }} aria-label={`Audio: ${lesson.title}`}>
                  <source src={lesson.fileUrl} />
                </audio>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Audio file URL not provided.</p>
              )}
            </div>
          )}

          {/* ── PDF ── */}
          {lesson.type === 'pdf' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              {lesson.fileUrl ? (
                <>
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(lesson.fileUrl)}&embedded=true`}
                    style={{ width: '100%', height: 500, border: 'none', borderRadius: 8 }}
                    title={lesson.title}
                    aria-label={`PDF document: ${lesson.title}`}
                  />
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                    <a href={lesson.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                      <FaDownload /> Open PDF
                    </a>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📄</div>
                  <p style={{ color: 'var(--color-text-muted)' }}>PDF URL not provided.</p>
                </div>
              )}
            </div>
          )}

          {/* ── IMAGE ── */}
          {lesson.type === 'image' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              {lesson.fileUrl && (
                <img src={lesson.fileUrl} alt={lesson.altText || lesson.title}
                  style={{ width: '100%', borderRadius: 8, objectFit: 'contain', maxHeight: 450 }} />
              )}
              {lesson.altText && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--color-surface2)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>
                    🔊 Image Description (for screen readers and TTS)
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{lesson.altText}</p>
                  <div style={{ marginTop: '0.75rem' }}><TTSPlayer text={lesson.altText} label="Read description aloud" /></div>
                </div>
              )}
            </div>
          )}

          {/* ── TEXT LESSON ── */}
          {lesson.type === 'text' && lesson.textContent && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>📖 Lesson Content</h2>
                <TTSPlayer text={lesson.textContent} label="Read lesson aloud" />
              </div>
              <div style={{ lineHeight: 2, whiteSpace: 'pre-wrap', fontSize: 'inherit', color: 'var(--color-text)' }}>
                {lesson.textContent}
              </div>
            </div>
          )}

          {/* Description if no main content */}
          {lesson.description && !lesson.textContent && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>About This Lesson</h2>
                <TTSPlayer text={lesson.description} />
              </div>
              <p style={{ lineHeight: 1.8, fontSize: '1.25rem', fontWeight: 500, color: 'var(--color-text)' }}>{lesson.description}</p>
            </div>
          )}

          {/* ── TRANSCRIPT ── */}
          {lesson.transcript && lesson.type !== 'text' && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>📝 Transcript / Captions</h2>
                <TTSPlayer text={lesson.transcript} label="Read transcript aloud" />
              </div>
              <div style={{ maxHeight: 350, overflowY: 'auto', fontSize: '1.15rem', lineHeight: 2, color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap' }}>
                {lesson.transcript}
              </div>
            </div>
          )}

          {/* Tags */}
          {lesson.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {lesson.tags.map(t => (
                <span key={t} className="badge badge-purple" style={{ fontSize: '0.75rem' }}>#{t}</span>
              ))}
            </div>
          )}

          {/* Quiz CTA */}
          {quiz && (
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(139,92,246,0.05))',
              border: '1px solid rgba(108,99,255,0.3)', marginBottom: '1.5rem',
            }}>
              <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>📋 Quiz Available</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                <strong>{quiz.title}</strong> · {quiz.questions?.length || 0} questions · Test what you've learned
              </p>
              <Link to={`/student/quiz/${quiz._id}`} className="btn btn-primary">Start Quiz →</Link>
            </div>
          )}
        </div>

        {/* ── Right sidebar ─────────────────────────────────────────────── */}
        <div style={{ width: 280, flexShrink: 0 }}>

          {/* Accessibility controls */}
          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '1rem' }}>♿ Accessibility Tools</h3>

            {/* Captions toggle */}
            {(lesson.type === 'video' || lesson.type === 'audio') && lesson.transcript && (
              <button
                onClick={() => setShowCaptions(s => !s)}
                className={`btn ${showCaptions ? 'btn-primary' : 'btn-secondary'}`}
                style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem', fontSize: '0.8rem' }}
                aria-pressed={showCaptions}
              >
                <FaClosedCaptioning /> {showCaptions ? 'Captions ON' : 'Captions OFF'}
              </button>
            )}

            {/* Sign Language toggle — activates avatar on video */}
            <button
              onClick={() => {
                const newState = !showSignLang;
                setShowSignLang(newState);
                // For video lessons, also toggle the avatar overlay
                if (lesson.type === 'video') {
                  setSignAvatarActive(newState);
                  if (newState && videoRef.current) {
                    savedVideoTime.current = videoRef.current.currentTime;
                    videoRef.current.pause();
                  }
                  if (!newState && videoRef.current) {
                    videoRef.current.currentTime = savedVideoTime.current;
                    videoRef.current.play().catch(() => {});
                  }
                }
              }}
              className={`btn ${showSignLang ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem', fontSize: '0.8rem' }}
              aria-pressed={showSignLang}
            >
              <FaSignLanguage /> Sign Language Avatar {showSignLang ? 'ON' : 'OFF'}
            </button>

            {lesson.description && (
              <div style={{ marginTop: '0.25rem' }}>
                <TTSPlayer text={lesson.description} label="Read description" />
              </div>
            )}

            {!lesson.transcript && lesson.type === 'video' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                💡 Tip: Add a transcript when uploading to enable closed captions for hearing-impaired students.
              </p>
            )}
          </div>

          {/* Sign language panel */}
          {showSignLang && (
            <SignLangPanel keywords={lesson.tags?.length > 0 ? lesson.tags : [lesson.subject || 'general']} />
          )}
        </div>
      </div>
    </div>
  );
}
