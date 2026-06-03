'use client';

import React from 'react';
import { CohortRetentionRow } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity
} from 'lucide-react';

interface CohortDashboardProps {
  cohorts: CohortRetentionRow[];
  onRowClick?: (cohortMonth: string) => void;
}

export default function CohortDashboard({
  cohorts,
  onRowClick
}: CohortDashboardProps) {

  if (!cohorts || cohorts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border-dark bg-surface-card text-gray-500">
        No cohort data available for current filter selection.
      </div>
    );
  }

  // Month labels (M0 → M12)
  const monthLabels = Array.from(
    { length: 13 },
    (_, i) => `M${i}`
  );

  // Heatmap coloring
  const getHeatmapColor = (rate: number) => {
    if (rate === 1.0) return 'rgba(168, 85, 247, 0.25)';
    if (rate > 0.8) return 'rgba(168, 85, 247, 0.8)';
    if (rate > 0.6) return 'rgba(168, 85, 247, 0.6)';
    if (rate > 0.4) return 'rgba(129, 140, 248, 0.5)';
    if (rate > 0.2) return 'rgba(129, 140, 248, 0.3)';
    if (rate > 0.05) return 'rgba(42, 36, 64, 0.5)';
    return 'rgba(15, 13, 34, 0.4)';
  };

  // KPI calculations
  const totalUsers = cohorts.reduce(
    (sum, c) => sum + c.original_size,
    0
  );

  const avgOpenRate =
    cohorts.reduce(
      (sum, c) => sum + c.avg_open_rate,
      0
    ) / cohorts.length;

  const avgClickRate =
    cohorts.reduce(
      (sum, c) => sum + c.avg_click_rate,
      0
    ) / cohorts.length;

  const avgRetention6M =
    cohorts.reduce(
      (sum, c) => sum + (c.retention_rates[6] || 0),
      0
    ) / cohorts.length;

  const bestCohort = [...cohorts].sort(
    (a, b) =>
      (b.retention_rates[6] || 0) -
      (a.retention_rates[6] || 0)
  )[0];

  const weakestCohort = [...cohorts].sort(
    (a, b) =>
      (a.retention_rates[6] || 0) -
      (b.retention_rates[6] || 0)
  )[0];

  return (
    <div className="rounded-lg border border-border-dark bg-surface-card p-6 shadow-xl">

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-100 tracking-tight">
            Subscriber Cohort Retention Matrix
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Tracks subscriber retention decay by signup month using retention heatmaps and cohort intelligence.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-accent-cyan" />
            High (&gt;60%)
          </span>

          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-accent-indigo" />
            Mid (20%-60%)
          </span>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
            <Users size={15} />
            Cohort Size
          </div>

          <p className="mt-2 text-2xl font-semibold text-gray-100">
            {totalUsers.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
            <Activity size={15} />
            Avg Open Rate
          </div>

          <p className="mt-2 text-2xl font-semibold text-accent-cyan">
            {(avgOpenRate * 100).toFixed(1)}%
          </p>
        </div>

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
            <TrendingUp size={15} />
            Avg 6M Retention
          </div>

          <p className="mt-2 text-2xl font-semibold text-green-400">
            {(avgRetention6M * 100).toFixed(1)}%
          </p>
        </div>

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-xs uppercase">
            <TrendingDown size={15} />
            Avg CTR
          </div>

          <p className="mt-2 text-2xl font-semibold text-indigo-300">
            {(avgClickRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-xs text-gray-300">

          <thead>
            <tr className="border-b border-border-dark bg-background-obsidian/50 text-[10px] uppercase tracking-wider text-gray-400">
              <th className="py-3 px-4">Cohort</th>
              <th className="py-3 px-3 text-right">Size</th>
              <th className="py-3 px-3">Top Source</th>

              {monthLabels.map((lbl) => (
                <th
                  key={lbl}
                  className="py-3 px-1.5 text-center"
                >
                  {lbl}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border-dark/40 font-mono">

            {cohorts.map((row) => (
              <tr
                key={row.cohort_month}
                onClick={() => onRowClick?.(row.cohort_month)}
                className="hover:bg-background-obsidian/50 transition-colors cursor-pointer"
              >
                <td className="py-2.5 px-4 font-semibold text-gray-200">
                  {row.cohort_month}
                </td>

                <td className="py-2.5 px-3 text-right text-gray-400">
                  {row.original_size.toLocaleString()}
                </td>

                <td className="py-2.5 px-3 text-[10px] uppercase text-accent-cyan">
                  {row.acquisition_source}
                </td>

                {row.retention_rates.map(
                  (rate, idx) => (
                    <td
                      key={idx}
                      className="p-1 border border-border-dark/10"
                    >
                      <div
                        className="rounded py-1 px-1 text-center text-[10px] font-bold transition-all hover:scale-105"
                        style={{
                          backgroundColor:
                            getHeatmapColor(rate),
                          color:
                            rate > 0.4
                              ? '#030712'
                              : '#9CA3AF'
                        }}
                      >
                        {(rate * 100).toFixed(0)}%
                      </div>
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* INSIGHTS */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <p className="text-xs uppercase text-green-400 mb-2">
            Best Performing Cohort
          </p>

          <p className="text-sm text-gray-200">
            {bestCohort.cohort_month}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {(bestCohort.retention_rates[6] * 100).toFixed(1)}%
            6-month retention via{' '}
            {bestCohort.acquisition_source}
          </p>
        </div>

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <p className="text-xs uppercase text-red-400 mb-2">
            Weakest Cohort
          </p>

          <p className="text-sm text-gray-200">
            {weakestCohort.cohort_month}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {(weakestCohort.retention_rates[6] * 100).toFixed(1)}%
            6-month retention via{' '}
            {weakestCohort.acquisition_source}
          </p>
        </div>
      </div>
    </div>
  );
}