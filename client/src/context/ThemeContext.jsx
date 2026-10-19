import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

/** Light / dark mode, remembered in the browser. */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('smartquiz_theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('smartquiz_theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
