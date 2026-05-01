import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { FaBook, FaTrophy, FaClock, FaBookmark, FaArrowRight, FaPlay } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import HearingImpairedIntro from '../../components/HearingImpairedIntro';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [recentLessons, setRecentLessons] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [progRes, lessonsRes] = await Promise.all([
          api.get('/progress'),
          api.get('/lessons'),
        ]);
        setProgress(progRes.data.progress);
        setQuizResults(progRes.data.quizResults || []);
        setRecentLessons(lessonsRes.data.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const completedCount = progress?.lessonsCompleted?.length || 0;
  const avgScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((a, r) => a + r.score, 0) / quizResults.length)
    : 0;
  const totalMins = Math.round((progress?.totalTimeSpent || 0) / 60);

  const chartData = quizResults.slice(0, 6).map((r, i) => ({
    name: `Quiz ${i + 1}`,
    score: r.score,
  }));

  const statCards = [
    { icon: <FaBook />, label: 'Lessons Completed', value: completedCount, color: '#818cf8' },
    { icon: <FaTrophy />, label: 'Average Quiz Score', value: `${avgScore}%`, color: '#fbbf24' },
    { icon: <FaClock />, label: 'Time Spent (mins)', value: totalMins, color: '#22d3ee' },
    { icon: <FaBookmark />, label: 'Bookmarks', value: progress?.bookmarks?.length || 0, color: '#f472b6' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading your dashboard...</div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 700 }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          Here's your learning overview for today.
        </p>
      </div>

      {user?.accessibilityType === 'hearing-impaired' && <HearingImpairedIntro />}

      {/* Stat cards */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: `${s.color}22`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.color, fontSize: '1.25rem', flexShrink: 0,
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Recent Lessons */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Browse Lessons</h2>
            <Link to="/student/courses" className="btn btn-secondary" style={{ fontSize: '0.775rem', padding: '0.4rem 0.875rem' }}>
              View all <FaArrowRight style={{ fontSize: '0.7rem' }} />
            </Link>
          </div>
          {recentLessons.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No lessons yet. Check back soon!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentLessons.map(l => (
                <Link key={l._id} to={`/student/lesson/${l._id}`} style={{
                  display: 'flex', alignItems: 'center', gap: '0.875rem',
                  padding: '0.75rem', borderRadius: 10,
                  background: 'var(--color-surface2)',
                  textDecoration: 'none', color: 'var(--color-text)',
                  transition: 'all 0.2s',
                  border: '1px solid transparent',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 8,
                    background: 'linear-gradient(135deg, #818cf844, #6366f144)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: '1rem',
                  }}>
                    {l.type === 'video' ? '🎬' : l.type === 'audio' ? '🎵' : l.type === 'pdf' ? '📄' : l.type === 'image' ? '🖼️' : '📝'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                      {l.subject} · {l.type}
                    </div>
                  </div>
                  <FaPlay style={{ color: 'var(--color-accent)', fontSize: '0.7rem', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Score Chart */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1.25rem' }}>Quiz Performance</h2>
          {chartData.length === 0 ? (
            <div style={{
              height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--color-surface2)', borderRadius: 10,
              color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center',
            }}>
              <div>
                <FaTrophy style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.3 }} />
                <p>Complete a quiz to see your scores here</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--color-text)' }}
                  formatter={(v) => [`${v}%`, 'Score']}
                />
                <Bar dataKey="score" fill="url(#scoreGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
