import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import QuizForm from '../../components/QuizForm.jsx';

export default function QuizzesPage() {
  const toast = useToast();
  const quizzes = useFetch(() => api.get('/quizzes'), []);
  const subjects = useFetch(() => api.get('/subjects'), []);
  const [editing, setEditing] = useState(null); // null | 'new' | full quiz document

  async function openEditor(quiz) {
    try {
      setEditing(quiz ? await api.get(`/quizzes/${quiz._id}`) : 'new'); // the list does not include question ids
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function togglePublish(quiz) {
    try {
      await api.put(`/quizzes/${quiz._id}`, { isPublished: !quiz.isPublished });
      toast.success(quiz.isPublished ? 'Quiz hidden from students' : 'Quiz published');
      quizzes.reload();
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function remove(quiz) {
    if (!window.confirm(`Delete "${quiz.title}"? Students keep their past results.`)) return;
    try {
      await api.del(`/quizzes/${quiz._id}`);
      toast.success('Quiz deleted');
      quizzes.reload();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <>
      <PageHeader title="Quizzes" subtitle="Build quizzes from the question bank, then publish them to students.">
        <button className="btn btn-primary" disabled={!subjects.data?.length} onClick={() => openEditor(null)}><Plus size={18} /> New quiz</button>
      </PageHeader>

      <Async state={quizzes}>
        {(list) =>
          list.length === 0 ? (
            <div className="card"><EmptyState icon={ClipboardList} title="No quizzes yet" text="Create your first quiz and choose its questions." /></div>
          ) : (
            <div className="card table-wrap">
              <table className="table">
                <thead><tr><th>Quiz</th><th>Setup</th><th>Attempts</th><th>Published</th><th /></tr></thead>
                <tbody>
                  {list.map((q) => (
                    <tr key={q._id}>
                      <td>
                        <strong>{q.title}</strong>
                        <div><span className="badge" style={{ background: `${q.subject.color}22`, color: q.subject.color }}>{q.subject.name}</span></div>
                      </td>
                      <td className="muted small">
                        {q.size} questions<br />
                        Pass {q.passPercent}%
                      </td>
                      <td className="num">{q.attemptCount}</td>
                      <td>
                        <label className="switch" aria-label={`Publish ${q.title}`}>
                          <input type="checkbox" checked={q.isPublished} onChange={() => togglePublish(q)} /><span />
                        </label>
                      </td>
                      <td>
                        <div className="row" style={{ gap: 6 }}>
                          <Link to={`/teacher/quizzes/${q._id}`} className="btn btn-soft btn-sm"><BarChart3 size={15} /> Results</Link>
                          <button className="icon-btn" aria-label="Edit quiz" onClick={() => openEditor(q)}><Pencil size={16} /></button>
                          <button className="icon-btn" aria-label="Delete quiz" onClick={() => remove(q)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Async>

      {editing && subjects.data && (
        <QuizForm
          quiz={editing === 'new' ? null : editing}
          subjects={subjects.data}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); quizzes.reload(); }}
        />
      )}
    </>
  );
}
