'use client';

import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect } from 'react';

function getIsDark(value: string | undefined, storage: string | null, systemDark: boolean): boolean {
  if (value === 'dark') return true;
  if (value === 'light') return false;
  if (storage === 'dark') return true;
  if (storage === 'light') return false;
  return systemDark;
}

/**
 * Single source of truth for the .dark class on <html>.
 * next-themes is told to use data-theme so it never overwrites class.
 */
function ThemeApplicator() {
  const { resolvedTheme, setTheme } = useTheme();

  // Apply class whenever resolved theme or storage changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const stored = localStorage.getItem('theme');
    const systemDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = getIsDark(resolvedTheme ?? undefined, stored, systemDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, [resolvedTheme]);

  // On mount: if we have a stored theme, force next-themes to use it so resolvedTheme is correct
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
      setTheme(stored);
    }
  }, [setTheme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
      {...props}
    >
      <ThemeApplicator />
      {children}
    </NextThemesProvider>
  );
}
