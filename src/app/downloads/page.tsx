'use client';

import React, { useState, useEffect } from 'react';
import { IDownloadHistory } from '@/types';
import { Download, FileText, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<IDownloadHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDownloads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/downloads');
      const data = await res.json();
      setDownloads(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load download history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium">
          Complete history of all CSV exports generated from filtered datasets.
        </p>
        <button
          onClick={fetchDownloads}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 space-y-4 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && downloads.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Download className="w-7 h-7 text-gray-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No exports yet</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Go to Data Explorer, apply filters, and click "Export CSV" to create your first export.
            </p>
          </div>
        </div>
      )}

      {/* Downloads Table */}
      {!isLoading && downloads.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-slate-800/60 border-b border-gray-200 dark:border-slate-800">
                <th className="py-3.5 px-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  File
                </th>
                <th className="py-3.5 px-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Records
                </th>
                <th className="py-3.5 px-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Filters Applied
                </th>
                <th className="py-3.5 px-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Created
                </th>
                <th className="py-3.5 px-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {downloads.map((dl, idx) => (
                <motion.tr
                  key={dl._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="hover:bg-gray-50/60 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-[11px]">
                        {dl.filename}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-bold text-gray-900 dark:text-gray-100">
                    {dl.recordCount.toLocaleString()}
                    <span className="text-gray-400 font-normal"> records</span>
                  </td>
                  <td className="py-4 px-5 hidden sm:table-cell">
                    <span className="text-gray-600 dark:text-gray-400 font-medium line-clamp-1 max-w-xs">
                      {dl.filtersApplied}
                    </span>
                  </td>
                  <td className="py-4 px-5 hidden md:table-cell text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" /> {formatDate(dl.createdAt)}
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      <CheckCircle2 className="w-3 h-3" /> {dl.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
