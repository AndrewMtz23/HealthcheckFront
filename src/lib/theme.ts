export type Theme = 'light' | 'dark' | 'system';
export const THEME_STORAGE_KEY = 'healthcheck-theme';

export function normalizeTheme(value: string | null | undefined): Theme {
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function resolveTheme(theme: Theme, systemDark: boolean): 'light' | 'dark' {
  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
}

// Runs in the document head, before content paints. No user data is interpolated.
export const themeInitScript = `(() => {
  let preference = 'system';
  try {
    const saved = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {}
  const dark = preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.dataset.theme = preference;
  root.style.colorScheme = dark ? 'dark' : 'light';
})();`;
