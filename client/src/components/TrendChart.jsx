import { useId } from 'react';
import { fmtShortDate } from '../utils/format.js';

const W = 620;
const H = 230;
const PAD = { top: 16, right: 20, bottom: 30, left: 38 };

/** Line chart of percentages over time. `series` = [{ date, percentage, title }] */
export default function TrendChart({ series }) {
  const gradientId = useId().replace(/:/g, '');
  if (series.length < 2) return <p className="muted small">Finish at least two quizzes to see your trend.</p>;

  const x = (i) => PAD.left + (i / (series.length - 1)) * (W - PAD.left - PAD.right);
  const y = (v) => PAD.top + (1 - v / 100) * (H - PAD.top - PAD.bottom);
  const line = series.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.percentage)}`).join(' ');
  const area = `${line} L${x(series.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Score trend" style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6d4aff" />
          <stop offset="100%" stopColor="#ff4fa3" />
        </linearGradient>
        <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((tick) => (
        <g key={tick}>
          <line className="trend-grid" x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} />
          <text className="trend-label" x={PAD.left - 8} y={y(tick) + 4} textAnchor="end">{tick}</text>
        </g>
      ))}
      <path d={area} fill={`url(#${gradientId}-area)`} />
      <path d={line} className="trend-line" style={{ stroke: `url(#${gradientId}-line)` }} />
      {series.map((p, i) => (
        <g key={i}>
          <circle className="trend-dot" cx={x(i)} cy={y(p.percentage)} r="5">
            <title>{`${p.title}: ${Math.round(p.percentage)}%`}</title>
          </circle>
          {(i === 0 || i === series.length - 1 || series.length <= 6) && (
            <text className="trend-label" x={x(i)} y={H - 8} textAnchor="middle">{fmtShortDate(p.date)}</text>
          )}
        </g>
      ))}
    </svg>
  );
}
