import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaYoutube, FaLink, FaUpload, FaCheckCircle, FaSpinner, FaBook, FaPlay } from 'react-icons/fa';

const TYPES = [
  { key: 'video', label: '🎬 Video', hint: 'YouTube or direct MP4 link' },
  { key: 'audio', label: '🎵 Audio', hint: 'Podcast, lecture recording' },
  { key: 'pdf', label: '📄 PDF', hint: 'Document or slides' },
  { key: 'image', label: '🖼️ Image', hint: 'Diagram or chart' },
  { key: 'text', label: '📝 Text', hint: 'Written article or notes' },
];

// Pre-built demo lessons a teacher can seed with one click
const DEMO_LESSONS = [
  {
    title: 'Introduction to Photosynthesis',
    subject: 'Biology',
    type: 'video',
    description: 'Learn how plants convert sunlight and CO₂ into glucose and oxygen.',
    fileUrl: 'https://www.youtube.com/watch?v=UPBMG5EYydo',
    transcript: 'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of glucose. This process occurs primarily in the chloroplasts of plant cells, where the green pigment chlorophyll absorbs light energy.',
    tags: ['photosynthesis', 'plants', 'biology', 'chlorophyll'],
  },
  {
    title: 'The Water Cycle Explained',
    subject: 'Geography',
    type: 'video',
    description: 'How water moves through Earths systems — evaporation, condensation, precipitation.',
    fileUrl: 'https://www.youtube.com/watch?v=al-do-HGuIk',
    transcript: 'The water cycle describes how water evaporates from the surface of the earth, rises into the atmosphere, cools and condenses into rain or snow in clouds, and falls again to the surface as precipitation.',
    tags: ['water cycle', 'geography', 'evaporation', 'condensation'],
  },
  {
    title: 'Newton\'s Three Laws of Motion',
    subject: 'Physics',
    type: 'text',
    description: 'An accessible text explanation of Newton\'s fundamental laws of motion.',
    textContent: `Newton's Three Laws of Motion\n\n1. First Law (Inertia)\nAn object at rest stays at rest, and an object in motion stays in motion, unless acted upon by an external force. This is why passengers lurch forward when a car brakes suddenly.\n\n2. Second Law (F = ma)\nForce equals mass times acceleration. A heavier object requires more force to accelerate at the same rate as a lighter one. This explains why it's harder to push a heavy box than a light one.\n\n3. Third Law (Action-Reaction)\nFor every action, there is an equal and opposite reaction. When you push against a wall, the wall pushes back with equal force. Rockets work by expelling gas downward, which propels the rocket upward.`,
    tags: ['physics', 'newton', 'laws of motion', 'forces'],
  },
  {
    title: 'Introduction to Algebra',
    subject: 'Mathematics',
    type: 'video',
    description: 'Understand variables, expressions, and basic algebraic equations.',
    fileUrl: 'https://www.youtube.com/watch?v=MlMozefMezA',
    transcript: 'Algebra is a branch of mathematics dealing with symbols and the rules for manipulating those symbols. In elementary algebra, those symbols represent quantities without fixed values, known as variables. Let x represent an unknown number. If x plus 3 equals 7, then x must equal 4.',
    tags: ['algebra', 'mathematics', 'variables', 'equations'],
  },
];

export default function UploadLesson() {
  const navigate = useNavigate();
  const [type, setType] = useState('video');
  const [inputMode, setInputMode] = useState('url'); // 'url' | 'file' | 'text'
  const [form, setForm] = useState({ title: '', description: '', subject: '', tags: '', fileUrl: '', altText: '', textContent: '', transcript: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | done | error
  const [createdLesson, setCreatedLesson] = useState(null);
  const [error, setError] = useState('');
  const [seedStatus, setSeedStatus] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isYouTube = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Lesson title is required.'); return; }
    if (type !== 'text' && inputMode === 'file' && !file) { setError('Please select a file to upload.'); return; }
    setStatus('uploading'); setError('');
    try {
      const tagList = form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      let payload;
      let headers = {};
      if (type !== 'text' && inputMode === 'file') {
        payload = new FormData();
        payload.append('title', form.title);
        payload.append('description', form.description);
        payload.append('subject', form.subject);
        payload.append('type', type);
        payload.append('altText', form.altText);
        payload.append('textContent', form.textContent);
        payload.append('transcript', form.transcript);
        payload.append('tags', tagList.join(','));
        payload.append('file', file);
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        payload = { ...form, type, tags: tagList };
      }
      const res = await api.post('/upload', payload, { headers });
      setCreatedLesson(res.data.lesson);
      setStatus('done');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lesson. Check the server is running.');
      setStatus('idle');
    }
  };

  const seedDemoLesson = async (demo) => {
    setSeedStatus('loading');
    try {
      const tagList = demo.tags || [];
      await api.post('/upload', { ...demo, tags: tagList });
      setSeedStatus('done');
      setTimeout(() => setSeedStatus(''), 2000);
    } catch (err) {
      setSeedStatus('error');
      setTimeout(() => setSeedStatus(''), 3000);
    }
  };

  const seedAllDemos = async () => {
    setSeedStatus('loading');
    for (const d of DEMO_LESSONS) {
      await api.post('/upload', { ...d, tags: d.tags }).catch(() => {});
    }
    setSeedStatus('done');
    setTimeout(() => { setSeedStatus(''); navigate('/teacher/lessons'); }, 1500);
  };

  // ─── Success screen ──────────────────────────────────────────────────────────
  if (status === 'done' && createdLesson) return (
    <div className="animate-fade-in" style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', padding: '3rem 0' }}>
      <FaCheckCircle style={{ fontSize: '4rem', color: '#10b981', marginBottom: '1rem' }} />
      <h2 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Lesson Created!
      </h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        "{createdLesson?.title}" is live and visible to students.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => { setStatus('idle'); setCreatedLesson(null); setForm({ title: '', description: '', subject: '', tags: '', fileUrl: '', altText: '', textContent: '', transcript: '' }); setFile(null); }} className="btn btn-secondary">
          Add Another
        </button>
        {createdLesson?._id && (
          <button onClick={() => navigate(`/teacher/quiz/${createdLesson._id}`)} className="btn btn-primary">
            📋 Create Quiz
          </button>
        )}
        <button onClick={() => navigate('/teacher/lessons')} className="btn btn-secondary">
          Manage Lessons
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
        Upload Lesson
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Create accessible lessons with video, audio, PDF, images or text.
      </p>

      {/* ─── Demo seed panel ─────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.75rem', background: 'linear-gradient(135deg, rgba(108,99,255,0.07), rgba(0,212,170,0.05))', border: '1px solid rgba(108,99,255,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>⚡ Quick Start — Demo Lessons</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Seed ready-made lessons so students have content to browse instantly.</p>
          </div>
          <button onClick={seedAllDemos} className="btn btn-primary" disabled={seedStatus === 'loading'} style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
            {seedStatus === 'loading' ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Seeding...</> :
             seedStatus === 'done' ? '✓ Done!' : '🚀 Seed 4 Demo Lessons'}
          </button>
        </div>
        {/* Individual lesson cards */}
        <div className="grid-2" style={{ marginTop: '1rem', gap: '0.5rem' }}>
          {DEMO_LESSONS.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--color-surface2)', borderRadius: 8 }}>
              <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{d.type === 'video' ? '🎬' : '📝'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{d.subject}</div>
              </div>
              <button onClick={() => seedDemoLesson(d)} className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.625rem', flexShrink: 0 }}>+ Add</button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.875rem', marginBottom: '1rem' }} role="alert">{error}</div>
      )}

      {/* ─── Upload form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>

        {/* Content type */}
        <div className="form-group">
          <label>Content Type</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {TYPES.map(t => (
              <button key={t.key} type="button" onClick={() => { setType(t.key); setInputMode(t.key === 'text' ? 'text' : 'url'); }}
                className={`btn ${type === t.key ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                aria-pressed={type === t.key}
              >{t.label}</button>
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
            {TYPES.find(t => t.key === type)?.hint}
          </p>
        </div>

        {/* URL / File toggle for non-text */}
        {type !== 'text' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button type="button" onClick={() => setInputMode('url')}
              className={`btn ${inputMode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}><FaLink /> Paste URL
            </button>
            <button type="button" onClick={() => setInputMode('file')}
              className={`btn ${inputMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}><FaUpload /> Upload File
            </button>

          </div>
        )}

        {/* URL input */}
        {type !== 'text' && inputMode === 'url' && (
          <div className="form-group">
            <label htmlFor="lesson-url">
              {type === 'video' ? '🎬 Video URL' : type === 'audio' ? '🎵 Audio URL' : type === 'pdf' ? '📄 PDF URL' : '🖼️ Image URL'}
              <span style={{ color: '#10b981', fontSize: '0.75rem', marginLeft: '0.5rem' }}>✓ No cloud account needed</span>
            </label>
            <input id="lesson-url" type="url"
              value={form.fileUrl}
              onChange={e => set('fileUrl', e.target.value)}
              placeholder={type === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://example.com/file.mp4'}
              aria-label="File URL"
            />
            {type === 'video' && form.fileUrl && isYouTube(form.fileUrl) && (
              <p style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.3rem' }}>✓ YouTube URL detected — will embed player with captions</p>
            )}
            {type === 'video' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.3rem' }}>
                Supported: YouTube links, direct .mp4/.webm URLs from any public server
              </p>
            )}
          </div>
        )}

        {/* File upload */}
        {type !== 'text' && inputMode === 'file' && (
          <div className="form-group">
            <label>Select File</label>
            <div style={{ padding: '2rem', border: '2px dashed var(--color-border)', borderRadius: 12, textAlign: 'center', background: 'var(--color-surface2)' }}>
              <input 
                type="file" 
                id="lesson-file" 
                onChange={e => setFile(e.target.files[0])} 
                style={{ display: 'none' }} 
                accept={type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : type === 'pdf' ? '.pdf' : 'image/*'}
              />
              <label htmlFor="lesson-file" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FaUpload style={{ fontSize: '2rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }} />
                <span style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--color-text)' }}>
                  {file ? file.name : 'Click to browse files'}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  {type === 'video' ? 'MP4, WebM (Max 500MB)' : type === 'audio' ? 'MP3, WAV' : type === 'pdf' ? 'PDF Documents' : 'JPEG, PNG images'}
                </span>
              </label>
            </div>
            {file && (
              <button type="button" onClick={() => setFile(null)} className="btn btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                Remove File
              </button>
            )}
          </div>
        )}

        {/* Title + Subject */}
        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="lesson-title">Lesson Title *</label>
            <input id="lesson-title" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Introduction to Photosynthesis" required aria-label="Lesson title" />
          </div>
          <div className="form-group">
            <label htmlFor="lesson-subject">Subject</label>
            <input id="lesson-subject" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g. Biology" aria-label="Subject" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lesson-desc">Description *</label>
          <textarea id="lesson-desc" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief summary visible in the lesson card..." required aria-label="Lesson description" />
        </div>

        {/* Text content (for text type) */}
        {type === 'text' && (
          <div className="form-group">
            <label htmlFor="lesson-text">Lesson Content * <span style={{ fontSize: '0.75rem', color: '#10b981' }}>— will be read aloud by TTS</span></label>
            <textarea id="lesson-text" rows={10} value={form.textContent} onChange={e => set('textContent', e.target.value)} placeholder="Write the full lesson content here. It will be displayed and also offered as text-to-speech audio for visually impaired students." required aria-label="Lesson text content" />
          </div>
        )}

        {/* Image alt-text */}
        {type === 'image' && (
          <div className="form-group">
            <label htmlFor="lesson-alt">Alt-Text Description * <span style={{ fontSize: '0.75rem', color: '#10b981' }}>— read aloud for blind students</span></label>
            <textarea id="lesson-alt" rows={4} value={form.altText} onChange={e => set('altText', e.target.value)} placeholder="Describe the image in detail. E.g: 'A diagram showing the human digestive system with labeled organs including the stomach, small intestine, and large intestine.'" required={type === 'image'} aria-label="Alternative text for image" />
          </div>
        )}

        {/* Transcript (for video/audio) */}
        {(type === 'video' || type === 'audio') && (
          <div className="form-group">
            <label htmlFor="lesson-transcript">
              Transcript / Captions <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>— for hearing-impaired students and TTS</span>
            </label>
            <textarea id="lesson-transcript" rows={5} value={form.transcript} onChange={e => set('transcript', e.target.value)} placeholder="Paste the video/audio transcript here. This appears as closed captions and can be read aloud by screen readers. (Auto-generated with OpenAI key)" aria-label="Video or audio transcript" />
          </div>
        )}

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="lesson-tags">
            Topic Tags <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>(comma-separated — used to match sign language videos)</span>
          </label>
          <input id="lesson-tags" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="e.g. photosynthesis, plants, biology" aria-label="Topic tags" />
        </div>

        <button type="submit" className="btn btn-primary"
          disabled={status === 'uploading'}
          style={{ fontSize: '1rem', padding: '0.8rem 2.5rem' }}
          aria-label="Create lesson"
        >
          {status === 'uploading'
            ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Creating...</>
            : <><FaBook /> Create Lesson</>}
        </button>
      </form>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
