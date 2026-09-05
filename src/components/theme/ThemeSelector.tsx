'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sun, Moon, Sparkles } from 'lucide-react';
import { useTheme, ColorTheme, THEME_PRESETS } from './ThemeProvider';

interface ThemeSelectorProps {
  variant?: 'compact' | 'expanded';
}

export function ThemeSelector({ variant = 'compact' }: ThemeSelectorProps) {
  const { theme, colorTheme, setTheme, setColorTheme, toggleTheme, presets } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activePreset = presets.find((p) => p.id === colorTheme) || presets[0];

  if (variant === 'expanded') {
    return (
      <div className="space-y-4">
        {/* Light / Dark Mode Toggle Pills */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 w-fit">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              theme === 'light'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Light Mode</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              theme === 'dark'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-white dark:text-gray-400'
            }`}
          >
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Dark Mode</span>
          </button>
        </div>

        {/* Color Palette Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {presets.map((preset) => {
            const isSelected = colorTheme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setColorTheme(preset.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'border-brand-500 ring-2 ring-brand-500/20 bg-white dark:bg-slate-800 shadow-md'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                {/* Gradient Swatch Header */}
                <div
                  className={`h-7 w-full rounded-xl bg-gradient-to-r ${preset.previewGradient} flex items-center justify-end px-2 shadow-inner mb-2.5`}
                >
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    {preset.name}
                  </h5>
                  <p className="text-[10px] text-gray-400 truncate">
                    {preset.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact Header Popover
  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-all flex items-center gap-1.5"
        title="Choose Theme Style"
      >
        <Palette className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        <span
          className={`w-2 h-2 rounded-full bg-gradient-to-tr ${activePreset.previewGradient} ring-1 ring-white dark:ring-slate-900`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 p-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-bold text-gray-900 dark:text-white">Theme & Palette</span>
            </div>

            {/* Quick Dark/Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 text-[11px] font-semibold flex items-center gap-1"
            >
              {theme === 'light' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3 text-amber-400" />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => {
              const isSelected = colorTheme === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setColorTheme(preset.id);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/40 dark:bg-slate-800 ring-1 ring-brand-500'
                      : 'border-gray-200/80 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`h-4 w-full rounded-lg bg-gradient-to-r ${preset.previewGradient} mb-1.5 flex items-center justify-end px-1`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                  </div>
                  <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">
                    {preset.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
