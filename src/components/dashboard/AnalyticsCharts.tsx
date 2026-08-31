'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartItem {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  charts?: {
    gender: ChartItem[];
    status: ChartItem[];
    locations: ChartItem[];
    ageRanges: { range: string; count: number }[];
  };
}

const GENDER_COLORS: Record<string, string> = {
  Male: '#4F46E5',
  Female: '#EC4899',
  Other: '#10B981',
};

const STATUS_COLORS: Record<string, string> = {
  Active: '#10B981',
  Inactive: '#6B7280',
  Pending: '#F59E0B',
  Suspended: '#EF4444',
};

export function AnalyticsCharts({ charts }: AnalyticsChartsProps) {
  const genderData = charts?.gender || [
    { name: 'Male', value: 1018 },
    { name: 'Female', value: 975 },
    { name: 'Other', value: 130 },
  ];

  const statusData = charts?.status || [
    { name: 'Active', value: 1415 },
    { name: 'Inactive', value: 420 },
    { name: 'Pending', value: 288 },
  ];

  const locationData = charts?.locations || [
    { name: 'Dhaka', value: 580 },
    { name: 'Chittagong', value: 410 },
    { name: 'Sylhet', value: 320 },
    { name: 'Rajshahi', value: 290 },
    { name: 'Khulna', value: 240 },
    { name: 'Barisal', value: 180 },
  ];

  const ageData = charts?.ageRanges || [
    { range: '18–25', count: 620 },
    { range: '26–35', count: 850 },
    { range: '36–49', count: 480 },
    { range: '50–64', count: 173 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gender & Status Demographic Doughnuts */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          Gender Breakdown
        </h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {genderData.map((entry) => (
                  <Cell key={entry.name} fill={GENDER_COLORS[entry.name] || '#6366F1'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#FFF',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center items-center space-x-6 mt-2">
          {genderData.map((g) => (
            <div key={g.name} className="flex items-center space-x-2 text-xs font-semibold">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: GENDER_COLORS[g.name] || '#6366F1' }}
              />
              <span className="text-gray-600 dark:text-gray-400">{g.name}:</span>
              <span className="text-gray-900 dark:text-white">{g.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Location Distribution Bar Chart */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          Top Locations (Districts)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={locationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#FFF',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Age Group Distribution */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          Age Demographics
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#FFF',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution Doughnut */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-card">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
          Record Status Distribution
        </h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6B7280'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E293B',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#FFF',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center items-center space-x-6 mt-2">
          {statusData.map((s) => (
            <div key={s.name} className="flex items-center space-x-2 text-xs font-semibold">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[s.name] || '#6B7280' }}
              />
              <span className="text-gray-600 dark:text-gray-400">{s.name}:</span>
              <span className="text-gray-900 dark:text-white">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
