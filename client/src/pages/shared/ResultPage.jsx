import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Check, ChevronDown, X } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import { DIFFICULTY_LABEL, DIFFICULTY_TONE, fmtDateTime, toneForPercent } from '../../utils/format.js';

/** Result of one finished attempt. Students see their own; teachers can open any student's. */
export default function ResultPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const state = useFetch(() => api.get(`/attempts/${id}`), [id]);
  const [open, setOpen] = useState(null);
  const isTeacher = user.role === 'teacher';

  return (
    <Async state={state}>
      {({ attempt, questions }) => {
        if (attempt.status !== 'submitted') return <Navigate to={`/attempt/${id}`} replace />;

        const passed = attempt.percentage >= attempt.passPercent;
        const correct = questions.filter((q) => q.answer?.isCorrect).length;
        const minutes = Math.max(1, Math.round((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 60000));

        return (
          <div className="stack">
            <div className="card result-hero">
              <div style={{ textAlign: 'center', minWidth: 140, padding: '20px 24px', background: 'var(--surface-sunken)', borderRadius: 12, border: '1px solid var(--line)' }}>
                <div style={{ fontSize: 42, fontWeight: 800, color: `var(--${toneForPercent(attempt.percentage)})` }}>
                  {Math.round(attempt.percentage)}%
                </div>
                <div className="muted small" style={{ fontWeight: 600, marginTop: 4 }}>
                  {attempt.score} / {attempt.totalMarks} marks
                </div>
              </div>
              <div>
                <div className="row-wrap" style={{ gap: 8 }}>
                  <span className={`badge badge-${passed ? 'good' : 'bad'}`}>{passed ? 'Passed' : 'Not passed yet'}</span>
                </div>
                <h1 style={{ marginTop: 10 }}>{attempt.title}</h1>
                <p className="muted" style={{ marginTop: 6 }}>
                  {isTeacher && attempt.student ? `${attempt.student} · ` : ''}{fmtDateTime(attempt.submittedAt)} · pass mark {attempt.passPercent}%
                </p>
                <div className="result-stats">
                  <div><strong>{correct}/{questions.length}</strong><span className="muted small">Correct</span></div>
                  <div><strong>{questions.length - correct}</strong><span className="muted small">Missed</span></div>
                  <div><strong>{minutes} min</strong><span className="muted small">Time taken</span></div>
                </div>
              </div>
            </div>

            <div className="grid grid-main">
              <div className="stack">
                <h2>Answer review</h2>
                {questions.map((q, i) => {
                  const tone = q.answer?.isCorrect ? 'good' : 'bad';
                  const chosen = q.options.find((o) => o.index === q.answer?.selected);
                  const right = q.options.find((o) => o.index === q.correctIndex);
                  return (
                    <div className="review-item" key={q.id}>
                      <button className="review-head" onClick={() => setOpen(open === q.id ? null : q.id)} aria-expanded={open === q.id}>
                        <span className={`review-mark ${tone}`}>{tone === 'good' ? <Check size={16} /> : <X size={16} />}</span>
                        <span className="grow"><strong>{i + 1}.</strong> {q.text}</span>
                        <span className="num small muted">{q.answer?.marks ?? 0}/{q.marks}</span>
                        <ChevronDown size={18} style={{ transform: open === q.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                      </button>
                      {open === q.id && (
                        <div className="review-body">
                          <div className="row-wrap" style={{ gap: 8 }}>
                            <span className="badge">{q.topic}</span>
                            <span className={`badge badge-${DIFFICULTY_TONE[q.difficulty]}`}>{DIFFICULTY_LABEL[q.difficulty]}</span>
                          </div>
                          <div className={`answer-line ${q.answer?.isCorrect ? 'good' : 'bad'}`}>
                            Your answer: {chosen ? chosen.text : 'Not answered'}
                          </div>
                          {!q.answer?.isCorrect && (
                            <div className="answer-line good">Correct answer: {right?.text}</div>
                          )}
                          {q.explanation && <div className="explain">{q.explanation}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="stack" style={{ alignContent: 'start' }}>
                <div className="card stack">
                  <h3>Next steps</h3>
                  <Link to={isTeacher ? '/teacher/quizzes' : '/quizzes'} className="btn btn-primary">
                    Back to quizzes
                  </Link>
                  <Link to={isTeacher ? '/teacher/quizzes' : '/history'} className="btn btn-ghost">
                    {isTeacher ? 'Manage quizzes' : 'View attempt history'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Async>
  );
}
