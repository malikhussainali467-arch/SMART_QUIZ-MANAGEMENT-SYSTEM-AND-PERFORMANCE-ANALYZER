import { Flame, Trophy } from 'lucide-react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFetch } from '../../hooks/useFetch.js';
import Async from '../../components/Async.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { initials } from '../../utils/format.js';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const board = useFetch(() => api.get('/leaderboard'), []);

  return (
    <>
      <PageHeader title="Leaderboard" subtitle="Points are the sum of your best score in each quiz, so retakes can only help." />
      <Async state={board}>
        {(rows) => {
          if (!rows.length) return <div className="card"><EmptyState icon={Trophy} title="No scores yet" text="Be the first to finish a quiz." /></div>;
          const top = rows.slice(0, 3);
          const order = [top[1], top[0], top[2]].filter(Boolean); // 2nd, 1st, 3rd

          return (
            <>
              <div className="podium">
                {order.map((s) => (
                  <div key={s.id} className={`card podium-step ${s.rank === 1 ? 'first' : ''}`}>
                    <span className="avatar">{initials(s.name)}</span>
                    <strong>{s.name}</strong>
                    <span className="badge">{s.points} pts</span>
                    <span className="small muted">#{s.rank} · {s.average}% avg</span>
                  </div>
                ))}
              </div>

              <div className="card table-wrap">
                <table className="table">
                  <thead><tr><th>Rank</th><th>Student</th><th>Quizzes</th><th>Average</th><th>Streak</th><th>Points</th></tr></thead>
                  <tbody>
                    {rows.map((s) => (
                      <tr key={s.id} className={s.name === user.name ? 'me' : ''}>
                        <td><span className={`rank ${s.rank <= 3 ? 'top' : ''}`}>{s.rank}</span></td>
                        <td><strong>{s.name}</strong>{s.name === user.name && <span className="badge" style={{ marginLeft: 8 }}>You</span>}</td>
                        <td className="num">{s.quizzes}</td>
                        <td className="num">{s.average}%</td>
                        <td>{s.streak > 0 ? <span className="badge badge-warn"><Flame size={12} /> {s.streak}</span> : <span className="faint">–</span>}</td>
                        <td className="num"><strong>{s.points}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          );
        }}
      </Async>
    </>
  );
}
