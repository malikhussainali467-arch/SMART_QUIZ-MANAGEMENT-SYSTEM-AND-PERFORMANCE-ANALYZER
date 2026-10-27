import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Target, Users } from 'lucide-react';
import { api } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import { fmtDateTime, toneForPercent } from '../../utils/format.js';

export default function QuizAnalyticsPage() {
  const { id } = useParams();
  const report = useFetch(() => api.get(`/analytics/quizzes/${id}`), [id]);

  return (
    <Async state={report}>
      {({ quiz, stats, attempts }) => (
        <>
          <PageHeader title={quiz.title} subtitle="Results and student attempts for this quiz.">
            <Link to="/teacher/quizzes" className="btn btn-ghost"><ArrowLeft size={17} /> All quizzes</Link>
          </PageHeader>

          <div className="stack">
            <div className="grid grid-4">
              <StatCard icon={Users} label="Attempts" value={stats.attempts} />
              <StatCard icon={Target} label="Average" value={stats.average} suffix="%" decimals={1} tone="warn" />
              <StatCard icon={Award} label="Pass rate" value={stats.passRate} suffix="%" tone="good" />
              <StatCard icon={Award} label="Highest score" value={stats.highest} suffix="%" tone="good" />
            </div>

            <div className="card table-wrap">
              <div className="card-title"><h3>Attempts</h3></div>
              {attempts.length === 0 ? (
                <p className="muted">No one has taken this quiz yet.</p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Score</th>
                      <th>Submitted</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((a) => (
                      <tr key={a.id}>
                        <td><strong>{a.student}</strong></td>
                        <td className="num">
                          {a.score}/{a.totalMarks}{' '}
                          <span className={`badge badge-${toneForPercent(a.percentage)}`} style={{ marginLeft: 8 }}>
                            {Math.round(a.percentage)}%
                          </span>
                        </td>
                        <td className="muted">{fmtDateTime(a.submittedAt)}</td>
                        <td>
                          <Link to={`/results/${a.id}`} className="btn btn-soft btn-sm">Open</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </Async>
  );
}
