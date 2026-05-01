import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FaSearch, FaPlay, FaFilter } from 'react-icons/fa';

const typeEmoji = { video: '🎬', audio: '🎵', pdf: '📄', image: '🖼️', text: '📝' };
const typeColors = { video: '#818cf8', audio: '#22d3ee', pdf: '#fbbf24', image: '#f472b6', text: '#60a5fa' };

export default function CourseBrowser() {
  const [lessons, setLessons] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    api.get('/lessons').then(r => {
      setLessons(r.data);
      setFiltered(r.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let f = lessons;
    if (typeFilter !== 'all') f = f.filter(l => l.type === typeFilter);
    if (search) f = f.filter(l =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.subject?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, typeFilter, lessons]);

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Browse Courses
      </h1>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <FaSearch style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '0.875rem' }} />
          <input
            type="search"
            placeholder="Search lessons..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
            aria-label="Search lessons"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ width: 'auto', minWidth: 140 }}
          aria-label="Filter by content type"
        >
          <option value="all">All Types</option>
          <option value="video">🎬 Video</option>
          <option value="audio">🎵 Audio</option>
          <option value="pdf">📄 PDF</option>
          <option value="text">📝 Text</option>
          <option value="image">🖼️ Image</option>
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem' }}>Loading lessons...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <p style={{ color: 'var(--color-text-muted)' }}>No lessons found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(l => (
            <Link
              key={l._id}
              to={`/student/lesson/${l._id}`}
              style={{ textDecoration: 'none', color: 'var(--color-text)' }}
              aria-label={`Open lesson: ${l.title}`}
            >
              <div className="card" style={{
                height: '100%', display: 'flex', flexDirection: 'column', gap: '0.875rem',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Thumbnail */}
                <div style={{
                  height: 120, borderRadius: 8,
                  background: `linear-gradient(135deg, ${typeColors[l.type] || '#818cf8'}33, ${typeColors[l.type] || '#818cf8'}11)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem',
                }}>
                  {typeEmoji[l.type] || '📝'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge" style={{
                      background: `${typeColors[l.type] || '#818cf8'}22`,
                      color: typeColors[l.type] || '#818cf8',
                      fontSize: '0.7rem',
                    }}>{l.type}</span>
                    {l.subject && <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{l.subject}</span>}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, marginBottom: '0.4rem' }}>{l.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {l.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>by {l.teacherId?.name || 'Teacher'}</span>
                  <span className="btn btn-primary" style={{ padding: '0.35rem 0.875rem', fontSize: '0.75rem', borderRadius: 6 }}>
                    <FaPlay style={{ fontSize: '0.6rem' }} /> Open
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
