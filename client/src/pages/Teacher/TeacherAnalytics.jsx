import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TeacherAnalytics() {
  const [lessons, setLessons] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/lessons'), api.get('/progress/teacher-stats')])
      .then(([lr, sr]) => { setLessons(lr.data); setStats(sr.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const viewData = lessons.map(l => ({ name: l.title.substring(0,20), views: l.viewCount || 0 }));
  const typeCount = lessons.reduce((a, l) => { a[l.type] = (a[l.type]||0)+1; return a; }, {});
  const typeData = Object.entries(typeCount).map(([k,v]) => ({ name:k, value:v }));
  const COLORS = ['#818cf8','#22d3ee','#fbbf24','#f472b6','#60a5fa'];

  if (loading) return <div style={{ textAlign:'center', padding:'4rem', color:'var(--color-text-muted)' }}>Loading analytics...</div>;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.75rem', fontWeight:700, marginBottom:'1.75rem' }}>Analytics</h1>

      <div className="grid-2" style={{ marginBottom:'2rem' }}>
        <div className="card">
          <h2 style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1rem' }}>Lesson Views</h2>
          {viewData.length === 0 ? <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem' }}>No data yet.</p> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={viewData}>
                <XAxis dataKey="name" tick={{ fill:'var(--color-text-muted)', fontSize:10 }} />
                <YAxis tick={{ fill:'var(--color-text-muted)', fontSize:10 }} />
                <Tooltip contentStyle={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:8 }} />
                <Bar dataKey="views" fill="#22d3ee" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1rem' }}>Content Type Breakdown</h2>
          {typeData.length === 0 ? <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem' }}>No data yet.</p> : (
            <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={4}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1 }}>
                {typeData.map((d,i) => (
                  <div key={d.name} style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:COLORS[i % COLORS.length], flexShrink:0 }} />
                    <span style={{ fontSize:'0.8rem', color:'var(--color-text-muted)' }}>{d.name}: <strong style={{ color:'var(--color-text)' }}>{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1rem' }}>Quiz Performance by Lesson</h2>
        {stats.length === 0 ? (
          <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem' }}>No quiz results yet. Assign quizzes to lessons and have students complete them.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {stats.map(s => (
              <div key={s._id} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.75rem', background:'var(--color-surface2)', borderRadius:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.875rem', fontWeight:600 }}>Quiz {s._id?.slice(-6)}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{s.totalAttempts} attempts</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <div style={{ height:6, width:100, background:'var(--color-border)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${s.avgScore}%`, background:'linear-gradient(90deg,#818cf8,#22d3ee)', borderRadius:3 }} />
                  </div>
                  <span style={{ fontSize:'0.875rem', fontWeight:700 }}>{Math.round(s.avgScore)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
