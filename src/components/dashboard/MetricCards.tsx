'use client';

import React from 'react';
import { Database, Columns, Filter, Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardsProps {
  stats: {
    totalRecords: number;
    totalFields: number;
    filteredRecords: number;
    lastUpload: string;
  };
  isLoading?: boolean;
}

export function MetricCards({ stats, isLoading }: MetricCardsProps) {
  const cards = [
    {
      title: 'Total Records',
      value: isLoading ? '...' : stats.totalRecords.toLocaleString(),
      subtext: '+12% from last import',
      icon: Database,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    {
      title: 'Total Fields',
      value: isLoading ? '...' : stats.totalFields.toString(),
      subtext: 'Normalized schemas',
      icon: Columns,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      title: 'Filtered Records',
      value: isLoading ? '...' : stats.filteredRecords.toLocaleString(),
      subtext: 'Active search scope',
      icon: Filter,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      title: 'Last Upload',
      value: isLoading ? '...' : stats.lastUpload,
      subtext: 'Ready for analysis',
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card hover:shadow-cardHover transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                {card.value}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                {card.subtext}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
