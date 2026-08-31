import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Database } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-8 shadow-card space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center ring-8 ring-brand-50/50 dark:ring-brand-950/30">
          <Database className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">404</h1>
          <h2 className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
            Page Not Found
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            The page or dataset view you are looking for does not exist or has been moved.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
