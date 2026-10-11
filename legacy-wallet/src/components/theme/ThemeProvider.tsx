'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize theme after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage or system preference
    const storedTheme = localStorage.getItem('geek-wallet-theme') as Theme;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = storedTheme || systemTheme;
    
    setTheme(initialTheme);
  }, []);

  // Apply theme changes to DOM
  useEffect(() => {
    if (!mounted) return;
    
    console.log('ThemeProvider: Applying theme:', theme);
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      console.log('ThemeProvider: Added dark class');
    } else {
      root.classList.remove('dark');
      console.log('ThemeProvider: Removed dark class');
    }
    
    // Save to localStorage
    localStorage.setItem('geek-wallet-theme', theme);
    console.log('ThemeProvider: Saved to localStorage:', theme);
  }, [theme, mounted]);

  const toggleTheme = () => {
    console.log('ThemeProvider: toggleTheme called, current theme:', theme);
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('ThemeProvider: Setting new theme:', newTheme);
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
