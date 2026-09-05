'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ColorTheme = 'indigo' | 'emerald' | 'cyberpunk' | 'ocean' | 'amber' | 'monochrome';

export interface ThemePreset {
  id: ColorTheme;
  name: string;
  subtitle: string;
  primaryColor: string;
  previewGradient: string;
  accentBadge: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'indigo',
    name: 'Royal Indigo',
    subtitle: 'Enterprise Violet & Indigo',
    primaryColor: '#4F46E5',
    previewGradient: 'from-indigo-600 to-violet-500',
    accentBadge: 'bg-indigo-500',
  },
  {
    id: 'emerald',
    name: 'Cyber Emerald',
    subtitle: 'High-Tech Matrix Green',
    primaryColor: '#059669',
    previewGradient: 'from-emerald-600 to-teal-500',
    accentBadge: 'bg-emerald-500',
  },
  {
    id: 'cyberpunk',
    name: 'Neon Cyberpunk',
    subtitle: 'Electric Fuchsia & Purple',
    primaryColor: '#C026D3',
    previewGradient: 'from-fuchsia-600 to-pink-500',
    accentBadge: 'bg-fuchsia-500',
  },
  {
    id: 'ocean',
    name: 'Ocean Sapphire',
    subtitle: 'Electric Cyan & Deep Blue',
    primaryColor: '#0284C7',
    previewGradient: 'from-sky-500 to-blue-600',
    accentBadge: 'bg-sky-500',
  },
  {
    id: 'amber',
    name: 'Sunset Gold',
    subtitle: 'Warm Amber & Copper Luxe',
    primaryColor: '#D97706',
    previewGradient: 'from-amber-500 to-orange-600',
    accentBadge: 'bg-amber-500',
  },
  {
    id: 'monochrome',
    name: 'Obsidian Minimal',
    subtitle: 'Clean Platinum & Stealth Black',
    primaryColor: '#27272A',
    previewGradient: 'from-zinc-800 to-slate-900',
    accentBadge: 'bg-zinc-700',
  },
];

interface ThemeContextType {
  theme: ThemeMode;
  colorTheme: ColorTheme;
  setTheme: (theme: ThemeMode) => void;
  setColorTheme: (color: ColorTheme) => void;
  toggleTheme: () => void;
  presets: ThemePreset[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('indigo');

  const applyClasses = (mode: ThemeMode, color: ColorTheme) => {
    const root = document.documentElement;

    // 1. Dark/Light mode class
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 2. Remove previous theme-* classes
    root.classList.remove(
      'theme-indigo',
      'theme-emerald',
      'theme-cyberpunk',
      'theme-ocean',
      'theme-amber',
      'theme-monochrome'
    );

    // 3. Add active color theme class
    root.classList.add(`theme-${color}`);
  };

  useEffect(() => {
    const storedMode = localStorage.getItem('dataflow-theme') as ThemeMode;
    const storedColor = localStorage.getItem('dataflow-color-theme') as ColorTheme;

    const initialMode: ThemeMode = storedMode === 'dark' || storedMode === 'light' ? storedMode : 'light';
    const initialColor: ColorTheme =
      storedColor && ['indigo', 'emerald', 'cyberpunk', 'ocean', 'amber', 'monochrome'].includes(storedColor)
        ? storedColor
        : 'indigo';

    setThemeState(initialMode);
    setColorThemeState(initialColor);
    applyClasses(initialMode, initialColor);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem('dataflow-theme', mode);
    applyClasses(mode, colorTheme);
  };

  const setColorTheme = (color: ColorTheme) => {
    setColorThemeState(color);
    localStorage.setItem('dataflow-color-theme', color);
    // Also save in cookie for SSR and shared views
    document.cookie = `dataflow_color_theme=${color}; path=/; max-age=31536000; SameSite=Lax`;
    applyClasses(theme, color);
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextMode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colorTheme,
        setTheme,
        setColorTheme,
        toggleTheme,
        presets: THEME_PRESETS,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
