'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeSelector.module.css';

const themes = {
  light: { label: 'Blanco', icon: Sun, next: 'dark' },
  dark: { label: 'Negro', icon: Moon, next: 'light' },
} as const;

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { icon: Icon, label, next } = themes[theme];
  const accessibleLabel = `Tema actual: ${label}. Cambiar a ${themes[next].label}`;
  return (
    <button type="button" className={styles.button} onClick={() => setTheme(next)} aria-label={accessibleLabel} title={accessibleLabel}>
      <span key={theme} className={styles.icon} aria-hidden="true"><Icon size={21} strokeWidth={1.7} /></span>
    </button>
  );
}
