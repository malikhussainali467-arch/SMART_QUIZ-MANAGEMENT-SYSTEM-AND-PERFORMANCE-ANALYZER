import { Award, Flame, ListChecks, Medal, Sparkles, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from './StatCard.jsx';
import TrendChart from './TrendChart.jsx';
import BarRow from './BarRow.jsx';
import EmptyState from './EmptyState.jsx';
import { STATUS, TREND } from '../utils/format.js';

/**
 * The full performance picture of ONE student. Used on the student's "My progress" page
 * and on the teacher's student-detail page. Pass `onPractice` to show practice buttons.
 */
export default function PerformanceView({ report, onPractice }) {
  const { overall, subjects, topics, series, recommendations, badges, weakTopics } = report;

  if (overall.attempts === 0) {
    return <EmptyState icon={Target} title="No results yet" text="Finish a quiz and your strengths, weak topics and practice tips will show up here." />;
  }

  return (
    <div className="stack">
      <div className="grid grid-4">
        <StatCard icon={Target} label="Average score" value={overall.averagePercentage} suffix="%" decimals={1} />
        <StatCard icon={Award} label="Best score" value={overall.bestPercentage} suffix="%" tone="good" />
        <StatCard icon={ListChecks} label="Questions answered" value={overall.questionsAnswered} tone="warn" />
        <StatCard icon={Flame} label="Day streak" value={overall.streak} tone={overall.streak ? 'bad' : ''} />
      </div>

      <div className="grid grid-main">
        <div className="card">
          <div className="card-title"><h3>Score trend</h3><span className="small muted">last {series.length} attempts</span></div>
          <TrendChart series={series} />
        </div>
        <div className="card">
          <div className="card-title"><h3>Accuracy by subject</h3></div>
          {subjects.map((s) => <BarRow key={s.subjectId} label={s.name} value={s.accuracy} color={s.color} />)}
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <h3 className="row"><Sparkles size={20} color="var(--accent)" /> What to practise next</h3>
        </div>
        {recommendations.length === 0 ? (
          <div className="notice notice-info">
            No weak topics right now{weakTopics.length === 0 && topics.some((t) => t.status === 'unknown') ? ' (some topics still need more answers to be judged)' : ''}. Keep going with quizzes to stay sharp.
          </div>
        ) : (
          recommendations.map((r) => (
            <div className="reco" key={r.topicId}>
              <div className="row-wrap spread">
                <div>
                  <h3>{r.topic}</h3>
                  <span className="small muted">{r.subject}</span>
                </div>
                <span className="badge badge-bad">{Math.round(r.mastery)}% mastery</span>
              </div>
              <p>{r.message} <span className="muted">{r.level}.</span></p>
              <div className="row-wrap">
                {onPractice && (
                  <button className="btn btn-primary btn-sm" onClick={() => onPractice([r.topicId])}>Practise {r.topic}</button>
                )}
                {r.quizzes.map((q) => (
                  onPractice && <Link key={q.id} to="/quizzes" className="btn btn-ghost btn-sm">Quiz: {q.title}</Link>
                ))}
                {!onPractice && <span className="small muted">{r.questionsAvailable} practice questions available</span>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="card-title">
          <h3>Topic mastery</h3>
          <span className="small muted">Recent and harder answers count more</span>
        </div>
        {topics.map((t) => {
          const status = STATUS[t.status];
          const trend = t.trend && TREND[t.trend];
          return (
            <div className="topic-row" key={t.id}>
              <div className="row-wrap" style={{ gap: 8 }}>
                <span className="dot" style={{ background: t.color }} />
                <strong>{t.name}</strong>
                <span className="small faint">{t.subjectName}</span>
              </div>
              <div className="row-wrap" style={{ gap: 8 }}>
                {trend && t.trend !== 'steady' && (
                  <span className={`badge badge-${trend.tone}`}>
                    {t.trend === 'improving' ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {trend.label}
                  </span>
                )}
                <span className={`badge badge-${status.tone}`}>{status.label}</span>
                <span className="num muted small" style={{ minWidth: 76, textAlign: 'right' }}>{Math.round(t.mastery)}% · {t.answered} Qs</span>
              </div>
              <div className="bar-track">
                <div className={`bar-fill ${status.tone === 'muted' ? '' : status.tone}`} style={{ width: `${t.mastery}%`, opacity: t.status === 'unknown' ? 0.45 : 1 }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-title"><h3>Badges</h3></div>
        <div className="badge-grid">
          {badges.map((b) => (
            <div key={b.id} className={`badge-tile ${b.earned ? 'earned' : ''}`}>
              <span className="medal"><Medal size={22} /></span>
              <strong>{b.title}</strong>
              <span className="muted">{b.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
