'use client';

import React from 'react';
import { CheckCircle2, Loader2, Database, Sparkles, Layers, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadProgressProps {
  currentStage: number; // 1 to 5
  processedRows?: number;
  totalRows?: number;
  currentChunk?: number;
  totalChunks?: number;
  liveNewCount?: number;
  liveUpdatedCount?: number;
  filename?: string;
}

const STAGES = [
  { stage: 1, label: 'Initializing session' },
  { stage: 2, label: 'Validating data schema' },
  { stage: 3, label: 'Micro-batch streaming' },
  { stage: 4, label: 'Fast MongoDB upsert' },
  { stage: 5, label: 'Dataset ready' },
];

export function UploadProgress({
  currentStage,
  processedRows = 0,
  totalRows = 0,
  currentChunk = 0,
  totalChunks = 0,
  liveNewCount = 0,
  liveUpdatedCount = 0,
  filename,
}: UploadProgressProps) {
  // Calculate accurate progress percentage based on processed rows when streaming, or stages when initializing/ready
  let percentage = 0;
  if (currentStage >= 5) {
    percentage = 100;
  } else if (totalRows > 0 && processedRows > 0) {
    percentage = Math.min(99, Math.max(5, Math.round((processedRows / totalRows) * 100)));
  } else {
    percentage = Math.min(Math.round((currentStage / 5) * 100), 20);
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              High-Speed Stream Ingestion
            </h4>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            {filename ? `Processing "${filename}" with micro-batch chunk streaming.` : 'Streaming records securely into MongoDB Atlas.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right">
            <span className="text-2xl font-black font-mono bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              {percentage}%
            </span>
            {totalRows > 0 && (
              <span className="block text-[11px] text-gray-400 font-mono">
                {processedRows.toLocaleString()} / {totalRows.toLocaleString()} rows
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar with Glow */}
      <div className="space-y-2">
        <div className="w-full bg-gray-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-slate-700/50 relative">
          <motion.div
            className="bg-gradient-to-r from-brand-600 via-accent-500 to-emerald-500 h-full rounded-full shadow-md"
            initial={{ width: '2%' }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        </div>

        {/* Live Micro-Batch Counters */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 pt-1">
          <div className="flex items-center gap-3">
            {totalChunks > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 font-mono font-bold text-[11px] text-gray-700 dark:text-gray-300">
                <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                Batch {currentChunk} of {totalChunks}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200/60 dark:border-emerald-900/60">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              +{liveNewCount.toLocaleString()} New Records
            </span>
            {liveUpdatedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200/60 dark:border-blue-900/60">
                <Database className="w-3 h-3 text-blue-500" />
                {liveUpdatedCount.toLocaleString()} Merged
              </span>
            )}
          </div>

          <span className="font-mono text-[11px] text-gray-400">
            {percentage < 100 ? 'Streaming...' : 'Finalized'}
          </span>
        </div>
      </div>

      {/* Stages Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
        {STAGES.map((s) => {
          const isDone = currentStage > s.stage || (currentStage === 5);
          const isCurrent = currentStage === s.stage && currentStage < 5;

          return (
            <div
              key={s.stage}
              className={`p-3 rounded-2xl border transition-all text-xs flex items-center space-x-2.5 ${
                isDone
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 shadow-2xs'
                  : isCurrent
                  ? 'bg-brand-50/90 dark:bg-brand-950/50 border-brand-300 dark:border-brand-800 text-brand-700 dark:text-brand-300 shadow-sm ring-2 ring-brand-500/20'
                  : 'bg-gray-50/60 dark:bg-slate-800/40 border-gray-200/70 dark:border-slate-800/70 text-gray-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-slate-700 flex items-center justify-center text-[10px] shrink-0 font-semibold text-gray-400">
                  {s.stage}
                </div>
              )}
              <span className="font-bold line-clamp-1">{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
