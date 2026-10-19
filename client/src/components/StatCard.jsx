import { useCountUp } from '../hooks/useCountUp.js';

/** A number with a label. Numbers count up when the card appears. */
export default function StatCard({ icon: Icon, label, value, suffix = '', tone = '', decimals = 0 }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const shown = typeof value === 'number' ? animated.toFixed(decimals) : value;

  return (
    <div className="card stat">
      <div className={`stat-icon ${tone}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="stat-value">
          {shown}
          {suffix}
        </div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
