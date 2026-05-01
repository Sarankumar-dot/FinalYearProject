import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { FaPlus, FaTrash, FaSave } from 'react-icons/fa';

const BLANK_Q = { text:'', type:'multiple-choice', options:['','','',''], correctAnswer:'', explanation:'' };

export default function QuizBuilder() {
  const { lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{ ...BLANK_Q }]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const lr = await api.get(`/lessons/${lessonId}`).catch(() => null);
      setLesson(lr?.data);
      const qr = await api.get(`/quizzes?lessonId=${lessonId}`).catch(() => ({ data: [] }));
      if (qr.data.length > 0) {
        const q = qr.data[0];
        setQuiz(q);
        setTitle(q.title);
        setQuestions(q.questions?.length > 0 ? q.questions : [{ ...BLANK_Q }]);
      } else {
        setTitle(lr?.data?.title ? `Quiz: ${lr.data.title}` : '');
      }
    };
    load();
  }, [lessonId]);

  const updateQ = (i, field, val) => {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  };
  const updateOption = (qi, oi, val) => {
    setQuestions(qs => qs.map((q, idx) => idx === qi ? { ...q, options: q.options.map((o, j) => j===oi ? val : o) } : q));
  };
  const addQuestion = () => setQuestions(qs => [...qs, { ...BLANK_Q, options:['','','',''] }]);
  const removeQuestion = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const payload = { title, lessonId, questions: questions.filter(q => q.text.trim()) };
      if (quiz?._id) {
        await api.put(`/quizzes/${quiz._id}`, payload);
      } else {
        const res = await api.post('/quizzes', payload);
        setQuiz(res.data);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth:720 }}>
      <h1 style={{ fontFamily:'Outfit,sans-serif', fontSize:'1.75rem', fontWeight:700, marginBottom:'0.25rem' }}>Quiz Builder</h1>
      {lesson && <p style={{ color:'var(--color-text-muted)', marginBottom:'2rem', fontSize:'0.9rem' }}>For lesson: {lesson.title}</p>}

      <div className="form-group">
        <label htmlFor="quiz-title">Quiz Title</label>
        <input id="quiz-title" value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Photosynthesis Quiz" aria-label="Quiz title" />
      </div>

      {questions.map((q, i) => (
        <div key={i} className="card" style={{ marginBottom:'1rem', borderLeft:`3px solid var(--color-accent)` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.875rem' }}>
            <span style={{ fontWeight:700, fontSize:'0.875rem', color:'var(--color-accent)' }}>Question {i+1}</span>
            {questions.length > 1 && (
              <button onClick={()=>removeQuestion(i)} className="btn btn-danger" style={{ fontSize:'0.75rem', padding:'0.3rem 0.625rem' }} aria-label={`Remove question ${i+1}`}><FaTrash /></button>
            )}
          </div>

          <div className="form-group">
            <label>Type</label>
            <select value={q.type} onChange={e=>updateQ(i,'type',e.target.value)} aria-label={`Question ${i+1} type`}>
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True / False</option>
              <option value="short-answer">Short Answer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Question Text</label>
            <textarea rows={2} value={q.text} onChange={e=>updateQ(i,'text',e.target.value)} placeholder="Enter the question..." aria-label={`Question ${i+1} text`} />
          </div>

          {q.type === 'multiple-choice' && (
            <div className="form-group">
              <label>Options</label>
              {q.options?.map((opt, oi) => (
                <div key={oi} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.4rem' }}>
                  <span style={{ padding:'0.65rem 0.5rem', fontWeight:700, fontSize:'0.8rem', color:'var(--color-text-muted)', minWidth:24 }}>{String.fromCharCode(65+oi)}.</span>
                  <input value={opt} onChange={e=>updateOption(i,oi,e.target.value)} placeholder={`Option ${String.fromCharCode(65+oi)}`} aria-label={`Option ${String.fromCharCode(65+oi)} for question ${i+1}`} />
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label>Correct Answer</label>
            {q.type === 'true-false' ? (
              <select value={q.correctAnswer} onChange={e=>updateQ(i,'correctAnswer',e.target.value)} aria-label={`Correct answer for question ${i+1}`}>
                <option value="">Select...</option>
                <option>True</option>
                <option>False</option>
              </select>
            ) : (
              <input value={q.correctAnswer} onChange={e=>updateQ(i,'correctAnswer',e.target.value)} placeholder={q.type==='multiple-choice'?'Exact text of correct option':'Model answer'} aria-label={`Correct answer for question ${i+1}`} />
            )}
          </div>
        </div>
      ))}

      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
        <button onClick={addQuestion} className="btn btn-secondary"><FaPlus /> Add Question</button>
        <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ marginLeft:'auto' }}>
          {saving ? 'Saving...' : saved ? '✓ Saved!' : <><FaSave /> Save Quiz</>}
        </button>
      </div>
    </div>
  );
}
