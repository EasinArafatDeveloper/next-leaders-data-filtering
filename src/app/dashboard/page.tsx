'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MetricCards } from '@/components/dashboard/MetricCards';
import { DatasetSummaryCard } from '@/components/dashboard/DatasetSummaryCard';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { IDatasetSummary } from '@/types';
import { UploadCloud, Database, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalFields: 0,
    filteredRecords: 0,
    lastUpload: 'None',
  });

  const [dataset, setDataset] = useState<IDatasetSummary | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();

      if (res.ok) {
        setStats({
          totalRecords: data.totalRecords || 0,
          totalFields: data.totalFields || 0,
          filteredRecords: data.filteredRecords || 0,
          lastUpload: data.lastUpload || 'None',
        });
        setDataset(data.activeDataset || null);
        setCharts(data.charts || null);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Metric Cards Row */}
      <MetricCards stats={stats} isLoading={isLoading} />

      {/* When no data is uploaded yet, show clean Upload CTA */}
      {!isLoading && stats.totalRecords === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-center space-y-5 shadow-card">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              No Dataset Uploaded Yet
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Upload your CSV or Excel business dataset to explore, search, filter and export records in real-time.
            </p>
          </div>
          <Link
            href="/data/upload"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4" /> Upload Your File Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <>
          {/* Dataset Health Summary Card */}
          <DatasetSummaryCard
            dataset={dataset}
            onSeedDemo={() => {}}
            isSeeding={false}
          />

          {/* Analytics Visualization Section */}
          {charts && stats.totalRecords > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Dataset Analytics & Demographics
                </h2>
                <span className="text-xs text-gray-500 font-medium">Real-time aggregate projections</span>
              </div>
              <AnalyticsCharts charts={charts} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
