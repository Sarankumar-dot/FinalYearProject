import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';

const SAMPLES = [
  { keyword:'photosynthesis', videoUrl:'https://www.youtube.com/embed/UPBMG5EYydo', description:'How plants convert sunlight to energy', subject:'Biology' },
  { keyword:'algebra', videoUrl:'https://www.youtube.com/embed/4Y8PYXaTvPk', description:'Basic algebra concepts in sign language', subject:'Mathematics' },
  { keyword:'gravity', videoUrl:'https://www.youtube.com/embed/9Cd36WJ-4K0', description:'Gravity explained in sign language', subject:'Physics' },
  { keyword:'democracy', videoUrl:'https://www.youtube.com/embed/4f7kI4WTOBU', description:'Democracy in sign language', subject:'Social Studies' },
];

export default function SignLangLibrary() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ keyword:'', videoUrl:'', description:'', subject:'' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/signlang').then(r=>setEntries(r.data)).catch(console.error).finally(()=>setLoading(false));
  useEffect(load, []);

  const seedSamples = async () => {
    for (const s of SAMPLES) {
      await api.post('/signlang', s).catch(()=>{});
    }
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (editing) {
        await api.put(`/signlang/${editing}`, form);
        setEditing(null);
      } else {
        await api.post('/signlang', form);
      }
      setForm({ keyword:'', videoUrl:'', description:'', subject:'' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry');
    }
  };

  const handleEdit = (e) => { setEditing(e._id); setForm({ keyword:e.keyword, videoUrl:e.videoUrl, description:e.description, subject:e.subject||'' }); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/signlang/${id}`); load(); };

  return (
    <div className="animate-fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.75rem', fontWeight:700 }}>🤟 Sign Language Library</h1>
        {entries.length === 0 && (
          <button onClick={seedSamples} className="btn btn-secondary" style={{ fontSize:'0.8rem' }}>
            + Seed Sample Videos
          </button>
        )}
      </div>

      {error && <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', borderRadius:8, padding:'0.75rem', marginBottom:'1rem', fontSize:'0.875rem' }}>{error}</div>}

      {/* Add/Edit form */}
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <h2 style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1rem' }}>{editing ? '✏️ Edit Entry' : '+ Add New Sign Language Video'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="sl-keyword">Keyword (e.g. photosynthesis)</label>
              <input id="sl-keyword" value={form.keyword} onChange={e=>setForm(f=>({...f,keyword:e.target.value}))} placeholder="photosynthesis" required aria-label="Sign language keyword" />
            </div>
            <div className="form-group">
              <label htmlFor="sl-subject">Subject</label>
              <input id="sl-subject" value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))} placeholder="Biology" aria-label="Subject area" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="sl-url">Video URL (YouTube embed or direct video URL)</label>
            <input id="sl-url" value={form.videoUrl} onChange={e=>setForm(f=>({...f,videoUrl:e.target.value}))} placeholder="https://www.youtube.com/embed/xxxxx" required aria-label="Video URL" />
          </div>
          <div className="form-group">
            <label htmlFor="sl-desc">Description</label>
            <input id="sl-desc" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief description of the sign language video" aria-label="Video description" />
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button type="submit" className="btn btn-primary">
              {editing ? <><FaSave /> Update</> : <><FaPlus /> Add Entry</>}
            </button>
            {editing && <button type="button" onClick={()=>{ setEditing(null); setForm({ keyword:'',videoUrl:'',description:'',subject:'' }); }} className="btn btn-secondary">Cancel</button>}
          </div>
        </form>
      </div>

      {/* Library table */}
      {loading ? <p style={{ color:'var(--color-text-muted)' }}>Loading library...</p> :
       entries.length === 0 ? <p style={{ color:'var(--color-text-muted)' }}>No entries yet. Add some or click "Seed Sample Videos".</p> : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
          {entries.map(e => (
            <div key={e._id} className="card" style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', padding:'0.875rem 1.25rem' }}>
              <div style={{ flex:1, minWidth:150 }}>
                <div style={{ fontWeight:700, fontSize:'0.9rem' }}>#{e.keyword}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{e.subject && `${e.subject} · `}{e.description||'No description'}</div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <button onClick={()=>handleEdit(e)} className="btn btn-secondary" style={{ fontSize:'0.775rem' }} aria-label={`Edit ${e.keyword}`}><FaEdit /></button>
                <button onClick={()=>handleDelete(e._id)} className="btn btn-danger" style={{ fontSize:'0.775rem' }} aria-label={`Delete ${e.keyword}`}><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
