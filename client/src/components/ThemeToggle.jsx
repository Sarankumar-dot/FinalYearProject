import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const { prefs, update } = useAccessibility();
  
  const toggleTheme = () => {
    // If currently dark, switch to light. If light or high-contrast, switch to dark.
    const nextTheme = prefs.theme === 'dark' ? 'light' : 'dark';
    update('theme', nextTheme);
  };

  return (
    <button 
      onClick={toggleTheme} 
      className="btn btn-secondary"
      style={{ 
        padding: '0.4rem', 
        borderRadius: '50%', 
        width: 40, height: 40, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface2)',
        color: 'var(--color-text)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      aria-label={`Switch to ${prefs.theme === 'dark' ? 'light' : 'dark'} mode`}
      title="Toggle Light/Dark Theme"
    >
      {prefs.theme === 'dark' ? <FaSun size={18} color="#fbbf24" /> : <FaMoon size={18} color="#818cf8" />}
    </button>
  );
}
