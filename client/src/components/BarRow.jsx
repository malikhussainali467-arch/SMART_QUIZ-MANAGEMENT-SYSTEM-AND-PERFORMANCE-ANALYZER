import { useMounted } from '../hooks/useMounted.js';

/** One labelled horizontal bar that grows from 0 when it appears. */
export default function BarRow({ label, right, value, tone = '', color }) {
  const ready = useMounted();
  return (
    <div className="bar-row">
      <div className="bar-head">
        <span>{label}</span>
        <span className="muted num">{right ?? `${Math.round(value)}%`}</span>
      </div>
      <div className="bar-track">
        <div className={`bar-fill ${tone}`} style={{ width: ready ? `${Math.min(value, 100)}%` : 0, ...(color && { background: color }) }} />
      </div>
    </div>
  );
}
