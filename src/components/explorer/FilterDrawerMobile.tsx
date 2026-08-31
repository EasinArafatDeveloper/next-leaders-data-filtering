'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { FilterQueryState } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterDrawerMobileProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterQueryState;
  onApplyFilters: (updated: Partial<FilterQueryState>) => void;
  onReset: () => void;
}

const GENDERS = ['All', 'Male', 'Female', 'Other'];
const STATUSES = ['All', 'Active', 'Inactive', 'Pending', 'Suspended'];
const LOCATIONS = ['All', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur'];

export function FilterDrawerMobile({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onReset,
}: FilterDrawerMobileProps) {
  const [localGender, setLocalGender] = useState(filters.gender || 'All');
  const [localStatus, setLocalStatus] = useState(filters.status || 'All');
  const [localLocation, setLocalLocation] = useState(filters.location || 'All');
  const [localMinAge, setLocalMinAge] = useState(filters.minAge || '');
  const [localMaxAge, setLocalMaxAge] = useState(filters.maxAge || '');

  const handleApply = () => {
    onApplyFilters({
      gender: localGender,
      status: localStatus,
      location: localLocation,
      minAge: localMinAge,
      maxAge: localMaxAge,
      page: 1,
    });
    onClose();
  };

  const handleReset = () => {
    setLocalGender('All');
    setLocalStatus('All');
    setLocalLocation('All');
    setLocalMinAge('');
    setLocalMaxAge('');
    onReset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-gray-200 dark:border-slate-800 p-6 max-h-[85vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Filter Dataset
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Body */}
            <div className="flex-1 overflow-y-auto py-5 space-y-6">
              {/* Gender Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Gender
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <button
                      key={g}
                      onClick={() => setLocalGender(g)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        localGender === g
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setLocalStatus(s)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        localStatus === s
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Location (District)
                </label>
                <select
                  value={localLocation}
                  onChange={(e) => setLocalLocation(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-gray-200"
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              {/* Age Range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Age Range
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    placeholder="Min (18)"
                    value={localMinAge}
                    onChange={(e) => setLocalMinAge(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100"
                  />
                  <span className="text-gray-400 font-bold">–</span>
                  <input
                    type="number"
                    placeholder="Max (65)"
                    value={localMaxAge}
                    onChange={(e) => setLocalMaxAge(e.target.value)}
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                onClick={handleReset}
                className="w-1/3 py-3 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                className="w-2/3 py-3 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-md shadow-brand-600/30 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Apply Filters
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
