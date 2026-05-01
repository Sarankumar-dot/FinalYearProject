import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaHome, FaUsers, FaHandPaper, FaCog, FaSignOutAlt, FaUniversalAccess } from 'react-icons/fa';
import AccessibilityPanel from '../../components/AccessibilityPanel';
import ThemeToggle from '../../components/ThemeToggle';

const navLinks = [
  { to: '/admin', label: 'Dashboard', icon: <FaHome />, end: true, handSign: '🤙' },
  { to: '/admin/users', label: 'Users', icon: <FaUsers />, handSign: '🤝' },
  { to: '/admin/signlang', label: 'Sign Lang Library', icon: <FaHandPaper />, handSign: '🤟' },
  { to: '/admin/settings', label: 'Settings', icon: <FaCog />, handSign: '🤏' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showA11y, setShowA11y] = useState(false);

  return (
    <div className="layout-with-sidebar">
      <style>{`@media (min-width: 769px) { .sidebar { display: flex !important; flex-direction: column; } }`}</style>
      <aside className="sidebar">
        <div style={{ padding:'1rem 0.5rem 2rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#818cf8,#22d3ee)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>👁</div>
          <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, fontSize:'1rem' }}>Bridging <span style={{ color:'var(--color-accent)' }}>the</span> Gap</span>
        </div>
        <div style={{ background:'rgba(251, 191, 36, 0.08)', backdropFilter:'blur(12px)', border:'1px solid rgba(251, 191, 36, 0.15)', borderRadius:10, padding:'0.875rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.9rem', color:'#1e1b4b', flexShrink:0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight:600, fontSize:'0.85rem' }}>{user?.name}</div>
            <div className="badge badge-amber" style={{ fontSize:'0.7rem' }}>Admin</div>
          </div>
        </div>
        <nav aria-label="Admin navigation" style={{ flex:1 }}>
          {navLinks.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.7rem 0.875rem', borderRadius:10, marginBottom:'0.25rem',
              textDecoration:'none', fontWeight:500, fontSize:'0.875rem',
              color: isActive ? '#fff' : 'var(--color-text-muted)',
              background: isActive ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : 'transparent', transition:'all 0.2s',
            })}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {l.icon} {l.label}
              </div>
              {user?.accessibilityType === "hearing-impaired" && (
                <span style={{ marginLeft: "auto", fontSize: "1.2rem", filter: "drop-shadow(0 0 2px rgba(255,255,255,0.2))" }} title={`Sign for ${l.label}`}>
                  {l.handSign}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop:'1px solid var(--color-border)', paddingTop:'1rem', marginTop:'auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ThemeToggle />
            <button onClick={()=>setShowA11y(s=>!s)} className="btn btn-secondary" style={{ flex: 1, justifyContent:'center', fontSize:'0.8rem', padding: '0.6rem 0.5rem' }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FaUniversalAccess /> A11y
              </div>
              {user?.accessibilityType === "hearing-impaired" && (
                <span style={{ marginLeft: "0.5rem", fontSize: "1.1rem" }}>🙌</span>
              )}
            </button>
          </div>
          <button onClick={()=>{ logout(); navigate('/login'); }} className="btn btn-secondary" style={{ width:'100%', justifyContent:'center', fontSize:'0.8rem' }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaSignOutAlt /> Sign Out
            </div>
            {user?.accessibilityType === "hearing-impaired" && (
              <span style={{ marginLeft: "0.5rem", fontSize: "1.1rem" }}>👋</span>
            )}
          </button>
        </div>
      </aside>
      <main className="main-content"><Outlet /></main>
      {showA11y && <AccessibilityPanel onClose={() => setShowA11y(false)} />}
    </div>
  );
}
