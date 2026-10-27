import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from './Modal.jsx';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

const MAX_OPTIONS = 6;

/** Create / edit one MCQ question. `subjects` = list with their topics. */
export default function QuestionForm({ question, subjects, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = Boolean(question?._id);
  const firstTopic = subjects[0]?.topics[0]?._id || '';

  const [form, setForm] = useState(() => ({
    topic: question?.topic?._id || firstTopic,
    type: 'mcq',
    text: question?.text || '',
    difficulty: question?.difficulty || 'medium',
    marks: question?.marks || 1,
    explanation: question?.explanation || '',
    options: question?.options?.length ? question.options : ['', '', '', ''],
    correctIndex: question?.correctIndex || 0,
  }));
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setOption = (i, value) => setForm({ ...form, options: form.options.map((o, n) => (n === i ? value : o)) });
  const removeOption = (i) =>
    setForm({
      ...form,
      options: form.options.filter((_, n) => n !== i),
      correctIndex: form.correctIndex === i ? 0 : form.correctIndex > i ? form.correctIndex - 1 : form.correctIndex,
    });

  async function save() {
    setSaving(true);
    const body = {
      ...form,
      type: 'mcq',
      marks: Number(form.marks),
    };
    try {
      await (isEdit ? api.put(`/questions/${question._id}`, body) : api.post('/questions', body));
      toast.success('Question saved');
      onSaved();
    } catch (e) {
      toast.error(e.message);
      setSaving(false);
    }
  }

  return (
    <Modal
      wide
      title={isEdit ? 'Edit question' : 'New question'}
      onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save question'}</button></>}
    >
      <div className="form-grid">
        <div className="field">
          <label htmlFor="qtopic">Topic</label>
          <select id="qtopic" className="select" value={form.topic} onChange={set('topic')}>
            {subjects.map((s) => (
              <optgroup key={s._id} label={s.name}>
                {s.topics.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
              </optgroup>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="qdiff">Difficulty</label>
          <select id="qdiff" className="select" value={form.difficulty} onChange={set('difficulty')}>
            <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="qmarks">Marks</label>
          <input id="qmarks" type="number" min="0.5" step="0.5" className="input" value={form.marks} onChange={set('marks')} />
        </div>
        <div className="field full">
          <label htmlFor="qtext">Question</label>
          <textarea id="qtext" className="textarea" value={form.text} onChange={set('text')} />
        </div>

        <div className="field full">
          <span className="label">Options (select the correct one)</span>
          {form.options.map((option, i) => (
            <div className="option-edit" key={i}>
              <input type="radio" name="correct" checked={form.correctIndex === i} onChange={() => setForm({ ...form, correctIndex: i })} aria-label={`Option ${i + 1} is correct`} />
              <input className="input" value={option} placeholder={`Option ${i + 1}`} onChange={(e) => setOption(i, e.target.value)} />
              {form.options.length > 2 && <button type="button" className="icon-btn" aria-label="Remove option" onClick={() => removeOption(i)}><Trash2 size={16} /></button>}
            </div>
          ))}
          {form.options.length < MAX_OPTIONS && (
            <div><button type="button" className="btn btn-soft btn-sm" onClick={() => setForm({ ...form, options: [...form.options, ''] })}><Plus size={15} /> Add option</button></div>
          )}
        </div>

        <div className="field full">
          <label htmlFor="qexp">Explanation (optional)</label>
          <input id="qexp" className="input" value={form.explanation} onChange={set('explanation')} />
        </div>
      </div>
    </Modal>
  );
}
