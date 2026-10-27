import { useState } from 'react';
import { FileQuestion, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import QuestionForm from '../../components/QuestionForm.jsx';
import { DIFFICULTY_LABEL, DIFFICULTY_TONE } from '../../utils/format.js';

export default function QuestionsPage() {
  const toast = useToast();
  const subjects = useFetch(() => api.get('/subjects'), []);
  const [filters, setFilters] = useState({ subject: '', topic: '', difficulty: '', search: '' });
  const [editing, setEditing] = useState(null); // null | 'new' | question

  const query = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  const questions = useFetch(() => api.get(`/questions?${query}`), [query]);

  const setFilter = (field) => (e) => setFilters({ ...filters, [field]: e.target.value, ...(field === 'subject' && { topic: '' }) });
  const topicsOfSubject = subjects.data?.find((s) => s._id === filters.subject)?.topics || [];

  async function remove(q) {
    if (!window.confirm('Delete this question? It is also removed from any quiz that uses it.')) return;
    try {
      await api.del(`/questions/${q._id}`);
      toast.success('Question deleted');
      questions.reload();
      subjects.reload();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <>
      <PageHeader title="Question bank" subtitle="All MCQ questions in one place. Quizzes pick from here.">
        <button className="btn btn-primary" disabled={!subjects.data?.some((s) => s.topics.length)} onClick={() => setEditing('new')}><Plus size={18} /> New question</button>
      </PageHeader>

      <div className="row-wrap" style={{ marginBottom: 20 }}>
        <div className="search" style={{ width: 240 }}>
          <Search size={17} />
          <input className="input" placeholder="Search text" aria-label="Search questions" value={filters.search} onChange={setFilter('search')} />
        </div>
        <select className="select" style={{ width: 'auto' }} aria-label="Subject" value={filters.subject} onChange={setFilter('subject')}>
          <option value="">All subjects</option>
          {subjects.data?.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select className="select" style={{ width: 'auto' }} aria-label="Topic" value={filters.topic} onChange={setFilter('topic')} disabled={!filters.subject}>
          <option value="">All topics</option>
          {topicsOfSubject.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        <select className="select" style={{ width: 'auto' }} aria-label="Difficulty" value={filters.difficulty} onChange={setFilter('difficulty')}>
          <option value="">Any difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
      </div>

      <Async state={questions}>
        {(list) =>
          list.length === 0 ? (
            <div className="card"><EmptyState icon={FileQuestion} title="No questions match" text="Change the filters or add a new question." /></div>
          ) : (
            <div className="card table-wrap">
              <table className="table">
                <thead><tr><th>Question</th><th>Topic</th><th>Level</th><th>Marks</th><th /></tr></thead>
                <tbody>
                  {list.map((q) => (
                    <tr key={q._id}>
                      <td><div className="q-line" title={q.text}>{q.text}</div></td>
                      <td><span className="small muted">{q.subject?.name}</span><div>{q.topic?.name}</div></td>
                      <td><span className={`badge badge-${DIFFICULTY_TONE[q.difficulty]}`}>{DIFFICULTY_LABEL[q.difficulty]}</span></td>
                      <td className="num">{q.marks}</td>
                      <td>
                        <div className="row" style={{ gap: 6 }}>
                          <button className="icon-btn" aria-label="Edit question" onClick={() => setEditing(q)}><Pencil size={16} /></button>
                          <button className="icon-btn" aria-label="Delete question" onClick={() => remove(q)}><Trash2 size={16} /></button>
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
        <QuestionForm
          question={editing === 'new' ? null : editing}
          subjects={subjects.data}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); questions.reload(); subjects.reload(); }}
        />
      )}
    </>
  );
}
