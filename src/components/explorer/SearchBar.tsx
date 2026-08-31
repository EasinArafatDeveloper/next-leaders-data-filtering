'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync state if external value changes (e.g., Clear All / Reset Filters)
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Debounce user keystrokes
  useEffect(() => {
    // If the local input matches what parent already has, do nothing
    if (searchTerm === (value || '')) {
      return;
    }

    const timer = setTimeout(() => {
      onChangeRef.current(searchTerm);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, value]);

  const handleClear = () => {
    setSearchTerm('');
    onChangeRef.current('');
  };

  return (
    <div className="relative flex-1">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder || 'Search by name, phone, location or any available field...'}
        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
