import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { FaEdit, FaTrash, FaQuestionCircle, FaEye } from 'react-icons/fa';

export default function LessonManager() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    api.get('/lessons').then(r => setLessons(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await api.delete(`/lessons/${id}`);
    load();
  };

  const typeEmoji = { video:'🎬', audio:'🎵', pdf:'📄', image:'🖼️', text:'📝' };

  return (
    <div className="animate-fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.75rem', fontWeight:700 }}>My Lessons</h1>
        <Link to="/teacher/upload" className="btn btn-primary">+ Upload New</Link>
      </div>

      {loading ? <p style={{ color:'var(--color-text-muted)' }}>Loading...</p> :
       lessons.length === 0 ? (
        <div style={{ textAlign:'center', padding:'4rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📚</div>
          <p style={{ color:'var(--color-text-muted)', marginBottom:'1rem' }}>No lessons yet.</p>
          <Link to="/teacher/upload" className="btn btn-primary">Upload your first lesson</Link>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {lessons.map(l => (
            <div key={l._id} className="card" style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
              <div style={{ fontSize:'1.75rem', flexShrink:0 }}>{typeEmoji[l.type]||'📝'}</div>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ fontWeight:700, marginBottom:'0.2rem' }}>{l.title}</div>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  <span className="badge badge-purple" style={{ fontSize:'0.7rem' }}>{l.type}</span>
                  {l.subject && <span className="badge badge-blue" style={{ fontSize:'0.7rem' }}>{l.subject}</span>}
                  <span style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{l.viewCount||0} views</span>
                  {l.transcript && <span className="badge badge-green" style={{ fontSize:'0.7rem' }}>📝 transcript</span>}
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                <button onClick={() => navigate(`/teacher/quiz/${l._id}`)} className="btn btn-secondary" style={{ fontSize:'0.775rem' }} title="Create/manage quiz">
                  <FaQuestionCircle />
                </button>
                <button onClick={() => handleDelete(l._id, l.title)} className="btn btn-danger" style={{ fontSize:'0.775rem' }} aria-label={`Delete lesson: ${l.title}`}>
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
