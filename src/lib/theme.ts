export type Theme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'healthcheck-theme';

export function normalizeTheme(value: string | null | undefined): Theme {
  return value === 'dark' ? 'dark' : 'light';
}

export function resolveTheme(theme: Theme): Theme {
  return theme;
}

// Runs in the document head, before content paints. No user data is interpolated.
export const themeInitScript = `(() => {
  let preference = 'light';
  try {
    const saved = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (saved === 'light' || saved === 'dark') preference = saved;
  } catch {}
  const dark = preference === 'dark';
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.dataset.theme = preference;
  root.style.colorScheme = dark ? 'dark' : 'light';
})();`;
