import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, Clock, ListChecks, Play, RotateCcw, Search, Target } from 'lucide-react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import { toneForPercent } from '../../utils/format.js';

export default function QuizListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const quizzes = useFetch(() => api.get('/quizzes'), []);
  const [subject, setSubject] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // quiz shown in the "ready to start" dialog
  const [busy, setBusy] = useState(false);

  const subjects = useMemo(() => {
    const map = new Map((quizzes.data || []).map((q) => [q.subject._id, q.subject.name]));
    return [...map.entries()];
  }, [quizzes.data]);

  async function start(quiz) {
    if (quiz.inProgressAttemptId) return navigate(`/attempt/${quiz.inProgressAttemptId}`);
    setBusy(true);
    try {
      const { attemptId } = await api.post('/attempts/start', { quizId: quiz._id });
      navigate(`/attempt/${attemptId}`);
    } catch (e) {
      toast.error(e.message);
      setSelected(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader title="Quizzes" subtitle="Pick a quiz. Timed quizzes start the clock as soon as you begin." />

      <div className="row-wrap" style={{ marginBottom: 22 }}>
        <div className="search" style={{ width: 260 }}>
          <Search size={17} />
          <input className="input" placeholder="Search quizzes" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search quizzes" />
        </div>
        <div className="chips">
          <button className={`chip ${subject === 'all' ? 'active' : ''}`} onClick={() => setSubject('all')}>All subjects</button>
          {subjects.map(([id, name]) => (
            <button key={id} className={`chip ${subject === id ? 'active' : ''}`} onClick={() => setSubject(id)}>{name}</button>
          ))}
        </div>
      </div>

      <Async state={quizzes}>
        {(list) => {
          const shown = list.filter((q) => (subject === 'all' || q.subject._id === subject) && q.title.toLowerCase().includes(search.toLowerCase()));
          if (!shown.length) return <EmptyState icon={BookOpenCheck} title="No quizzes found" text="Try another subject or ask your teacher to publish a quiz." />;

          return (
            <div className="grid grid-3">
              {shown.map((q) => {
                const locked = q.maxAttempts > 0 && q.attemptsUsed >= q.maxAttempts && !q.inProgressAttemptId;
                return (
                  <div className="card quiz-card" key={q._id}>
                    <div className="row spread">
                      <span className="badge" style={{ background: `${q.subject.color}22`, color: q.subject.color }}>{q.subject.name}</span>
                      {q.bestPercentage !== null && <span className={`badge badge-${toneForPercent(q.bestPercentage)}`}>Best {Math.round(q.bestPercentage)}%</span>}
                    </div>
                    <div>
                      <h3>{q.title}</h3>
                      {q.description && <p className="muted small" style={{ marginTop: 6 }}>{q.description}</p>}
                    </div>
                    <div className="quiz-meta">
                      <span><ListChecks size={16} /> {q.size} questions</span>
                      <span><Clock size={16} /> {q.durationMinutes ? `${q.durationMinutes} min` : 'Untimed'}</span>
                      <span><Target size={16} /> Pass {q.passPercent}%</span>
                    </div>
                    <button className="btn btn-primary" disabled={locked} onClick={() => (q.inProgressAttemptId ? start(q) : setSelected(q))}>
                      {q.inProgressAttemptId ? <><Play size={16} /> Resume</> : q.attemptsUsed ? <><RotateCcw size={16} /> Retake</> : <><Play size={16} /> Start quiz</>}
                    </button>
                    {locked && <span className="small muted">No attempts left.</span>}
                  </div>
                );
              })}
            </div>
          );
        }}
      </Async>

      {selected && (
        <Modal
          title={selected.title}
          onClose={() => setSelected(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Not yet</button>
              <button className="btn btn-primary" disabled={busy} onClick={() => start(selected)}>{busy ? 'Starting…' : 'Begin now'}</button>
            </>
          }
        >
          <ul className="stack muted" style={{ paddingLeft: 20, margin: 0, gap: 8 }}>
            <li>{selected.size} questions, mixed multiple-choice and written answers.</li>
            <li>{selected.durationMinutes ? `You have ${selected.durationMinutes} minutes. The quiz submits itself when time runs out.` : 'There is no time limit.'}</li>
            <li>You can move between questions and flag the ones to revisit.</li>
            <li>{selected.maxAttempts ? `You may attempt this quiz ${selected.maxAttempts} time(s).` : 'You can retake this quiz as often as you like.'}</li>
          </ul>
        </Modal>
      )}
    </>
  );
}
