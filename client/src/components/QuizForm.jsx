import { useState } from 'react';
import Modal from './Modal.jsx';
import Async from './Async.jsx';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import { useFetch } from '../hooks/useFetch.js';

/** Small on/off switch with a label. */
function Toggle({ label, checked, onChange }) {
  return (
    <label className="check">
      <span className="switch"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><span /></span>
      {label}
    </label>
  );
}

/** Create / edit a quiz: settings + choose which questions are in the pool. */
export default function QuizForm({ quiz, subjects, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(quiz?._id);
  const [form, setForm] = useState(() => ({
    title: quiz?.title || '',
    description: quiz?.description || '',
    subject: quiz?.subject?._id || quiz?.subject || subjects[0]?._id || '',
    questions: quiz?.questions || [],
    questionCount: quiz?.questionCount ?? 0,
    durationMinutes: quiz?.durationMinutes ?? 15,
    passPercent: quiz?.passPercent ?? 50,
    maxAttempts: quiz?.maxAttempts ?? 0,
    shuffleQuestions: quiz?.shuffleQuestions ?? true,
    shuffleOptions: quiz?.shuffleOptions ?? true,
    isPublished: quiz?.isPublished ?? false,
  }));
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const bank = useFetch(() => api.get(`/questions?subject=${form.subject}`), [form.subject]);
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const num = (field) => (e) => setForm({ ...form, [field]: Number(e.target.value) });

  const toggleQuestion = (id) =>
    setForm({ ...form, questions: form.questions.includes(id) ? form.questions.filter((q) => q !== id) : [...form.questions, id] });

  async function save() {
    setSaving(true);
    try {
      await (isEdit ? api.put(`/quizzes/${quiz._id}`, form) : api.post('/quizzes', form));
      toast.success(isEdit ? 'Quiz updated' : 'Quiz created');
      onSaved();
    } catch (e) {
      toast.error(e.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      wide
      title={isEdit ? 'Edit quiz' : 'New quiz'}
      onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save quiz'}</button></>}
    >
      <div className="form-grid">
        <div className="field full"><label htmlFor="qztitle">Title</label><input id="qztitle" className="input" value={form.title} onChange={set('title')} /></div>
        <div className="field full"><label htmlFor="qzdesc">Description</label><input id="qzdesc" className="input" value={form.description} onChange={set('description')} /></div>
        <div className="field">
          <label htmlFor="qzsubject">Subject</label>
          <select id="qzsubject" className="select" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value, questions: [] })}>
            {subjects.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="qzdur">Time limit (minutes, 0 = untimed)</label><input id="qzdur" type="number" min="0" className="input" value={form.durationMinutes} onChange={num('durationMinutes')} /></div>
        <div className="field"><label htmlFor="qzcount">Questions per attempt (0 = all in pool)</label><input id="qzcount" type="number" min="0" className="input" value={form.questionCount} onChange={num('questionCount')} /></div>
        <div className="field"><label htmlFor="qzpass">Pass mark (%)</label><input id="qzpass" type="number" min="0" max="100" className="input" value={form.passPercent} onChange={num('passPercent')} /></div>
        <div className="field"><label htmlFor="qzmax">Max attempts (0 = unlimited)</label><input id="qzmax" type="number" min="0" className="input" value={form.maxAttempts} onChange={num('maxAttempts')} /></div>
        <div className="field" style={{ alignContent: 'end', gap: 12 }}>
          <Toggle label="Shuffle questions" checked={form.shuffleQuestions} onChange={(v) => setForm({ ...form, shuffleQuestions: v })} />
          <Toggle label="Shuffle answer options" checked={form.shuffleOptions} onChange={(v) => setForm({ ...form, shuffleOptions: v })} />
          <Toggle label="Published (visible to students)" checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} />
        </div>

        <div className="field full">
          <div className="row spread">
            <span className="label">Question pool ({form.questions.length} selected)</span>
            <span className="row">
              <button type="button" className="btn btn-soft btn-sm" onClick={() => setForm({ ...form, questions: [...new Set([...form.questions, ...(bank.data || []).map((q) => q._id)])] })}>Select all</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ ...form, questions: [] })}>Clear</button>
            </span>
          </div>
          <input className="input" placeholder="Filter questions or topics" aria-label="Filter questions" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Async state={bank}>
            {(list) => {
              const shown = list.filter((q) => `${q.text} ${q.topic?.name}`.toLowerCase().includes(search.toLowerCase()));
              return (
                <div className="picker">
                  {shown.length === 0 && <div className="picker-row muted">No questions in this subject yet.</div>}
                  {shown.map((q) => (
                    <label className="picker-row" key={q._id}>
                      <input type="checkbox" checked={form.questions.includes(q._id)} onChange={() => toggleQuestion(q._id)} />
                      <span><span>{q.text}</span><br /><span className="small muted">{q.topic?.name} · {q.type === 'mcq' ? 'MCQ' : 'Written'} · {q.difficulty}</span></span>
                    </label>
                  ))}
                </div>
              );
            }}
          </Async>
        </div>
      </div>
    </Modal>
  );
}
