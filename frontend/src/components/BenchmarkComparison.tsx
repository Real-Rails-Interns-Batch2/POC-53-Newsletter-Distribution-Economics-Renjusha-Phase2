'use client';

import React from 'react';
import { BenchmarkComparison as BenchmarkType } from '../types';
import { CheckCircle2, AlertTriangle, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BenchmarkComparisonProps {
  benchmarks: BenchmarkType[];
}

export default function BenchmarkComparison({ benchmarks }: BenchmarkComparisonProps) {
  if (!benchmarks || benchmarks.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-border-dark bg-surface-card text-gray-500 text-xs">
        No benchmark comparative analysis available.
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'outperforms':
        return {
          bg: 'bg-accent-cyan/10 border-accent-cyan/35 text-accent-cyan',
          icon: <CheckCircle2 className="h-4 w-4 text-accent-cyan shrink-0" />,
          diffIcon: <ArrowUpRight className="h-3 w-3" />,
          diffColor: 'text-accent-cyan'
        };
      case 'underperforms':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          icon: <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />,
          diffIcon: <ArrowDownRight className="h-3 w-3" />,
          diffColor: 'text-orange-400'
        };
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/25 text-gray-300',
          icon: <HelpCircle className="h-4 w-4 text-gray-400 shrink-0" />,
          diffIcon: null,
          diffColor: 'text-gray-400'
        };
    }
  };

  const formatValue = (metricName: string, val: number) => {
    if (metricName.includes('$') || metricName.includes('CPM')) {
      return `$${val.toFixed(2)}`;
    }
    return `${(val * 100).toFixed(1)}%`;
  };

  const formatDiff = (metricName: string, val: number) => {
    const prefix = val >= 0 ? '+' : '';
    if (metricName.includes('$') || metricName.includes('CPM')) {
      return `${prefix}$${val.toFixed(2)}`;
    }
    return `${prefix}${(val * 100).toFixed(1)}%`;
  };

  return (
    <div className="rounded-lg border border-border-dark bg-surface-card p-6 shadow-xl">
      <div className="mb-5">
        <h3 className="font-display text-lg font-semibold text-gray-100 tracking-tight">
          Sector Benchmark Scorecard
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Compares current distribution statistics against sector benchmarks to identify operational efficiencies and channels that need optimization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {benchmarks.map((b) => {
          const style = getStatusStyle(b.status);
          return (
            <div
              key={b.metric}
              className="p-4 bg-background-obsidian/50 rounded-lg border border-border-dark/60 flex flex-col justify-between hover:border-border-dark transition-all duration-150"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-300 font-display tracking-wide uppercase">
                    {b.metric}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-xl font-bold font-mono text-gray-100">
                      {formatValue(b.metric, b.actual)}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      vs {formatValue(b.metric, b.benchmark)} target
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className={`px-2 py-0.5 border rounded text-[10px] uppercase font-mono font-bold flex items-center gap-1 ${style.bg}`}>
                  {style.icon}
                  {b.status}
                </div>
              </div>

              <div className="border-t border-border-dark/30 pt-2.5 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className={`font-mono text-xs font-bold flex items-center ${style.diffColor}`}>
                    {style.diffIcon}
                    {formatDiff(b.metric, b.difference)}
                  </span>
                  <span>variance.</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                  {b.insight}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
