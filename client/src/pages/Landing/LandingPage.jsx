import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaHandPaper, FaVolumeUp, FaClosedCaptioning, FaGraduationCap, FaChalkboardTeacher, FaShieldAlt, FaArrowRight, FaStar } from 'react-icons/fa';
import ThemeToggle from '../../components/ThemeToggle';

const features = [
  { icon: <FaVolumeUp />, title: 'Text-to-Speech', desc: 'Every lesson, question, and label reads aloud on demand via the Web Speech API.', color: '#818cf8' },
  { icon: <FaClosedCaptioning />, title: 'Real-Time Captions', desc: 'Auto-generated captions synchronised with video lectures for hearing-impaired students.', color: '#22d3ee' },
  { icon: <FaHandPaper />, title: 'Sign Language Library', desc: 'Curated sign language videos mapped to lesson topics for deaf learners.', color: '#fbbf24' },
  { icon: <FaEye />, title: 'Alt-Text Audio', desc: 'Image descriptions read aloud automatically so visually impaired students miss nothing.', color: '#f472b6' },
  { icon: <FaGraduationCap />, title: 'Accessible Quizzes', desc: 'Questions read aloud with full keyboard navigation — no mouse needed.', color: '#60a5fa' },
  { icon: <FaShieldAlt />, title: 'WCAG 2.1 Compliant', desc: 'Built to international accessibility standards with high contrast, focus indicators, and ARIA support.', color: '#34d399' },
];

const roles = [
  { icon: <FaGraduationCap />, title: 'Students', desc: 'Access lessons in your preferred format — audio, captions, or sign language.', color: '#818cf8' },
  { icon: <FaChalkboardTeacher />, title: 'Teachers', desc: 'Upload content once. The platform automatically makes it accessible to all learners.', color: '#22d3ee' },
  { icon: <FaShieldAlt />, title: 'Admins', desc: 'Manage users, moderate content, and grow the sign language video library.', color: '#fbbf24' },
];

const stats = [
  { value: '10+', label: 'Accessibility Features' },
  { value: '3', label: 'User Roles' },
  { value: 'WCAG 2.1', label: 'Compliant' },
  { value: '∞', label: 'Learners Supported' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ background: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,14,26,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #818cf8, #22d3ee)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>👁</div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
            Bridging <span style={{ color: 'var(--color-accent)' }}>the</span> Gap
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ThemeToggle />
          <Link to="/login" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>Log In</Link>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '6rem 2rem 4rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background gradient blobs */}
        <div style={{
          position: 'absolute', width: 600, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)',
          top: '10%', left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)',
          bottom: '20%', right: '10%',
          pointerEvents: 'none',
        }} />

        <div className="badge badge-purple" style={{ marginBottom: '1.5rem', fontSize: '0.8rem' }}>
          ⭐ Final Year Project 2026
        </div>

        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '1.5rem',
          maxWidth: 800,
        }}>
          Accessible Learning{' '}
          <span style={{
            background: 'linear-gradient(135deg, #818cf8, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>for All</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.25rem)',
          color: 'var(--color-text-muted)',
          maxWidth: 640,
          marginBottom: '2.5rem',
          lineHeight: 1.7,
        }}>
          Bridging the Gap eliminates the learning gap for visually impaired and hearing-impaired students.
          One platform. Every format. Every learner included.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            Start Learning <FaArrowRight style={{ marginLeft: 4 }} />
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            Sign In
          </Link>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: '3rem', marginTop: '4rem',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Built for <span style={{ color: 'var(--color-accent)' }}>Every Learner</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 500, margin: '0 auto' }}>
            10 deep accessibility features woven into every layer of the platform.
          </p>
        </div>
        <div className="grid-3">
          {features.map(f => (
            <div key={f.title} className="card animate-fade-in" style={{
              display: 'flex', flexDirection: 'column', gap: '1rem',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.2)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `${f.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', color: f.color,
              }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{f.title}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section style={{ padding: '4rem 2rem', background: 'var(--color-surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Three Roles. One Platform.
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
            Students, teachers, and admins each get a tailored dashboard built for their needs.
          </p>
          <div className="grid-3">
            {roles.map(r => (
              <div key={r.title} className="card" style={{ textAlign: 'left', borderTop: `3px solid ${r.color}` }}>
                <div style={{ fontSize: '2rem', color: r.color, marginBottom: '1rem' }}>{r.icon}</div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>{r.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(129,140,248,0.1), rgba(34,211,238,0.05))',
      }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 700, marginBottom: '1rem' }}>
          Ready to learn without limits?
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Create a free account and start accessing inclusive education today.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
          Create Free Account <FaArrowRight style={{ marginLeft: 6 }} />
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '2rem',
        borderTop: '1px solid var(--color-border)',
        color: 'var(--color-text-muted)', fontSize: '0.85rem',
      }}>
        © 2026 Bridging the Gap: An Inclusive Learning Platform. Built as a Final Year Project.
      </footer>
    </div>
  );
}
