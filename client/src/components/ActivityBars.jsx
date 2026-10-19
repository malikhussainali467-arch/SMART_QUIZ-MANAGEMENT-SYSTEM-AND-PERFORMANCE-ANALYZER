import { useMounted } from '../hooks/useMounted.js';

/** Small bar chart: [{ label, count }] */
export default function ActivityBars({ data }) {
  const ready = useMounted();
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="activity-bars">
      {data.map((d) => (
        <div className="activity-col" key={d.label}>
          <span className="small muted num">{d.count}</span>
          <div className="activity-bar" style={{ height: ready ? `${(d.count / max) * 100}px` : 0 }} />
          <span className="small faint">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
