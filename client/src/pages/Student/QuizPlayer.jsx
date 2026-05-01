import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';
import { FaVolumeUp, FaArrowRight, FaArrowLeft, FaTrophy } from 'react-icons/fa';

export default function QuizPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { speak, prefs } = useAccessibility();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const questionContainerRef = useRef(null);

  // Global Keyboard Navigation (Arrow Keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); document.getElementById('btn-next')?.click(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); document.getElementById('btn-prev')?.click(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus container on question change for screen readers
  useEffect(() => {
    if (questionContainerRef.current) {
      questionContainerRef.current.focus();
    }
  }, [current]);

  useEffect(() => {
    api.get(`/quizzes/${id}`).then(r => {
      setQuiz(r.data);
      // Auto-read first question for accessibility
      if (prefs.autoPlayTTS && r.data.questions?.[0]) {
        speak(r.data.questions[0].text);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const readQuestion = useCallback((q) => {
    if (!q) return;
    let text = `Question: ${q.text}. `;
    if (q.type === 'multiple-choice' && q.options?.length) {
      text += 'Options: ' + q.options.map((o, i) => `${String.fromCharCode(65 + i)}: ${o}`).join('. ');
    } else if (q.type === 'true-false') {
      text += 'Answer True or False.';
    }
    speak(text);
  }, [speak]);

  const goNext = () => {
    const nextIdx = current + 1;
    if (nextIdx < quiz.questions.length) {
      setCurrent(nextIdx);
      if (prefs.autoPlayTTS) readQuestion(quiz.questions[nextIdx]);
    }
  };

  const goPrev = () => {
    const prevIdx = current - 1;
    if (prevIdx >= 0) {
      setCurrent(prevIdx);
      if (prefs.autoPlayTTS) readQuestion(quiz.questions[prevIdx]);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(a => ({ ...a, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    const payload = {
      answers: Object.entries(answers).map(([qId, ans]) => ({ questionId: qId, answer: ans })),
      timeTaken,
    };
    try {
      const res = await api.post(`/quizzes/${id}/submit`, payload);
      setResult(res.data);
      setSubmitted(true);
      speak(`Quiz complete! You scored ${res.data.score} percent. ${res.data.correctCount} out of ${res.data.totalQuestions} correct.`);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading quiz...</div>;
  if (!quiz) return <div style={{ padding: '2rem' }}>Quiz not found.</div>;

  const q = quiz.questions?.[current];
  const totalQ = quiz.questions?.length || 0;
  const progress = totalQ > 0 ? ((current + 1) / totalQ) * 100 : 0;

  // Results screen
  if (submitted && result) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {result.score >= 70 ? '🏆' : result.score >= 50 ? '👍' : '📚'}
          </div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            {result.score}%
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            {result.correctCount} out of {result.totalQuestions} correct
          </p>

          <div style={{
            padding: '1rem', background: 'var(--color-surface2)', borderRadius: 10, marginBottom: '2rem',
          }}>
            {result.score >= 70 ? '✨ Excellent work! You passed this quiz.' :
             result.score >= 50 ? '👏 Good effort! Review the material and try again.' :
             '📖 Keep studying! You can retake this quiz anytime.'}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => navigate(-1)} className="btn btn-secondary">Back to Lesson</button>
            <button onClick={() => navigate('/student/progress')} className="btn btn-primary">View Progress</button>
          </div>
        </div>
      </div>
    );
  }

  if (!q) return <div style={{ padding: '2rem' }}>No questions in this quiz.</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          {quiz.title}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          Question {current + 1} of {totalQ}
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--color-surface2)', borderRadius: 3, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #818cf8, #22d3ee)', borderRadius: 3, transition: 'width 0.3s ease' }} />
      </div>

      {/* Question card */}
      <div 
        ref={questionContainerRef}
        className="card" 
        style={{ marginBottom: '1rem' }} 
        role="region" 
        aria-live="polite" 
        aria-label={`Question ${current + 1}`}
        tabIndex={-1} // allows programmatic focus without interrupting typical Tab flow
      >
        {/* Read aloud button */}
        <button
          onClick={() => readQuestion(q)}
          className="btn btn-secondary"
          style={{ marginBottom: '1rem', fontSize: '0.8rem' }}
          aria-label="Read question aloud"
        >
          <FaVolumeUp /> Read Question
        </button>

        <h2 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          {q.text}
        </h2>

        {/* Multiple choice */}
        {q.type === 'multiple-choice' && q.options?.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(String(q._id), opt)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              width: '100%', padding: '0.875rem 1rem',
              borderRadius: 10, border: `2px solid ${answers[q._id] === opt ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: answers[q._id] === opt ? 'rgba(108,99,255,0.1)' : 'var(--color-surface2)',
              color: 'var(--color-text)', cursor: 'pointer',
              marginBottom: '0.625rem', transition: 'all 0.2s ease',
              textAlign: 'left', font: 'inherit',
            }}
            aria-pressed={answers[q._id] === opt}
            aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
          >
            <span style={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: answers[q._id] === opt ? 'var(--color-accent)' : 'var(--color-surface)',
              color: answers[q._id] === opt ? '#fff' : 'var(--color-text-muted)',
              fontWeight: 700, fontSize: '0.8rem',
            }}>
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}

        {/* True/False */}
        {q.type === 'true-false' && ['True', 'False'].map(opt => (
          <button
            key={opt}
            onClick={() => handleAnswer(String(q._id), opt)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 2rem', marginRight: '1rem', marginBottom: '0.5rem',
              borderRadius: 10, border: `2px solid ${answers[q._id] === opt ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: answers[q._id] === opt ? 'rgba(108,99,255,0.1)' : 'var(--color-surface2)',
              color: 'var(--color-text)', cursor: 'pointer',
              transition: 'all 0.2s', font: 'inherit', fontWeight: 600,
            }}
            aria-pressed={answers[q._id] === opt}
            aria-label={`Answer ${opt}`}
          >
            {opt === 'True' ? '✅' : '❌'} {opt}
          </button>
        ))}

        {/* Short answer */}
        {q.type === 'short-answer' && (
          <textarea
            value={answers[q._id] || ''}
            onChange={e => handleAnswer(String(q._id), e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            aria-label="Your answer"
            style={{ resize: 'vertical' }}
          />
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <button 
          id="btn-prev"
          onClick={goPrev} disabled={current === 0} className="btn btn-secondary"
          style={{ opacity: current === 0 ? 0.4 : 1 }} aria-label="Previous question (Left Arrow)">
          <FaArrowLeft /> Prev
        </button>

        {current < totalQ - 1 ? (
          <button id="btn-next" onClick={goNext} className="btn btn-primary" aria-label="Next question (Right Arrow)">
            Next <FaArrowRight />
          </button>
        ) : (
          <button id="btn-next" onClick={handleSubmit} className="btn btn-success" aria-label="Submit quiz">
            <FaTrophy /> Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
