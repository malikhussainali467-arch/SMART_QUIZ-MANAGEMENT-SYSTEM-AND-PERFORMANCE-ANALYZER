import { Link } from 'react-router-dom';
import { AlertTriangle, ClipboardList, FileQuestion, PenLine, Target, Users } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import ActivityBars from '../../components/ActivityBars.jsx';
import BarRow from '../../components/BarRow.jsx';
import { fmtShortDate, toneForPercent } from '../../utils/format.js';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const overview = useFetch(() => api.get('/analytics/overview'), []);

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(' ')[0]}`} subtitle="How your class is doing right now.">
        <Link to="/teacher/quizzes" className="btn btn-primary"><ClipboardList size={18} /> Manage quizzes</Link>
      </PageHeader>

      <Async state={overview}>
        {(o) => (
          <div className="stack">
            <div className="grid grid-4">
              <StatCard icon={Users} label="Students" value={o.totals.students} />
              <StatCard icon={ClipboardList} label="Quizzes" value={o.totals.quizzes} tone="good" />
              <StatCard icon={FileQuestion} label="Questions" value={o.totals.questions} tone="warn" />
              <StatCard icon={Target} label="Class average" value={o.totals.averagePercentage} suffix="%" decimals={1} tone="bad" />
            </div>

            {o.totals.pendingReviews > 0 && (
              <div className="notice notice-info row spread">
                <span className="row"><PenLine size={18} /> {o.totals.pendingReviews} attempt(s) have written answers waiting for your review.</span>
                <Link to="/teacher/reviews" className="btn btn-soft btn-sm">Review now</Link>
              </div>
            )}

            <div className="grid grid-main">
              <div className="card">
                <div className="card-title"><h3>Submissions this week</h3></div>
                <ActivityBars data={o.activity} />
              </div>
              <div className="card">
                <div className="card-title"><h3>Weakest topics in the class</h3></div>
                {o.weakTopics.length === 0 ? <p className="muted">No weak topics yet.</p> : o.weakTopics.map((t) => (
                  <BarRow key={t.id} label={<>{t.name} <span className="small faint">{t.subjectName}</span></>} value={t.mastery} tone="bad" />
                ))}
              </div>
            </div>

            <div className="grid grid-2">
              <div className="card">
                <div className="card-title"><h3 className="row"><AlertTriangle size={19} color="var(--warn)" /> Students who may need help</h3></div>
                {o.atRisk.length === 0 ? <p className="muted">Everyone is above the line. Nice.</p> : o.atRisk.map((s) => (
                  <Link key={s.id} to={`/teacher/students/${s.id}`} className="row spread" style={{ padding: '10px 0', color: 'inherit', borderBottom: '1px solid var(--line)' }}>
                    <div><strong>{s.name}</strong><div className="small muted">Weakest: {s.weakestTopic || 'n/a'}</div></div>
                    <span className="badge badge-bad">{Math.round(s.averagePercentage)}% avg</span>
                  </Link>
                ))}
              </div>
              <div className="card">
                <div className="card-title"><h3>Latest submissions</h3></div>
                {o.recent.length === 0 ? <p className="muted">Nothing submitted yet.</p> : o.recent.map((r) => (
                  <Link key={r.id} to={`/results/${r.id}`} className="row spread" style={{ padding: '10px 0', color: 'inherit', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ minWidth: 0 }}><strong>{r.student}</strong><div className="small muted">{r.title} · {fmtShortDate(r.submittedAt)}</div></div>
                    <span className={`badge badge-${toneForPercent(r.percentage)}`}>{Math.round(r.percentage)}%</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </Async>
    </>
  );
}
