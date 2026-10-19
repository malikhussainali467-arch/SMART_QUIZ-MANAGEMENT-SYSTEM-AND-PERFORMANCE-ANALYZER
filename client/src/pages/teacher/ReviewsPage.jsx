import { useState } from 'react';
import { CheckCircle2, PenLine } from 'lucide-react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';
import { fmtDateTime } from '../../utils/format.js';

/** Dialog to check the written answers of one attempt and set marks. */
function ReviewDialog({ attemptId, onClose, onSaved }) {
  const toast = useToast();
  const detail = useFetch(() => api.get(`/attempts/${attemptId}`), [attemptId]);
  const [marks, setMarks] = useState({});

  const written = (detail.data?.questions || []).filter((q) => q.type === 'theory' && q.answer);
  const valueFor = (q) => marks[q.id] ?? q.answer.marks;

  async function save() {
    try {
      // Saving also confirms the automatic marks of untouched answers.
      const all = Object.fromEntries(written.map((q) => [q.id, valueFor(q)]));
      await api.put(`/attempts/${attemptId}/review`, { marks: all });
      toast.success('Review saved');
      onSaved();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <Modal wide title={detail.data ? `${detail.data.attempt.student} · ${detail.data.attempt.title}` : 'Review'} onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>Save marks</button></>}>
      <Async state={detail}>
        {() => (
          <div className="stack">
            {written.map((q) => (
              <div className="card card-flat" key={q.id}>
                <strong>{q.text}</strong>
                <div className="answer-line" style={{ marginTop: 10 }}>{q.answer.text || 'No answer'}</div>
                {q.keywords.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {q.keywords.map((k) => <span key={k} className={`kw ${q.matchedKeywords.includes(k) ? 'hit' : ''}`}>{k}</span>)}
                  </div>
                )}
                {q.modelAnswer && <p className="small muted" style={{ marginTop: 8 }}>Model answer: {q.modelAnswer}</p>}
                <div className="row" style={{ marginTop: 12 }}>
                  <label htmlFor={`m-${q.id}`} className="label">Marks (max {q.marks})</label>
                  <input id={`m-${q.id}`} type="number" min="0" max={q.marks} step="0.5" className="input" style={{ width: 100 }} value={valueFor(q)} onChange={(e) => setMarks({ ...marks, [q.id]: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Async>
    </Modal>
  );
}

export default function ReviewsPage() {
  const pending = useFetch(() => api.get('/attempts/reviews/pending'), []);
  const [open, setOpen] = useState(null);

  return (
    <>
      <PageHeader title="Reviews" subtitle="Written answers are marked automatically from keywords. Check them here and adjust marks if needed." />
      <Async state={pending}>
        {(list) =>
          list.length === 0 ? (
            <div className="card"><EmptyState icon={CheckCircle2} title="All caught up" text="No written answers are waiting for review." /></div>
          ) : (
            <div className="card table-wrap">
              <table className="table">
                <thead><tr><th>Student</th><th>Quiz</th><th>Written answers</th><th>Submitted</th><th /></tr></thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.student}</strong></td>
                      <td>{a.title}</td>
                      <td className="num">{a.theoryAnswers}</td>
                      <td className="muted">{fmtDateTime(a.submittedAt)}</td>
                      <td><button className="btn btn-primary btn-sm" onClick={() => setOpen(a.id)}><PenLine size={15} /> Review</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Async>
      {open && <ReviewDialog attemptId={open} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); pending.reload(); }} />}
    </>
  );
}
