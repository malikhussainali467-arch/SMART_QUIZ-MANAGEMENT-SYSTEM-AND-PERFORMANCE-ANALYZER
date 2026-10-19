import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users } from 'lucide-react';
import { api } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { fmtDate, initials, toneForPercent } from '../../utils/format.js';

export default function StudentsPage() {
  const students = useFetch(() => api.get('/analytics/students'), []);
  const [search, setSearch] = useState('');

  return (
    <>
      <PageHeader title="Students" subtitle="Open a student to see their topic-by-topic performance." />
      <div className="search" style={{ width: 280, marginBottom: 20 }}>
        <Search size={17} />
        <input className="input" placeholder="Search by name or email" aria-label="Search students" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Async state={students}>
        {(list) => {
          const shown = list.filter((s) => `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase()));
          return shown.length === 0 ? (
            <div className="card"><EmptyState icon={Users} title="No students found" /></div>
          ) : (
            <div className="card table-wrap">
              <table className="table">
                <thead><tr><th>Student</th><th>Attempts</th><th>Average</th><th>Weak topics</th><th>Last active</th><th /></tr></thead>
                <tbody>
                  {shown.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="row">
                          <span className="avatar" style={{ width: 36, height: 36, fontSize: '.85rem' }}>{initials(s.name)}</span>
                          <div><strong>{s.name}</strong><div className="small muted">{s.email}</div></div>
                        </div>
                      </td>
                      <td className="num">{s.attempts}</td>
                      <td>{s.averagePercentage === null ? <span className="faint">–</span> : <span className={`badge badge-${toneForPercent(s.averagePercentage)}`}>{Math.round(s.averagePercentage)}%</span>}</td>
                      <td>{s.weakTopics ? <span className="small">{s.weakTopics} · <span className="muted">{s.weakestTopic}</span></span> : <span className="faint">–</span>}</td>
                      <td className="muted">{s.lastActive ? fmtDate(s.lastActive) : 'Never'}</td>
                      <td><Link to={`/teacher/students/${s.id}`} className="btn btn-soft btn-sm">Details</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }}
      </Async>
    </>
  );
}
