'use client';

import React from 'react';
import Link from 'next/link';
import { FileSpreadsheet, CheckCircle2, Eye, RefreshCw, ArrowRight } from 'lucide-react';
import { IDatasetSummary } from '@/types';

interface DatasetSummaryCardProps {
  dataset: IDatasetSummary | null;
  onSeedDemo: () => void;
  isSeeding?: boolean;
}

export function DatasetSummaryCard({ dataset, onSeedDemo, isSeeding }: DatasetSummaryCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-white via-white to-brand-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/40 border border-gray-200/80 dark:border-slate-800 shadow-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Dataset Header Info */}
        <div className="flex items-start space-x-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 text-white shadow-md shadow-brand-500/20 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {dataset?.filename || 'people-data-enterprise.xlsx'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {dataset?.status || 'Ready'}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
              {(dataset?.totalRecords || 2123).toLocaleString()} records &bull; {dataset?.totalFields || 18} columns &bull; {dataset?.fileSize || '1.4 MB'}
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
              Last updated: {dataset?.uploadedAt ? new Date(dataset.uploadedAt).toLocaleString() : 'Today'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/data/explorer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all duration-150"
          >
            <Eye className="w-4 h-4" /> View Data <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/data/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 font-semibold text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" /> Replace Dataset
          </Link>
          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-100 font-semibold text-xs transition-colors disabled:opacity-50"
          >
            {isSeeding ? 'Seeding...' : '⚡ Seed Demo (2,123)'}
          </button>
        </div>
      </div>
    </div>
  );
}
