// Small display helpers used by many pages.
export const fmtDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtDateTime = (value) =>
  new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtShortDate = (value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

export const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
export const DIFFICULTY_TONE = { easy: 'good', medium: 'warn', hard: 'bad' };

/** Colour tone for a score percentage. */
export const toneForPercent = (value) => (value >= 80 ? 'good' : value >= 60 ? 'warn' : 'bad');
