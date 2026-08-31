'use client';

import React, { useState, useEffect } from 'react';
import { ISavedFilter } from '@/types';
import { Bookmark, Trash2, Play, Filter, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedFiltersPage() {
  const [savedFilters, setSavedFilters] = useState<ISavedFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchFilters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/saved-filters');
      const data = await res.json();
      setSavedFilters(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load saved filters');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-filters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedFilters((prev) => prev.filter((f) => f._id !== id));
        toast.success('Filter preset deleted');
      } else {
        toast.error('Failed to delete filter');
      }
    } catch {
      toast.error('Network error. Please try again.');
    }
  };

  const handleApply = (filter: ISavedFilter) => {
    const params = new URLSearchParams();
    const f = filter.filters;
    if (f.search) params.set('search', f.search);
    if (f.gender && f.gender !== 'All') params.set('gender', f.gender);
    if (f.status && f.status !== 'All') params.set('status', f.status);
    if (f.location && f.location !== 'All') params.set('location', f.location);
    if (f.minAge) params.set('minAge', String(f.minAge));
    if (f.maxAge) params.set('maxAge', String(f.maxAge));
    toast.success(`Applied filter: "${filter.name}"`);
    router.push(`/data/explorer?${params.toString()}`);
  };

  const getFilterBadges = (f: ISavedFilter) => {
    const badges: string[] = [];
    const filters = f.filters;
    if (filters.gender && filters.gender !== 'All') badges.push(filters.gender);
    if (filters.status && filters.status !== 'All') badges.push(filters.status);
    if (filters.location && filters.location !== 'All') badges.push(filters.location);
    if (filters.minAge || filters.maxAge) badges.push(`Age ${filters.minAge || '18'}–${filters.maxAge || '65'}`);
    if (filters.search) badges.push(`"${filters.search}"`);
    return badges;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 font-medium">
            Save and re-apply common filter combinations for your dataset.
          </p>
        </div>
        <button
          onClick={() => router.push('/data/explorer')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Create Filter Preset
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 animate-pulse space-y-3"
            >
              <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-8 bg-gray-100 dark:bg-slate-800/50 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && savedFilters.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Bookmark className="w-7 h-7 text-gray-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No saved filters yet</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Go to Data Explorer, apply filters, and click "Save Filter" to create a preset.
            </p>
          </div>
          <button
            onClick={() => router.push('/data/explorer')}
            className="px-5 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
          >
            Go to Data Explorer
          </button>
        </div>
      )}

      {/* Filter Preset Grid */}
      <AnimatePresence>
        {!isLoading && savedFilters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedFilters.map((filter, idx) => {
              const badges = getFilterBadges(filter);
              return (
                <motion.div
                  key={filter._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card hover:shadow-cardHover transition-all duration-200 space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900">
                        <Filter className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                          {filter.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-medium">
                          {badges.length} filter{badges.length !== 1 ? 's' : ''} &bull;{' '}
                          {new Date(filter.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(filter._id!)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Filter Badges */}
                  {badges.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {badges.map((badge) => (
                        <span
                          key={badge}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">All records (no active filter parameters)</p>
                  )}

                  {/* Apply Button */}
                  <button
                    onClick={() => handleApply(filter)}
                    className="w-full py-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" /> Apply Filter Preset
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
