'use client';

import React, { useEffect, useState } from 'react';
import { IActivityLog } from '@/types';
import { UploadCloud, Download, Filter, Settings, RefreshCw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ICON_MAP: Record<string, React.ReactNode> = {
  upload: <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
  export: <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  filter: <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
  system: <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />,
};

const BG_MAP: Record<string, string> = {
  upload: 'bg-blue-50 dark:bg-blue-950/50 border-blue-100 dark:border-blue-900',
  export: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-100 dark:border-emerald-900',
  filter: 'bg-brand-50 dark:bg-brand-950/50 border-brand-100 dark:border-brand-900',
  system: 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700',
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<IActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load activity log');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const formatTime = (date: string | Date) => {
    const d = new Date(date);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 font-medium">
          Audit trail of all dataset operations, exports and system events.
        </p>
        <button
          onClick={fetchActivities}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 animate-pulse"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activities.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Clock className="w-7 h-7 text-gray-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">No activity yet</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Start by seeding a demo dataset or uploading your CSV file.
            </p>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {!isLoading && activities.length > 0 && (
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-7 top-4 bottom-4 w-px bg-gray-200 dark:bg-slate-800 hidden sm:block" />

          <div className="space-y-3">
            {activities.map((activity, idx) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="relative flex items-start gap-4 sm:pl-6"
              >
                {/* Timeline Dot + Icon */}
                <div
                  className={`relative z-10 p-2.5 rounded-xl border shrink-0 ${BG_MAP[activity.type] || BG_MAP.system}`}
                >
                  {ICON_MAP[activity.type] || ICON_MAP.system}
                </div>

                {/* Activity Card */}
                <div className="flex-1 min-w-0 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm hover:shadow-card transition-shadow">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {activity.action}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(activity.createdAt)}
                      </p>
                      <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                        {activity.user}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
