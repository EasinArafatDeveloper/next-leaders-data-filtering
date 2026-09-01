'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Download,
  RotateCcw,
  X,
  ChevronDown,
  Sparkles,
  Phone,
  Image as ImageIcon,
  Calendar,
  Users,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  FolderOpen,
} from 'lucide-react';
import { FilterQueryState, IDatasetSummary } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterToolbarProps {
  filters: FilterQueryState;
  onApplyFilters: (updated: Partial<FilterQueryState>) => void;
  onResetFilters: () => void;
  onExportCSV: () => void;
  isExporting?: boolean;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  totalFilteredCount?: number;
}

const OPERATOR_PRESETS = [
  { label: 'All Operators', prefix: '' },
  { label: 'Grameenphone (88017/013)', prefix: '88017' },
  { label: 'Robi (88018)', prefix: '88018' },
  { label: 'Banglalink (88019/014)', prefix: '88019' },
  { label: 'Teletalk (88015)', prefix: '88015' },
  { label: 'Airtel (88016)', prefix: '88016' },
];

const ACTIVE_DAYS_PRESETS = [
  { label: 'Any Active Days', days: '' },
  { label: '⚡ Highly Active (≤ 3 days)', days: '3' },
  { label: '🟢 Active this week (≤ 7 days)', days: '7' },
  { label: 'Active this month (≤ 30 days)', days: '30' },
  { label: 'Active recently (≤ 60 days)', days: '60' },
];

export function FilterToolbar({
  filters,
  onApplyFilters,
  onResetFilters,
  onExportCSV,
  isExporting,
  viewMode,
  onViewModeChange,
  totalFilteredCount = 0,
}: FilterToolbarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [datasets, setDatasets] = useState<IDatasetSummary[]>([]);

  // Fetch available datasets for file-level filtering
  useEffect(() => {
    fetch('/api/data/datasets', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDatasets(data || []))
      .catch((err) => console.error('Failed to load datasets for filter:', err));
  }, []);

  // Sync search input with prop
  useEffect(() => {
    setSearchQuery(filters.search || '');
  }, [filters.search]);

  // Debounced search submit
  useEffect(() => {
    if (searchQuery === (filters.search || '')) return;
    const timer = setTimeout(() => {
      onApplyFilters({ search: searchQuery, page: 1 });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, filters.search, onApplyFilters]);

  // Count active filters
  const activeFilterCount = [
    filters.search,
    filters.datasetId && filters.datasetId !== 'All',
    filters.gender && filters.gender !== 'All',
    filters.avatarType && filters.avatarType !== 'All',
    filters.minAge || filters.maxAge,
    filters.numberStartsWith,
    filters.maxActiveDays,
    filters.lastOnlineFrom || filters.lastOnlineTo,
  ].filter(Boolean).length;

  const toggleSearchField = (fieldKey: keyof FilterQueryState) => {
    onApplyFilters({
      [fieldKey]: !filters[fieldKey],
      page: 1,
    });
  };

  return (
    <div className="space-y-3">
      {/* --- SMART OMNIBAR ROW --- */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 shadow-sm space-y-3">
        {/* Main Search & Control Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Smart Omnisearch Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Smart Search: Type phone number (e.g. 8801999112233), name, nickname, location..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200/80 dark:border-slate-700/80 rounded-xl text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onApplyFilters({ search: '', page: 1 });
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Uploaded File / Dataset Dropdown Selector */}
          <div className="relative min-w-[210px] sm:w-64 shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-600 dark:text-brand-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <select
              value={filters.datasetId || 'All'}
              onChange={(e) => {
                const selectedId = e.target.value;
                const found = datasets.find((d) => d._id === selectedId);
                onApplyFilters({
                  datasetId: selectedId,
                  filename: found ? found.filename : '',
                  page: 1,
                });
              }}
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50/90 dark:bg-slate-800/90 border border-gray-200/80 dark:border-slate-700/80 rounded-xl text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition-all truncate shadow-inner"
              title="Filter by specific uploaded file"
            >
              <option value="All">📁 All Uploaded Files (Combined)</option>
              {datasets.map((d) => (
                <option key={d._id} value={d._id}>
                  📄 {d.filename} ({(d.totalRecords || 0).toLocaleString()} rows)
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            {/* Advanced Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                showAdvanced || activeFilterCount > 0
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-300 dark:border-brand-800 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Smart Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showAdvanced ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Clear/Reset Button */}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onResetFilters}
                className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Green Export CSV Button with live count */}
            <button
              type="button"
              onClick={onExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F9D58] hover:bg-[#0C894D] text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-60 whitespace-nowrap"
            >
              {isExporting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Export CSV</span>
              {totalFilteredCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-700/80 text-[10px]">
                  {totalFilteredCount.toLocaleString()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Filter Smart Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-1 flex items-center gap-1 shrink-0">
            <Sparkles className="w-3 h-3 text-brand-500" /> Quick:
          </span>

          {/* All */}
          <button
            type="button"
            onClick={() => onResetFilters()}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              activeFilterCount === 0
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            All Records
          </button>

          {/* With Photo */}
          <button
            type="button"
            onClick={() =>
              onApplyFilters({
                avatarType: filters.avatarType === 'With Avatar' ? 'All' : 'With Avatar',
                page: 1,
              })
            }
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filters.avatarType === 'With Avatar'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="w-3 h-3" /> With Photo
          </button>

          {/* Without Photo */}
          <button
            type="button"
            onClick={() =>
              onApplyFilters({
                avatarType: filters.avatarType === 'Without Avatar' ? 'All' : 'Without Avatar',
                page: 1,
              })
            }
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filters.avatarType === 'Without Avatar'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            No Photo
          </button>

          {/* GP (88017) */}
          <button
            type="button"
            onClick={() =>
              onApplyFilters({
                numberStartsWith: filters.numberStartsWith === '88017' ? '' : '88017',
                page: 1,
              })
            }
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filters.numberStartsWith === '88017'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <Phone className="w-3 h-3" /> 88017 (GP)
          </button>

          {/* Robi (88018) */}
          <button
            type="button"
            onClick={() =>
              onApplyFilters({
                numberStartsWith: filters.numberStartsWith === '88018' ? '' : '88018',
                page: 1,
              })
            }
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filters.numberStartsWith === '88018'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <Phone className="w-3 h-3" /> 88018 (Robi)
          </button>

          {/* Banglalink (88019) */}
          <button
            type="button"
            onClick={() =>
              onApplyFilters({
                numberStartsWith: filters.numberStartsWith === '88019' ? '' : '88019',
                page: 1,
              })
            }
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filters.numberStartsWith === '88019'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <Phone className="w-3 h-3" /> 88019 (BL)
          </button>

          {/* Active <= 7 days */}
          <button
            type="button"
            onClick={() =>
              onApplyFilters({
                maxActiveDays: filters.maxActiveDays === '7' ? '' : '7',
                page: 1,
              })
            }
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filters.maxActiveDays === '7'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            <Clock className="w-3 h-3" /> Active ≤ 7d
          </button>

          {/* Male */}
          <button
            type="button"
            onClick={() =>
              onApplyFilters({
                gender: filters.gender === 'Male' ? 'All' : 'Male',
                page: 1,
              })
            }
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filters.gender === 'Male'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            Male
          </button>

          {/* Female */}
          <button
            type="button"
            onClick={() =>
              onApplyFilters({
                gender: filters.gender === 'Female' ? 'All' : 'Female',
                page: 1,
              })
            }
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              filters.gender === 'Female'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* --- COLLAPSIBLE SMART ADVANCED FILTER PANEL --- */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 shadow-card space-y-5 text-xs">
              {/* Header Title */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                    Advanced Multi-Criteria Filtering Studio
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                  >
                    Reset All Fields
                  </button>
                </div>
              </div>

              {/* Dataset / Uploaded File Scope Banner */}
              <div className="p-3.5 rounded-xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200/80 dark:border-brand-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white text-xs">
                      Dataset / Uploaded File Scope
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      Choose a specific uploaded file to isolate and filter only its records
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-72 shrink-0">
                  <select
                    value={filters.datasetId || 'All'}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const found = datasets.find((d) => d._id === selectedId);
                      onApplyFilters({
                        datasetId: selectedId,
                        filename: found ? found.filename : '',
                        page: 1,
                      });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-brand-300 dark:border-brand-800 rounded-xl text-xs font-bold text-brand-700 dark:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer truncate"
                  >
                    <option value="All">📁 All Uploaded Files (Combined)</option>
                    {datasets.map((d) => (
                      <option key={d._id} value={d._id}>
                        📄 {d.filename} ({(d.totalRecords || 0).toLocaleString()} rows)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 1: Demographics & Operators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Phone / Operator Prefix */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-brand-600" /> Number Starts With (Operator)
                  </label>
                  <div className="space-y-2">
                    <select
                      value={
                        OPERATOR_PRESETS.some((p) => p.prefix === filters.numberStartsWith)
                          ? filters.numberStartsWith
                          : 'custom'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'custom') {
                          onApplyFilters({ numberStartsWith: val, page: 1 });
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {OPERATOR_PRESETS.map((op) => (
                        <option key={op.prefix} value={op.prefix}>
                          {op.label}
                        </option>
                      ))}
                      <option value="custom">Custom Operator Prefix (Type Below)...</option>
                    </select>

                    <input
                      type="text"
                      value={filters.numberStartsWith || ''}
                      onChange={(e) =>
                        onApplyFilters({ numberStartsWith: e.target.value, page: 1 })
                      }
                      placeholder="e.g. 88017, 88019, 017..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* 2. Gender & Avatar Type */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-brand-600" /> Gender & Avatar Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={filters.gender || 'All'}
                      onChange={(e) => onApplyFilters({ gender: e.target.value, page: 1 })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="All">All Genders</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>

                    <select
                      value={filters.avatarType || 'All'}
                      onChange={(e) => onApplyFilters({ avatarType: e.target.value, page: 1 })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="All">All Avatars</option>
                      <option value="With Avatar">With Photo</option>
                      <option value="Without Avatar">No Photo</option>
                      <option value="Custom">Custom</option>
                      <option value="Initial">Initial</option>
                    </select>
                  </div>
                </div>

                {/* 3. Age Range */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    🎂 Age Range (Years)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.minAge || ''}
                      onChange={(e) => onApplyFilters({ minAge: e.target.value, page: 1 })}
                      placeholder="Min (e.g. 18)"
                      className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <span className="text-gray-400 font-bold">–</span>
                    <input
                      type="number"
                      value={filters.maxAge || ''}
                      onChange={(e) => onApplyFilters({ maxAge: e.target.value, page: 1 })}
                      placeholder="Max (e.g. 60)"
                      className="w-1/2 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* 4. Active Days <= (With Presets + Custom Input) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-600" /> Active Days (≤ Maximum)
                  </label>
                  <div className="space-y-2">
                    <select
                      value={
                        ACTIVE_DAYS_PRESETS.some((p) => p.days === filters.maxActiveDays)
                          ? filters.maxActiveDays
                          : filters.maxActiveDays ? 'custom' : ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== 'custom') {
                          onApplyFilters({ maxActiveDays: val, page: 1 });
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {ACTIVE_DAYS_PRESETS.map((p) => (
                        <option key={p.days} value={p.days}>
                          {p.label}
                        </option>
                      ))}
                      <option value="custom">Custom (Type Exact Days Below)...</option>
                    </select>

                    <input
                      type="number"
                      value={filters.maxActiveDays || ''}
                      onChange={(e) =>
                        onApplyFilters({ maxActiveDays: e.target.value, page: 1 })
                      }
                      placeholder="Type exact days (e.g. 10, 25, 75, 120)..."
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Grid 2: Date Range & Search Target Checkboxes */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                {/* Last Online Range */}
                <div className="lg:col-span-1 space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" /> Last Online Date Range
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={filters.lastOnlineFrom || ''}
                      onChange={(e) =>
                        onApplyFilters({ lastOnlineFrom: e.target.value, page: 1 })
                      }
                      className="w-1/2 px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <span className="text-gray-400 text-xs">to</span>
                    <input
                      type="date"
                      value={filters.lastOnlineTo || ''}
                      onChange={(e) =>
                        onApplyFilters({ lastOnlineTo: e.target.value, page: 1 })
                      }
                      className="w-1/2 px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Search Target Fields (Interactive Toggle Chips) */}
                <div className="lg:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Search Targeting (When typing in Search Bar):
                  </label>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    {[
                      { key: 'nameWise' as keyof FilterQueryState, label: 'Name / Nickname' },
                      { key: 'numberWise' as keyof FilterQueryState, label: 'Phone Number' },
                      { key: 'genderWise' as keyof FilterQueryState, label: 'Gender' },
                      { key: 'ageWise' as keyof FilterQueryState, label: 'Age' },
                      { key: 'lastOnlineWise' as keyof FilterQueryState, label: 'Last Online' },
                      { key: 'avatarTypeWise' as keyof FilterQueryState, label: 'Avatar Photo' },
                    ].map((target) => {
                      const isChecked = !!filters[target.key];

                      return (
                        <button
                          key={target.key}
                          type="button"
                          onClick={() => toggleSearchField(target.key)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all select-none ${
                            isChecked
                              ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                              isChecked ? 'bg-white text-brand-600' : 'border border-gray-300 dark:border-slate-600'
                            }`}
                          >
                            {isChecked ? '✓' : ''}
                          </span>
                          {target.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
