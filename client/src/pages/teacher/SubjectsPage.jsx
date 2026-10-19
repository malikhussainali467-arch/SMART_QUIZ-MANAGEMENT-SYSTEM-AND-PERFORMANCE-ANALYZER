import { useState } from 'react';
import { Layers, Pencil, Plus, Trash2, X } from 'lucide-react';
import { api } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import Modal from '../../components/Modal.jsx';

const EMPTY = { name: '', description: '', color: '#6d4aff' };

export default function SubjectsPage() {
  const toast = useToast();
  const subjects = useFetch(() => api.get('/subjects'), []);
  const [editing, setEditing] = useState(null); // null | { ...subject } | EMPTY
  const [newTopic, setNewTopic] = useState({}); // subjectId -> text typed in the "add topic" box

  /** Runs an API call, shows a toast and reloads the list. */
  async function run(action, success) {
    try {
      await action();
      toast.success(success);
      subjects.reload();
      return true;
    } catch (e) {
      toast.error(e.message);
      return false;
    }
  }

  async function saveSubject() {
    const { _id, name, description, color } = editing;
    const ok = await run(() => (_id ? api.put(`/subjects/${_id}`, { name, description, color }) : api.post('/subjects', { name, description, color })), 'Subject saved');
    if (ok) setEditing(null);
  }

  async function addTopic(subjectId) {
    const name = (newTopic[subjectId] || '').trim();
    if (!name) return;
    if (await run(() => api.post(`/subjects/${subjectId}/topics`, { name }), 'Topic added')) setNewTopic({ ...newTopic, [subjectId]: '' });
  }

  return (
    <>
      <PageHeader title="Subjects & topics" subtitle="Questions are organised by topic. Topics drive the weak-area analysis.">
        <button className="btn btn-primary" onClick={() => setEditing({ ...EMPTY })}><Plus size={18} /> New subject</button>
      </PageHeader>

      <Async state={subjects}>
        {(list) =>
          list.length === 0 ? (
            <div className="card"><EmptyState icon={Layers} title="No subjects yet" text="Create a subject, then add its topics." /></div>
          ) : (
            <div className="stack">
              {list.map((s) => (
                <div className="card subject-card" key={s._id} style={{ '--subject': s.color }}>
                  <div className="card-title">
                    <div>
                      <h2>{s.name}</h2>
                      {s.description && <p className="muted small" style={{ marginTop: 4 }}>{s.description}</p>}
                    </div>
                    <div className="row">
                      <button className="icon-btn" aria-label={`Edit ${s.name}`} onClick={() => setEditing(s)}><Pencil size={17} /></button>
                      <button className="icon-btn" aria-label={`Delete ${s.name}`} onClick={() => window.confirm(`Delete "${s.name}" and its topics?`) && run(() => api.del(`/subjects/${s._id}`), 'Subject deleted')}><Trash2 size={17} /></button>
                    </div>
                  </div>

                  <div className="row-wrap" style={{ gap: 8 }}>
                    {s.topics.map((t) => (
                      <span className="topic-pill" key={t._id}>
                        {t.name} <span className="faint small">{t.questionCount} Qs</span>
                        <button aria-label={`Delete topic ${t.name}`} onClick={() => run(() => api.del(`/topics/${t._id}`), 'Topic deleted')}><X size={14} /></button>
                      </span>
                    ))}
                    <form className="row" onSubmit={(e) => { e.preventDefault(); addTopic(s._id); }}>
                      <input className="input" style={{ width: 190, padding: '7px 12px' }} placeholder="Add a topic" aria-label={`New topic for ${s.name}`} value={newTopic[s._id] || ''} onChange={(e) => setNewTopic({ ...newTopic, [s._id]: e.target.value })} />
                      <button className="btn btn-soft btn-sm">Add</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </Async>

      {editing && (
        <Modal
          title={editing._id ? 'Edit subject' : 'New subject'}
          onClose={() => setEditing(null)}
          footer={<><button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary" onClick={saveSubject}>Save subject</button></>}
        >
          <div className="stack">
            <div className="field"><label htmlFor="sname">Name</label><input id="sname" className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="field"><label htmlFor="sdesc">Description</label><input id="sdesc" className="input" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="field"><label htmlFor="scolor">Colour</label><input id="scolor" type="color" className="input" style={{ height: 46, padding: 4 }} value={editing.color} onChange={(e) => setEditing({ ...editing, color: e.target.value })} /></div>
          </div>
        </Modal>
      )}
    </>
  );
}
