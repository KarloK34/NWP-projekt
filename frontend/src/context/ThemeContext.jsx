import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const THEME_KEY = 'ai-catalog-theme';
const THEMES = ['light', 'dark', 'system'];

function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (THEMES.includes(stored)) return stored;
  } catch (_) {}
  return 'system';
}

function resolveDark(stored) {
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const dark = resolveDark(theme);
    setIsDark(dark);
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setIsDark(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = useCallback((value) => {
    if (!THEMES.includes(value)) return;
    setThemeState(value);
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (_) {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'system',
      setTheme: () => {},
      isDark: false,
    };
  }
  return ctx;
}
