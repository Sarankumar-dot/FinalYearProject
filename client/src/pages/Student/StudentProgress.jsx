import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBookmark, FaTrophy, FaBook, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function StudentProgress() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign:'center', padding:'4rem', color:'var(--color-text-muted)' }}>Loading progress...</div>;
  if (!data) return <div style={{ padding:'2rem' }}>No progress data.</div>;

  const { progress, quizResults } = data;
  const chartData = (quizResults||[]).slice(0,8).map((r,i) => ({ name:`Quiz ${i+1}`, score:r.score }));
  const totalMins = Math.round((progress?.totalTimeSpent||0)/60);
  const completed = progress?.lessonsCompleted?.length||0;
  const avgScore = quizResults?.length > 0 ? Math.round(quizResults.reduce((a,r)=>a+r.score,0)/quizResults.length) : 0;

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.75rem', fontWeight:700, marginBottom:'1.75rem' }}>My Progress</h1>

      {/* Summary cards */}
      <div className="grid-4" style={{ marginBottom:'2rem' }}>
        {[
          { icon:<FaBook />, label:'Lessons Completed', value:completed, color:'#818cf8' },
          { icon:<FaTrophy />, label:'Average Score', value:`${avgScore}%`, color:'#fbbf24' },
          { icon:<FaClock />, label:'Time Spent (mins)', value:totalMins, color:'#22d3ee' },
          { icon:<FaBookmark />, label:'Bookmarks', value:progress?.bookmarks?.length||0, color:'#f472b6' },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}22`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, fontSize:'1.1rem', flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:'1.4rem', fontWeight:800, fontFamily:'Outfit,sans-serif' }}>{s.value}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', lineHeight:1.3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Quiz score chart */}
        <div className="card">
          <h2 style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1rem' }}>Quiz Scores</h2>
          {chartData.length === 0 ? (
            <div style={{ height:180, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--color-text-muted)', fontSize:'0.875rem', background:'var(--color-surface2)', borderRadius:10 }}>
              No quizzes completed yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill:'var(--color-text-muted)', fontSize:10 }} />
                <YAxis domain={[0,100]} tick={{ fill:'var(--color-text-muted)', fontSize:10 }} />
                <Tooltip contentStyle={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:8 }} formatter={v=>[`${v}%`,'Score']} />
                <Bar dataKey="score" radius={[6,6,0,0]}>
                  {chartData.map((d,i) => (
                    <rect key={i} fill={d.score >= 70 ? '#10b981' : d.score >= 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bookmarks */}
        <div className="card">
          <h2 style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1rem' }}>Bookmarked Lessons</h2>
          {!progress?.bookmarks?.length ? (
            <p style={{ color:'var(--color-text-muted)', fontSize:'0.875rem' }}>Bookmark lessons to find them here quickly.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {progress.bookmarks.map(b => (
                <Link key={b._id||b} to={`/student/lesson/${b._id||b}`} style={{
                  display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.6rem 0.875rem',
                  background:'var(--color-surface2)', borderRadius:8, textDecoration:'none', color:'var(--color-text)',
                }}>
                  <FaBookmark style={{ color:'#f43f5e', flexShrink:0 }} />
                  <span style={{ fontSize:'0.875rem', fontWeight:500 }}>{b.title||'Lesson'}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent quiz results */}
      {quizResults?.length > 0 && (
        <div className="card" style={{ marginTop:'1.5rem' }}>
          <h2 style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1rem' }}>Recent Quiz Results</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {quizResults.slice(0,6).map(r => (
              <div key={r._id} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.75rem', background:'var(--color-surface2)', borderRadius:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{r.quizId?.title||'Quiz'}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{r.lessonId?.title||''}</div>
                </div>
                <div style={{
                  padding:'0.3rem 0.875rem', borderRadius:100, fontWeight:700, fontSize:'0.875rem',
                  background: r.score>=70 ? 'rgba(16,185,129,0.15)' : r.score>=50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                  color: r.score>=70 ? '#10b981' : r.score>=50 ? '#f59e0b' : '#ef4444',
                }}>
                  {r.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
