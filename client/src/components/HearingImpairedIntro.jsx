import React from 'react';

export default function HearingImpairedIntro() {
  return (
    <div style={{
      marginBottom: '2rem',
      background: 'rgba(129, 140, 248, 0.06)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(129, 140, 248, 0.18)',
      borderRadius: 16,
      padding: '1.75rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    }}>
      {/* Top shimmer line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.4), rgba(34, 211, 238, 0.3), transparent)',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'linear-gradient(135deg, #818cf8, #22d3ee)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '1.8rem',
          animation: 'hi-wave 2s infinite',
          boxShadow: '0 4px 20px rgba(129, 140, 248, 0.4)',
        }}>
          🤟
        </div>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--color-text)', fontFamily: 'Outfit, sans-serif' }}>
            Welcome to your Accessible Dashboard!
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Here is a quick guide on how the platform works for you using animated signs.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {[
          {
            emoji: '🤙', anim: 'hi-bounce',
            title: 'Navigation Signs',
            desc: 'Look for the hand signs on the left menu (like the dashboard "🤙" sign, or the courses "👐" sign) to quickly identify different sections of the website.',
          },
          {
            emoji: '🤟', anim: 'hi-pulse',
            title: 'ASL Video Dictionary',
            desc: 'Lessons contain ASL video embeds for complex keywords. When you encounter a new keyword, you can watch an ASL interpretation video!',
          },
          {
            emoji: '👐', anim: 'hi-wiggle',
            title: 'Visual Cues & Captions',
            desc: "All lesson videos are designed with captions enabled automatically. We've replaced sound-based alerts with visual indicators so you never miss a thing.",
          },
        ].map((item, i) => (
          <div key={i} style={{
            background: 'rgba(129, 140, 248, 0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '1.25rem',
            borderRadius: 14,
            border: '1px solid rgba(129, 140, 248, 0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 36px rgba(129, 140, 248, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.25)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.1)';
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.2), transparent)',
            }} />
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', display: 'inline-block', animation: `${item.anim} 2s infinite ease-in-out` }}>
              {item.emoji}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.35rem', color: 'var(--color-text)', fontFamily: 'Outfit, sans-serif' }}>
              {item.title}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes hi-wave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(20deg); } 75% { transform: rotate(-15deg); } }
        @keyframes hi-bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes hi-wiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } }
        @keyframes hi-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      `}</style>
    </div>
  );
}
