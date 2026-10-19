import { useEffect, useState } from 'react';

/** false on the first render, true right after: lets CSS animate bars/rings from 0 to their value. */
export function useMounted() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return ready;
}
