'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm text-xs">
      {/* Showing count text */}
      <div className="text-gray-500 dark:text-gray-400 font-medium">
        Showing <span className="font-bold text-gray-900 dark:text-white">{startItem}</span> to{' '}
        <span className="font-bold text-gray-900 dark:text-white">{endItem}</span> of{' '}
        <span className="font-bold text-gray-900 dark:text-white">{total.toLocaleString()}</span> records
      </div>

      {/* Center & Right: Page controls and per-page select */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1.5">
          <span className="text-gray-500">Per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-2 py-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Page navigation buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-semibold text-gray-900 dark:text-white">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
