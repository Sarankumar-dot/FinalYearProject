import React, { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { FaPlay, FaPause, FaStop, FaVolumeUp } from 'react-icons/fa';

export default function TTSPlayer({ text, label = 'Read aloud' }) {
  const { speak, stopSpeech } = useAccessibility();
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (playing) {
      stopSpeech();
      setPlaying(false);
      return;
    }
    if (!text) return;
    setPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  if (!text) return null;

  return (
    <button
      onClick={handlePlay}
      className={`btn ${playing ? 'btn-danger' : 'btn-secondary'}`}
      style={{ fontSize: '0.8rem', padding: '0.45rem 0.875rem' }}
      aria-label={playing ? 'Stop reading' : label}
      aria-live="polite"
    >
      {playing ? <><FaStop /> Stop</> : <><FaVolumeUp /> {label}</>}
    </button>
  );
}
