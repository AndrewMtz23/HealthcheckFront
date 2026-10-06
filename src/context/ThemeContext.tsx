'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { normalizeTheme, resolveTheme, THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null);

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const preference = useRef<Theme>('light');

  useEffect(() => {
    const initial = normalizeTheme(document.documentElement.dataset.theme);
    preference.current = initial;
    setThemeState(initial);
    applyTheme(initial);

    const onStorageChange = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return;
      const next = normalizeTheme(event.newValue);
      preference.current = next;
      setThemeState(next);
      applyTheme(next);
    };
    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    preference.current = next;
    setThemeState(next);
    applyTheme(next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* The theme still works when storage is blocked. */ }
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme requiere ThemeProvider');
  return context;
}
