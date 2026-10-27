import { Link } from 'react-router-dom';
import { Award, BookOpenCheck, Play, Target } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { fmtShortDate, toneForPercent } from '../../utils/format.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const quizzes = useFetch(() => api.get('/quizzes'), []);
  const history = useFetch(() => api.get('/attempts/mine'), []);

  const firstName = user.name.split(' ')[0];

  return (
    <>
      <PageHeader title={`Hi ${firstName}!`} subtitle="Welcome to Smart Quiz. Here is your current progress.">
        <Link to="/quizzes" className="btn btn-primary"><BookOpenCheck size={18} /> Browse quizzes</Link>
      </PageHeader>

      <Async state={history}>
        {(list) => {
          const attemptsCount = list.length;
          const avgScore = attemptsCount
            ? Math.round(list.reduce((sum, a) => sum + a.percentage, 0) / attemptsCount)
            : 0;
          const passedCount = list.filter((a) => a.percentage >= (a.passPercent ?? 50)).length;

          return (
            <div className="stack">
              <div className="grid grid-3">
                <StatCard icon={Target} label="Average score" value={avgScore} suffix="%" />
                <StatCard icon={Award} label="Quizzes finished" value={attemptsCount} tone="good" />
                <StatCard icon={BookOpenCheck} label="Quizzes passed" value={passedCount} tone="good" />
              </div>

              <div className="card">
                <div className="card-title">
                  <h3>Recent results</h3>
                  <Link to="/history" className="small">View all</Link>
                </div>
                {list.length === 0 ? (
                  <p className="muted">No quiz attempts yet. Start by browsing available quizzes!</p>
                ) : (
                  list.slice(0, 5).map((a) => (
                    <Link
                      to={`/results/${a.id}`}
                      key={a.id}
                      className="row spread"
                      style={{ padding: '10px 0', color: 'inherit', borderBottom: '1px solid var(--line)' }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {a.title}
                        </div>
                        <div className="small muted">{fmtShortDate(a.submittedAt)}</div>
                      </div>
                      <span className={`badge badge-${toneForPercent(a.percentage)}`}>{Math.round(a.percentage)}%</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        }}
      </Async>

      <Async state={quizzes}>
        {(list) => {
          const resumable = list.filter((q) => q.inProgressAttemptId);
          if (!resumable.length) return null;
          return (
            <div className="card" style={{ marginTop: 18 }}>
              <div className="card-title"><h3>Continue where you left off</h3></div>
              {resumable.map((q) => (
                <div className="row spread" key={q._id}>
                  <strong>{q.title}</strong>
                  <Link to={`/attempt/${q.inProgressAttemptId}`} className="btn btn-primary btn-sm"><Play size={15} /> Resume</Link>
                </div>
              ))}
            </div>
          );
        }}
      </Async>
    </>
  );
}
