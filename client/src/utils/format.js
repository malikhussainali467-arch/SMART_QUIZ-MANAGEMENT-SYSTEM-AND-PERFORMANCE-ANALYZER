// Small display helpers used by many pages.
export const fmtDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtDateTime = (value) =>
  new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtShortDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** 125 seconds -> "02:05" */
export const clock = (totalSeconds) => {
  const s = Math.max(0, totalSeconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
export const DIFFICULTY_TONE = { easy: 'good', medium: 'warn', hard: 'bad' };

/** Colour tone for a score percentage. */
export const toneForPercent = (value) => (value >= 80 ? 'good' : value >= 60 ? 'warn' : 'bad');

/** Mastery status from the server -> label + tone. */
export const STATUS = {
  strong: { label: 'Strong', tone: 'good' },
  average: { label: 'Getting there', tone: 'warn' },
  weak: { label: 'Needs work', tone: 'bad' },
  unknown: { label: 'Not enough data', tone: 'muted' },
};

export const TREND = {
  improving: { label: 'Improving', tone: 'good' },
  declining: { label: 'Slipping', tone: 'bad' },
  steady: { label: 'Steady', tone: 'muted' },
};
