import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

/** Keeps the logged-in user for the whole app. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(tokenStore.get())); // true while we check a saved token

  useEffect(() => {
    if (!tokenStore.get()) return;
    api.get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  // The API client fires this when the server says the token is no longer valid.
  useEffect(() => {
    const onExpired = () => { tokenStore.clear(); setUser(null); };
    window.addEventListener('auth-expired', onExpired);
    return () => window.removeEventListener('auth-expired', onExpired);
  }, []);

  const authenticate = useCallback(async (path, payload) => {
    const data = await api.post(path, payload);
    tokenStore.set(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: (email, password) => authenticate('/auth/login', { email, password }),
      register: (form) => authenticate('/auth/register', form),
      logout: () => { tokenStore.clear(); setUser(null); },
    }),
    [user, loading, authenticate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
