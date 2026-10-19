import { useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { Check, ChevronDown, Clock, Hourglass, X } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { usePractice } from '../../hooks/usePractice.js';
import Async from '../../components/Async.jsx';
import ProgressRing from '../../components/ProgressRing.jsx';
import BarRow from '../../components/BarRow.jsx';
import Confetti from '../../components/Confetti.jsx';
import { DIFFICULTY_LABEL, DIFFICULTY_TONE, fmtDateTime, toneForPercent } from '../../utils/format.js';

/** Result of one finished attempt. Students see their own; teachers can open any student's. */
export default function ResultPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const startPractice = usePractice();
  const fresh = Boolean(useLocation().state?.fresh);
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

        // Per-topic breakdown for this attempt
        const byTopic = new Map();
        questions.forEach((q) => {
          const t = byTopic.get(q.topicId) || { id: q.topicId, name: q.topic, got: 0, max: 0 };
          t.got += q.answer?.marks || 0;
          t.max += q.marks;
          byTopic.set(q.topicId, t);
        });
        const topics = [...byTopic.values()].map((t) => ({ ...t, value: t.max ? (t.got / t.max) * 100 : 0 }));
        const weakInThis = topics.filter((t) => t.value < 60);

        return (
          <div className="stack">
            {fresh && !isTeacher && attempt.percentage >= 80 && <Confetti />}

            <div className="card result-hero">
              <ProgressRing value={attempt.percentage} size={170} tone={toneForPercent(attempt.percentage)} caption={`${attempt.score} / ${attempt.totalMarks}`} />
              <div>
                <div className="row-wrap" style={{ gap: 8 }}>
                  <span className={`badge badge-${passed ? 'good' : 'bad'}`}>{passed ? 'Passed' : 'Not passed yet'}</span>
                  {attempt.kind === 'practice' && <span className="badge">Practice</span>}
                  {attempt.timedOut && <span className="badge badge-warn"><Clock size={13} /> Time ran out</span>}
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

            {attempt.pendingReview && (
              <div className="notice notice-info row"><Hourglass size={18} /> Written answers were marked automatically from keywords. Your teacher may adjust the marks.</div>
            )}

            <div className="grid grid-main">
              <div className="stack">
                <h2>Answer review</h2>
                {questions.map((q, i) => {
                  const tone = !q.answer ? 'bad' : q.answer.isCorrect ? 'good' : q.type === 'theory' && q.answer.marks > 0 ? 'warn' : 'bad';
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
                          {q.type === 'mcq' ? (
                            <>
                              <div className={`answer-line ${q.answer?.isCorrect ? 'good' : 'bad'}`}>Your answer: {chosen ? chosen.text : 'Not answered'}</div>
                              {!q.answer?.isCorrect && <div className="answer-line good">Correct answer: {right?.text}</div>}
                            </>
                          ) : (
                            <>
                              <div className="answer-line">Your answer: {q.answer?.text || 'Not answered'}</div>
                              {q.keywords.length > 0 && (
                                <div>
                                  <span className="small muted">Key points looked for: </span>
                                  {q.keywords.map((k) => <span key={k} className={`kw ${q.matchedKeywords.includes(k) ? 'hit' : ''}`}>{k}</span>)}
                                </div>
                              )}
                              {q.modelAnswer && <div className="answer-line good">Model answer: {q.modelAnswer}</div>}
                              {!q.answer?.reviewed && <span className="small muted">Marked automatically. Waiting for teacher review.</span>}
                            </>
                          )}
                          {q.explanation && <div className="explain">{q.explanation}</div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="stack" style={{ alignContent: 'start' }}>
                <div className="card">
                  <div className="card-title"><h3>By topic</h3></div>
                  {topics.map((t) => <BarRow key={t.id} label={t.name} value={t.value} tone={toneForPercent(t.value)} />)}
                </div>
                {!isTeacher && (
                  <div className="card stack">
                    <h3>What next?</h3>
                    {weakInThis.length > 0 && (
                      <p className="muted small">Under 60% in this attempt: {weakInThis.map((t) => t.name).join(', ')}.</p>
                    )}
                    <Link to="/progress" className="btn btn-soft">See full analysis</Link>
                    <Link to="/quizzes" className="btn btn-ghost">Back to quizzes</Link>
                    <button className="btn btn-primary" onClick={() => startPractice(weakInThis.map((t) => t.id))}>
                      {weakInThis.length ? 'Practise these topics' : 'Practise a smart mix'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    </Async>
  );
}
