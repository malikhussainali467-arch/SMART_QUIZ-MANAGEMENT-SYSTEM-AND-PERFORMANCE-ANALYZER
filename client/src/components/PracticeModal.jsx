import { useState } from 'react';
import Modal from './Modal.jsx';
import Async from './Async.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { api } from '../api/client.js';

/** Lets a student build their own practice set: pick topics and how many questions. */
export default function PracticeModal({ onClose, onStart, busy }) {
  const subjects = useFetch(() => api.get('/subjects'), []);
  const [picked, setPicked] = useState([]);
  const [count, setCount] = useState(10);

  const toggle = (id) => setPicked((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  return (
    <Modal
      title="Build a practice set"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy} onClick={() => onStart(picked, count)}>
            {picked.length ? 'Start practice' : 'Start mixed practice'}
          </button>
        </>
      }
    >
      <p className="muted" style={{ marginBottom: 16 }}>
        Questions you got wrong last time come first, then ones you have not seen yet. Leave topics empty for a mix.
      </p>
      <Async state={subjects}>
        {(list) => (
          <div className="stack">
            {list.map((s) => (
              <div key={s._id}>
                <div className="label" style={{ marginBottom: 8 }}>{s.name}</div>
                <div className="chips">
                  {s.topics.map((t) => (
                    <button key={t._id} type="button" disabled={t.questionCount === 0} className={`chip ${picked.includes(t._id) ? 'active' : ''}`} onClick={() => toggle(t._id)}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="field" style={{ maxWidth: 200 }}>
              <label htmlFor="count">Number of questions</label>
              <select id="count" className="select" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        )}
      </Async>
    </Modal>
  );
}
