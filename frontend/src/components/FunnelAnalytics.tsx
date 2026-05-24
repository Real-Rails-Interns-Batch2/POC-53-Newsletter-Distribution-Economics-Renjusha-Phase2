'use client';

import React from 'react';
import { FunnelStage } from '../types';
import { Filter, ChevronRight, CornerDownRight } from 'lucide-react';

interface FunnelAnalyticsProps {
  funnel: FunnelStage[];
}

export default function FunnelAnalytics({ funnel }: FunnelAnalyticsProps) {
  if (!funnel || funnel.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border-dark bg-surface-card text-gray-500">
        No funnel analytics available.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-dark bg-surface-card p-6 shadow-xl">
      <div className="mb-6">
        <h3 className="font-display text-lg font-semibold text-gray-100 flex items-center gap-2 tracking-tight">
          <Filter className="h-5 w-5 text-accent-cyan" />
          Distribution Funnel & Conversion Economics
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Measures volume drop-offs and relative efficiency across the customer lifecycle from raw audience to active referrer.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {funnel.map((stage, idx) => (
          <div key={stage.stage} className="relative">
            {/* Horizontal Stage Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background-obsidian/45 rounded-lg border border-border-dark/60 hover:border-accent-cyan/30 transition-all duration-200 gap-4">
              
              {/* Left Side: Name and Progress Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono text-accent-cyan font-bold">0{idx + 1}</span>
                  <h4 className="text-sm font-semibold text-gray-200 tracking-tight">{stage.stage}</h4>
                </div>
                
                {/* Visual Bar */}
                <div className="h-2 w-full bg-border-dark/45 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-indigo"
                    style={{ width: `${stage.percentage_of_total}%` }}
                  />
                </div>
              </div>

              {/* Middle: Count and Pct indicators */}
              <div className="flex items-center gap-6 text-right md:w-64 justify-between md:justify-end">
                <div className="text-left md:text-right">
                  <div className="text-xs font-mono font-bold text-gray-100">
                    {stage.count.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">Subscribers</div>
                </div>

                <div className="h-8 w-px bg-border-dark/50 hidden md:block" />

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-accent-cyan">
                    {stage.percentage_of_total.toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">Of Target</div>
                </div>
                
                {/* Pct of previous badge */}
                {idx > 0 && (
                  <div className="px-2 py-1 bg-accent-indigo/15 text-accent-indigo border border-accent-indigo/25 rounded text-[10px] font-mono font-bold">
                    -{ (100 - stage.percentage_of_previous).toFixed(1) }% drop
                  </div>
                )}
              </div>
            </div>

            {/* Insight Text */}
            <div className="pl-6 pr-4 py-1.5 text-[11px] text-gray-400 flex items-start gap-1">
              <CornerDownRight className="h-3.5 w-3.5 text-gray-600 shrink-0 mt-0.5" />
              <span>{stage.insight}</span>
            </div>

            {/* Connector Arrow */}
            {idx < funnel.length - 1 && (
              <div className="flex justify-center my-0.5">
                <ChevronRight className="h-4 w-4 text-border-dark rotate-90" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
