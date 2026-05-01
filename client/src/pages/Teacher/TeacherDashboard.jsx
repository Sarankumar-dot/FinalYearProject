import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FaBook, FaEye, FaUpload, FaQuestionCircle } from 'react-icons/fa';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/lessons').then(r => setLessons(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalViews = lessons.reduce((a, l) => a + (l.viewCount || 0), 0);

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.75rem', fontWeight:700 }}>
          Teacher Dashboard
        </h1>
        <p style={{ color:'var(--color-text-muted)', marginTop:'0.25rem' }}>Manage your lessons and track student engagement.</p>
      </div>

      {/* Stat cards */}
      <div className="grid-3" style={{ marginBottom:'2rem' }}>
        {[
          { icon:<FaBook />, label:'My Lessons', value:lessons.length, color:'#22d3ee' },
          { icon:<FaEye />, label:'Total Views', value:totalViews, color:'#818cf8' },
          { icon:<FaQuestionCircle />, label:'Quizzes', value:'—', color:'#fbbf24' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:48, height:48, borderRadius:12, background:`${s.color}22`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, fontSize:'1.25rem', flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:'1.5rem', fontWeight:800, fontFamily:'Outfit,sans-serif' }}>{s.value}</div>
              <div style={{ fontSize:'0.775rem', color:'var(--color-text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontWeight:700, marginBottom:'1rem' }}>Quick Actions</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <Link to="/teacher/upload" className="btn btn-primary" style={{ justifyContent:'center' }}><FaUpload /> Upload New Lesson</Link>
            <Link to="/teacher/lessons" className="btn btn-secondary" style={{ justifyContent:'center' }}><FaBook /> Manage Lessons</Link>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontWeight:700, marginBottom:'1rem' }}>Recent Lessons</h2>
          {loading ? <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem' }}>Loading...</p> :
           lessons.length === 0 ? <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem' }}>No lessons uploaded yet.</p> : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {lessons.slice(0,4).map(l => (
                <div key={l._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.6rem 0.875rem', background:'var(--color-surface2)', borderRadius:8 }}>
                  <span style={{ fontSize:'0.875rem', fontWeight:500 }}>{l.title}</span>
                  <span style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{l.viewCount || 0} views</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
