import { useEffect, useState } from 'react';

/** Animates a number from 0 up to `target` (used on stat cards and the score). */
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(target * (1 - Math.pow(1 - progress, 3))); // ease-out
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
