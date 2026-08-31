'use client';

import React from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadProgressProps {
  currentStage: number; // 1 to 5
}

const STAGES = [
  { stage: 1, label: 'Uploading file' },
  { stage: 2, label: 'Validating data schema' },
  { stage: 3, label: 'Normalizing row fields' },
  { stage: 4, label: 'Saving to MongoDB database' },
  { stage: 5, label: 'Dataset ready' },
];

export function UploadProgress({ currentStage }: UploadProgressProps) {
  const percentage = Math.min(Math.round((currentStage / 5) * 100), 100);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            Processing Dataset Upload
          </h4>
          <p className="text-xs text-gray-500 font-medium">
            Please wait while your data is parsed, normalized and indexed in MongoDB.
          </p>
        </div>
        <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-brand-600 to-indigo-500 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Stages Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
        {STAGES.map((s) => {
          const isDone = currentStage > s.stage;
          const isCurrent = currentStage === s.stage;

          return (
            <div
              key={s.stage}
              className={`p-3 rounded-xl border transition-all text-xs flex items-center space-x-2.5 ${
                isDone
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                  : isCurrent
                  ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 text-gray-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-slate-700 flex items-center justify-center text-[10px] shrink-0 font-semibold">
                  {s.stage}
                </div>
              )}
              <span className="font-semibold line-clamp-1">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
