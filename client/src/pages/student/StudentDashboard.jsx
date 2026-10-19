import { Link } from 'react-router-dom';
import { Award, BookOpenCheck, Flame, Play, Sparkles, Target, Trophy } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import { usePractice } from '../../hooks/usePractice.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { fmtShortDate, toneForPercent } from '../../utils/format.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const startPractice = usePractice();
  const report = useFetch(() => api.get('/analytics/me'), []);
  const quizzes = useFetch(() => api.get('/quizzes'), []);
  const history = useFetch(() => api.get('/attempts/mine'), []);
  const board = useFetch(() => api.get('/leaderboard'), []);

  const rank = board.data?.find((s) => s.name === user.name)?.rank;
  const firstName = user.name.split(' ')[0];

  return (
    <>
      <PageHeader title={`Hi ${firstName}, ready to practise?`} subtitle="Here is where you stand and what is worth your time today.">
        <Link to="/quizzes" className="btn btn-primary"><BookOpenCheck size={18} /> Browse quizzes</Link>
      </PageHeader>

      <Async state={report}>
        {(r) => (
          <div className="stack">
            <div className="grid grid-4">
              <StatCard icon={Target} label="Average score" value={r.overall.averagePercentage} suffix="%" decimals={1} />
              <StatCard icon={Award} label="Quizzes finished" value={r.overall.attempts} tone="good" />
              <StatCard icon={Flame} label="Day streak" value={r.overall.streak} tone="warn" />
              <StatCard icon={Trophy} label="Leaderboard rank" value={rank ? `#${rank}` : '–'} tone="bad" />
            </div>

            <div className="grid grid-main">
              <div className="card">
                <div className="card-title">
                  <h3 className="row"><Sparkles size={20} color="var(--accent)" /> Recommended for you</h3>
                  <Link to="/progress" className="small">Full analysis</Link>
                </div>
                {r.recommendations.length === 0 ? (
                  <EmptyState icon={Sparkles} title={r.overall.attempts ? 'No weak topics right now' : 'Take your first quiz'} text={r.overall.attempts ? 'Keep taking quizzes: more answers make the analysis sharper.' : 'After a few answers we can tell which topics need attention.'} />
                ) : (
                  r.recommendations.slice(0, 2).map((rec) => (
                    <div className="reco" key={rec.topicId}>
                      <div className="row spread">
                        <h3>{rec.topic}</h3>
                        <span className="badge badge-bad">{Math.round(rec.mastery)}% mastery</span>
                      </div>
                      <p className="muted">{rec.message}</p>
                      <div><button className="btn btn-primary btn-sm" onClick={() => startPractice([rec.topicId])}>Practise this topic</button></div>
                    </div>
                  ))
                )}
              </div>

              <div className="card">
                <div className="card-title"><h3>Recent results</h3><Link to="/history" className="small">All</Link></div>
                <Async state={history}>
                  {(list) =>
                    list.length === 0 ? (
                      <p className="muted">Nothing here yet.</p>
                    ) : (
                      list.slice(0, 5).map((a) => (
                        <Link to={`/results/${a.id}`} key={a.id} className="row spread" style={{ padding: '10px 0', color: 'inherit', borderBottom: '1px solid var(--line)' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                            <div className="small muted">{fmtShortDate(a.submittedAt)}</div>
                          </div>
                          <span className={`badge badge-${toneForPercent(a.percentage)}`}>{Math.round(a.percentage)}%</span>
                        </Link>
                      ))
                    )
                  }
                </Async>
              </div>
            </div>
          </div>
        )}
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
