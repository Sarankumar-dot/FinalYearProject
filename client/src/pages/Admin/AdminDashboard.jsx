import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FaUsers, FaBook, FaHandPaper, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total:0, students:0, teachers:0, admins:0 });
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/users/stats').catch(()=>({ data:{ total:0, students:0, teachers:0, admins:0 } })),
      api.get('/lessons').catch(()=>({ data:[] })),
    ]).then(([sr, lr]) => { setStats(sr.data); setLessons(lr.data); });
  }, []);

  const cards = [
    { icon:<FaUsers />, label:'Total Users', value:stats.total, color:'#818cf8', link:'/admin/users' },
    { icon:<FaUsers />, label:'Students', value:stats.students, color:'#22d3ee' },
    { icon:<FaUsers />, label:'Teachers', value:stats.teachers, color:'#fbbf24' },
    { icon:<FaBook />, label:'Total Lessons', value:lessons.length, color:'#60a5fa' },
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.75rem', fontWeight:700, marginBottom:'1.75rem' }}>
        Admin Dashboard
      </h1>

      <div className="grid-4" style={{ marginBottom:'2rem' }}>
        {cards.map(c => (
          <div key={c.label} className="stat-card" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${c.color}22`, display:'flex', alignItems:'center', justifyContent:'center', color:c.color, fontSize:'1.1rem', flexShrink:0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize:'1.5rem', fontWeight:800, fontFamily:'Outfit,sans-serif' }}>{c.value}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontWeight:700, marginBottom:'1rem' }}>Quick Actions</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            <Link to="/admin/users" className="btn btn-secondary" style={{ justifyContent:'center' }}><FaUsers /> Manage Users</Link>
            <Link to="/admin/signlang" className="btn btn-secondary" style={{ justifyContent:'center' }}><FaHandPaper /> Sign Language Library</Link>
          </div>
        </div>
        <div className="card">
          <h2 style={{ fontWeight:700, marginBottom:'1rem' }}>Platform Status</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {[
              { label:'Auth System', status:'Active', color:'#10b981' },
              { label:'File Storage', status:'Cloudinary', color:'#10b981' },
              { label:'Speech-to-Text', status:'Whisper API', color:'#10b981' },
              { label:'Text-to-Speech', status:'Web Speech', color:'#10b981' },
            ].map(s=>(
              <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0.625rem', background:'var(--color-surface2)', borderRadius:6 }}>
                <span style={{ fontSize:'0.8rem' }}>{s.label}</span>
                <span style={{ fontSize:'0.75rem', color:s.color, fontWeight:600 }}>● {s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
