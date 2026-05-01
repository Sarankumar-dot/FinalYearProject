import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function SignLangPanel({ keywords = [] }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!keywords.length) { setLoading(false); return; }
    api.get(`/signlang?keywords=${keywords.join(',')}`)
      .then(r => { setVideos(Array.isArray(r.data) ? r.data : r.data ? [r.data] : []); })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [keywords.join(',')]);

  if (loading) return (
    <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
      Loading sign language videos...
    </div>
  );

  if (videos.length === 0) return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤟</div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        No sign language videos found for: {keywords.join(', ')}
      </p>
    </div>
  );

  const v = videos[active];
  const isYouTube = v.videoUrl?.includes('youtube') || v.videoUrl?.includes('youtu.be');
  const embedUrl = isYouTube
    ? v.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
    : v.videoUrl;

  return (
    <div className="card animate-fade-in">
      <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🤟 Sign Language
      </h3>

      {/* Video */}
      <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: '0.75rem', background: '#000', aspectRatio: '16/9' }}>
        {isYouTube ? (
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
            title={`Sign language video for ${v.keyword}`}
            aria-label={`Sign language explanation for ${v.keyword}`}
          />
        ) : (
          <video src={v.videoUrl} controls style={{ width: '100%', height: '100%' }}
            aria-label={`Sign language video: ${v.keyword}`} />
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
        <strong style={{ color: 'var(--color-text)' }}>{v.keyword}</strong>
        {v.description && ` — ${v.description}`}
      </p>

      {/* Keyword tabs */}
      {videos.length > 1 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {videos.map((vid, i) => (
            <button key={vid._id} onClick={() => setActive(i)}
              className={`badge ${i === active ? 'badge-purple' : ''}`}
              style={{
                cursor: 'pointer', border: 'none',
                background: i === active ? 'rgba(108,99,255,0.3)' : 'var(--color-surface2)',
                color: i === active ? '#a78bfa' : 'var(--color-text-muted)',
              }}
              aria-pressed={i === active}
            >
              #{vid.keyword}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
