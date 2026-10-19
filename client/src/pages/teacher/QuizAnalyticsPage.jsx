import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, Target, Users } from 'lucide-react';
import { api } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import BarRow from '../../components/BarRow.jsx';
import { fmtDateTime, toneForPercent } from '../../utils/format.js';

export default function QuizAnalyticsPage() {
  const { id } = useParams();
  const report = useFetch(() => api.get(`/analytics/quizzes/${id}`), [id]);

  return (
    <Async state={report}>
      {({ quiz, stats, distribution, questions, attempts }) => {
        const maxBucket = Math.max(...distribution.map((d) => d.count), 1);
        return (
          <>
            <PageHeader title={quiz.title} subtitle="Results and question difficulty for this quiz.">
              <Link to="/teacher/quizzes" className="btn btn-ghost"><ArrowLeft size={17} /> All quizzes</Link>
            </PageHeader>

            <div className="stack">
              <div className="grid grid-4">
                <StatCard icon={Users} label="Attempts" value={stats.attempts} />
                <StatCard icon={Target} label="Average" value={stats.average} suffix="%" decimals={1} tone="warn" />
                <StatCard icon={Award} label="Pass rate" value={stats.passRate} suffix="%" tone="good" />
                <StatCard icon={Award} label="Highest score" value={stats.highest} suffix="%" tone="bad" />
              </div>

              <div className="grid grid-2">
                <div className="card">
                  <div className="card-title"><h3>Score distribution</h3></div>
                  {distribution.map((d) => <BarRow key={d.label} label={d.label} right={`${d.count} student attempt(s)`} value={(d.count / maxBucket) * 100} />)}
                </div>
                <div className="card">
                  <div className="card-title"><h3>Question difficulty</h3><span className="small muted">share answered correctly</span></div>
                  {questions.map((q) => (
                    <BarRow
                      key={q.id}
                      label={<span className="q-line" style={{ maxWidth: 300, display: 'inline-block', verticalAlign: 'bottom' }} title={q.text}>{q.text}</span>}
                      right={q.correctRate === null ? 'no data' : `${Math.round(q.correctRate)}%${q.flag === 'hard' ? ' · hard' : q.flag === 'easy' ? ' · easy' : ''}`}
                      value={q.correctRate ?? 0}
                      tone={q.correctRate === null ? '' : toneForPercent(q.correctRate)}
                    />
                  ))}
                </div>
              </div>

              <div className="card table-wrap">
                <div className="card-title"><h3>Attempts</h3></div>
                {attempts.length === 0 ? <p className="muted">No one has taken this quiz yet.</p> : (
                  <table className="table">
                    <thead><tr><th>Student</th><th>Score</th><th>Submitted</th><th /></tr></thead>
                    <tbody>
                      {attempts.map((a) => (
                        <tr key={a.id}>
                          <td><strong>{a.student}</strong></td>
                          <td className="num">{a.score}/{a.totalMarks} <span className={`badge badge-${toneForPercent(a.percentage)}`} style={{ marginLeft: 8 }}>{Math.round(a.percentage)}%</span>{a.pendingReview && <span className="badge badge-warn" style={{ marginLeft: 6 }}>To review</span>}</td>
                          <td className="muted">{fmtDateTime(a.submittedAt)}</td>
                          <td><Link to={`/results/${a.id}`} className="btn btn-soft btn-sm">Open</Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        );
      }}
    </Async>
  );
}
