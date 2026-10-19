import { useMounted } from '../hooks/useMounted.js';
import { useCountUp } from '../hooks/useCountUp.js';

const COLORS = { good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)', brand: 'url(#ringGradient)' };

/** Circular progress. `value` is 0-100. */
export default function ProgressRing({ value, size = 160, stroke = 14, tone = 'brand', caption }) {
  const ready = useMounted();
  const shown = useCountUp(value, 1100);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = ready ? circumference * (1 - Math.min(value, 100) / 100) : circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(value)} percent`}>
      <defs>
        <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6d4aff" />
          <stop offset="100%" stopColor="#ff4fa3" />
        </linearGradient>
      </defs>
      <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} />
      <circle
        className="ring-arc"
        cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} strokeLinecap="round"
        stroke={COLORS[tone]} strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text className="ring-text" x="50%" y={caption ? '47%' : '52%'} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.24}>
        {Math.round(shown)}%
      </text>
      {caption && (
        <text x="50%" y="66%" textAnchor="middle" fill="var(--ink-soft)" fontSize={size * 0.09}>
          {caption}
        </text>
      )}
    </svg>
  );
}
