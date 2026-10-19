import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Flag, Send, Sparkles } from 'lucide-react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Loader } from '../../components/Async.jsx';
import Modal from '../../components/Modal.jsx';
import { DIFFICULTY_LABEL, DIFFICULTY_TONE, clock } from '../../utils/format.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const LOW_TIME_SECONDS = 60;

/** The quiz player: timer, question navigator, flags, keyboard shortcuts and auto-submit. */
export default function TakeQuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({}); // questionId -> { selected, text }
  const [flags, setFlags] = useState({}); // questionId -> true
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const deadline = useRef(null); // exact end time, so the timer survives slow renders
  const answersRef = useRef({}); // always-current copy for the auto-submit
  const submitted = useRef(false);
  const storageKey = `smartquiz_attempt_${id}`;
  answersRef.current = answers;

  // ---- Load the attempt (and restore answers saved in this browser after a refresh)
  useEffect(() => {
    api.get(`/attempts/${id}`)
      .then((res) => {
        if (res.attempt.status === 'submitted') return navigate(`/results/${id}`, { replace: true });
        if (res.remainingSeconds !== null) deadline.current = Date.now() + res.remainingSeconds * 1000;
        setSecondsLeft(res.remainingSeconds);
        const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (saved) {
          setAnswers(saved.answers || {});
          setFlags(saved.flags || {});
          setIndex(Math.min(saved.index || 0, res.questions.length - 1));
        }
        setData(res);
      })
      .catch((e) => setError(e.message));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (data) localStorage.setItem(storageKey, JSON.stringify({ answers, flags, index }));
  }, [answers, flags, index, data, storageKey]);

  // ---- Countdown
  useEffect(() => {
    if (!data || deadline.current === null) return undefined;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.round((deadline.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) submit(true);
    }, 500);
    return () => clearInterval(timer);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Keyboard: A-D / 1-4 choose an option, arrows move between questions
  useEffect(() => {
    if (!data) return undefined;
    const onKey = (e) => {
      if (['TEXTAREA', 'INPUT'].includes(e.target.tagName) || confirming) return;
      const q = data.questions[index];
      const pressed = e.key.length === 1 ? 'ABCDEF'.indexOf(e.key.toUpperCase()) : -1;
      const digit = Number(e.key) - 1;
      const choice = pressed >= 0 ? pressed : digit >= 0 && digit < 6 ? digit : -1;
      if (q.type === 'mcq' && q.options[choice]) setAnswer(q.id, { selected: q.options[choice].index });
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, data.questions.length - 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const setAnswer = (questionId, value) => setAnswers((prev) => ({ ...prev, [questionId]: value }));

  async function submit(auto = false) {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    try {
      const list = data.questions.map((q) => ({
        question: q.id,
        selected: answersRef.current[q.id]?.selected ?? null,
        text: answersRef.current[q.id]?.text ?? '',
      }));
      await api.post(`/attempts/${id}/submit`, { answers: list });
      localStorage.removeItem(storageKey);
      if (auto) toast.error('Time is up. Your answers were submitted.');
      navigate(`/results/${id}`, { replace: true, state: { fresh: true } });
    } catch (e) {
      submitted.current = false;
      setSubmitting(false);
      toast.error(e.message);
    }
  }

  if (error) return <div className="page" style={{ padding: 40 }}><div className="notice notice-bad">{error}</div></div>;
  if (!data) return <Loader />;

  const { questions, attempt } = data;
  const q = questions[index];
  const isAnswered = (question) => {
    const a = answers[question.id];
    return question.type === 'mcq' ? a?.selected !== undefined && a?.selected !== null : Boolean(a?.text?.trim());
  };
  const answeredCount = questions.filter(isAnswered).length;
  const unanswered = questions.length - answeredCount;
  const low = secondsLeft !== null && secondsLeft <= LOW_TIME_SECONDS;

  return (
    <div className="player">
      <header className="player-head">
        <div className="player-head-inner">
          <span className="player-title">{attempt.title}</span>
          <span className="right row">
            {attempt.kind === 'practice' && <span className="badge"><Sparkles size={13} /> Practice</span>}
            {secondsLeft !== null && <span className={`timer ${low ? 'low' : ''}`}><Clock size={17} /> {clock(secondsLeft)}</span>}
          </span>
        </div>
        <div className="progress-line"><i style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
      </header>

      <div className="player-body">
        <div>
          {/* key = question id so every question slides in */}
          <div className="card q-card" key={q.id}>
            <div className="row-wrap spread">
              <div className="row-wrap" style={{ gap: 8 }}>
                <span className="badge badge-muted">Question {index + 1} of {questions.length}</span>
                {q.topic && <span className="badge">{q.topic}</span>}
                <span className={`badge badge-${DIFFICULTY_TONE[q.difficulty]}`}>{DIFFICULTY_LABEL[q.difficulty]}</span>
                <span className="small muted">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
              </div>
              <button className={`btn btn-sm ${flags[q.id] ? 'btn-soft' : 'btn-ghost'}`} onClick={() => setFlags({ ...flags, [q.id]: !flags[q.id] })}>
                <Flag size={15} /> {flags[q.id] ? 'Flagged' : 'Flag for later'}
              </button>
            </div>

            <h2 className="q-text">{q.text}</h2>

            {q.type === 'mcq' ? (
              <div className="options" role="radiogroup">
                {q.options.map((option, position) => (
                  <button
                    key={option.index}
                    role="radio"
                    aria-checked={answers[q.id]?.selected === option.index}
                    className={`option ${answers[q.id]?.selected === option.index ? 'selected' : ''}`}
                    onClick={() => setAnswer(q.id, { selected: option.index })}
                  >
                    <span className="option-key">{LETTERS[position]}</span>
                    {option.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="field">
                <label htmlFor="written">Your answer</label>
                <textarea id="written" className="textarea" style={{ minHeight: 170 }} placeholder="Write your answer in your own words…" value={answers[q.id]?.text || ''} onChange={(e) => setAnswer(q.id, { text: e.target.value })} />
              </div>
            )}

            <div className="player-actions">
              <button className="btn btn-ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}><ChevronLeft size={18} /> Previous</button>
              {index < questions.length - 1 ? (
                <button className="btn btn-primary" onClick={() => setIndex(index + 1)}>Next <ChevronRight size={18} /></button>
              ) : (
                <button className="btn btn-primary" onClick={() => setConfirming(true)}><Send size={16} /> Finish quiz</button>
              )}
            </div>
          </div>
          <p className="small faint center" style={{ marginTop: 14 }}>Tip: press A–D to choose an answer and ← → to move.</p>
        </div>

        <aside className="card navigator">
          <h3 style={{ marginBottom: 14 }}>Questions</h3>
          <div className="nav-grid">
            {questions.map((question, i) => (
              <button
                key={question.id}
                className={`nav-dot ${isAnswered(question) ? 'answered' : ''} ${flags[question.id] ? 'flagged' : ''} ${i === index ? 'current' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Question ${i + 1}${isAnswered(question) ? ', answered' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="legend">
            <span><i className="dot" style={{ background: 'var(--accent)' }} /> Answered ({answeredCount})</span>
            <span><i className="dot" style={{ background: 'var(--warn)' }} /> Flagged ({Object.values(flags).filter(Boolean).length})</span>
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} onClick={() => setConfirming(true)}><Send size={16} /> Submit quiz</button>
        </aside>
      </div>

      {confirming && (
        <Modal
          title="Submit your quiz?"
          onClose={() => setConfirming(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Keep working</button>
              <button className="btn btn-primary" disabled={submitting} onClick={() => submit(false)}>{submitting ? 'Submitting…' : 'Submit now'}</button>
            </>
          }
        >
          <p>You answered <strong>{answeredCount}</strong> of {questions.length} questions.</p>
          {unanswered > 0 && <div className="notice notice-info" style={{ marginTop: 12 }}>{unanswered} unanswered question(s) will score zero.</div>}
        </Modal>
      )}
    </div>
  );
}
