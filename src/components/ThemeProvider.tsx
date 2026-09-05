import { useEffect, useState } from 'react';
import { ThemeContext, type Theme } from '@/hooks/use-theme';
import { readStorage, writeStorage } from '@/lib/session-storage';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = readStorage('theme', 'localStorage');
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    writeStorage('theme', theme, 'localStorage');
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
