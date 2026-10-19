import { Link } from 'react-router-dom';
import { History as HistoryIcon, Hourglass } from 'lucide-react';
import { api } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { fmtDateTime, toneForPercent } from '../../utils/format.js';

export default function HistoryPage() {
  const history = useFetch(() => api.get('/attempts/mine'), []);

  return (
    <>
      <PageHeader title="History" subtitle="Every quiz and practice set you have finished." />
      <Async state={history}>
        {(list) =>
          list.length === 0 ? (
            <div className="card"><EmptyState icon={HistoryIcon} title="No attempts yet" text="Your finished quizzes will be listed here." action={<Link to="/quizzes" className="btn btn-primary">Find a quiz</Link>} /></div>
          ) : (
            <div className="card table-wrap">
              <table className="table">
                <thead><tr><th>Quiz</th><th>Type</th><th>Score</th><th>Result</th><th>Finished</th><th /></tr></thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id}>
                      <td><strong>{a.title}</strong></td>
                      <td><span className={`badge ${a.kind === 'practice' ? '' : 'badge-muted'}`}>{a.kind === 'practice' ? 'Practice' : 'Quiz'}</span></td>
                      <td className="num">{a.score} / {a.totalMarks} <span className={`badge badge-${toneForPercent(a.percentage)}`} style={{ marginLeft: 8 }}>{Math.round(a.percentage)}%</span></td>
                      <td>
                        {a.percentage >= a.passPercent ? <span className="badge badge-good">Passed</span> : <span className="badge badge-bad">Not passed</span>}
                        {a.pendingReview && <span className="badge badge-warn" style={{ marginLeft: 6 }}><Hourglass size={12} /> In review</span>}
                      </td>
                      <td className="muted">{fmtDateTime(a.submittedAt)}</td>
                      <td><Link to={`/results/${a.id}`} className="btn btn-soft btn-sm">Review</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </Async>
    </>
  );
}
