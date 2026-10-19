import { useCallback, useEffect, useState } from 'react';

/**
 * Loads data when the page opens (and whenever `deps` change).
 *   const { data, loading, error, reload } = useFetch(() => api.get('/quizzes'), []);
 */
export function useFetch(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    loader()
      .then((data) => alive && setState({ data, loading: false, error: '' }))
      .catch((e) => alive && setState({ data: null, loading: false, error: e.message }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
