'use client';

import React from 'react';
import { Filters, HighLevelMetrics } from '../types';
import { getExportUrl } from '../lib/api';
import { 
  Users, 
  Mail, 
  Activity, 
  DollarSign, 
  Download, 
  SlidersHorizontal,
  Compass,
  KeyRound,
  TrendingUp,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';

interface SidebarProps {
  metrics: HighLevelMetrics | null;
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
}

export default function Sidebar({ metrics, filters, onFilterChange }: SidebarProps) {
  // Available filter options matching generator
  const categories = ['All', 'Tech', 'Fintech', 'AI/Data', 'Growth/Marketing'];
  const sources = [
    'All', 
    'Organic Search', 
    'X/Twitter', 
    'Referral Flywheel', 
    'Paid Ads', 
    'Partner Swaps', 
    'Direct'
  ];
  
  // Available cohort periods (Months Jan 2025 to May 2026)
  const cohortPeriods = [
    'All',
    '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
    '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12',
    '2026-01', '2026-02', '2026-03', '2026-04', '2026-05'
  ];
  
  const revenueRanges = ['All', '$0', '$1-$50', '$50+'];
  const referralSegments = ['All', 'Referred', 'Non-Referred'];

  const handleSelectChange = (key: keyof Filters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '0' ? null : parseFloat(e.target.value);
    onFilterChange({
      ...filters,
      open_rate_threshold: val
    });
  };

  const triggerDownload = (format: 'csv' | 'json') => {
    const url = getExportUrl(filters, format);
    window.open(url, '_blank');
  };

  return (
    <aside className="w-full flex flex-col gap-6 font-sans">
      
      {/* SECTION A: Title + High-Level Metrics */}
      <div className="rounded-lg border border-border-dark bg-surface-card p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-accent-cyan/10 to-transparent blur-xl pointer-events-none" />
        
        <h2 className="font-display text-sm font-semibold tracking-wider text-accent-cyan uppercase font-mono mb-4 flex items-center gap-2 border-b border-border-dark/60 pb-2.5">
          <Activity className="h-4 w-4" />
          Terminal Indicators
        </h2>

        <div className="flex flex-col gap-4">
          {/* Total Subscribers */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-1">
              <span>Total Audience Scale</span>
              <Users className="h-3.5 w-3.5 text-accent-cyan/80" />
            </div>
            <div className="text-2xl font-bold font-mono text-gray-100 tracking-tight">
              {metrics ? metrics.total_subscribers.value : '0'}
            </div>
            {metrics && (
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                {metrics.total_subscribers.insight}
              </p>
            )}
          </div>

          <div className="h-px bg-border-dark/45" />

          {/* Open Rate Benchmark */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-1">
              <span>Audience Open Rate</span>
              <Mail className="h-3.5 w-3.5 text-accent-indigo/80" />
            </div>
            <div className="text-2xl font-bold font-mono text-gray-100 tracking-tight">
              {metrics ? metrics.open_rate.value : '0.0%'}
            </div>
            {metrics && (
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                {metrics.open_rate.insight}
              </p>
            )}
          </div>

          <div className="h-px bg-border-dark/45" />

          {/* Growth Velocity */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-1">
              <span>Growth Velocity</span>
              <TrendingUp className="h-3.5 w-3.5 text-accent-cyan/80" />
            </div>
            <div className={`text-2xl font-bold font-mono tracking-tight ${
              metrics?.growth_velocity.status === 'positive' 
                ? 'text-accent-cyan' 
                : metrics?.growth_velocity.status === 'negative' 
                  ? 'text-red-400' 
                  : 'text-gray-100'
            }`}>
              {metrics ? metrics.growth_velocity.value : '0.0% MoM'}
            </div>
            {metrics && (
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                {metrics.growth_velocity.insight}
              </p>
            )}
          </div>

          <div className="h-px bg-border-dark/45" />

          {/* Revenue Efficiency */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-1">
              <span>ARPU (Revenue Efficiency)</span>
              <DollarSign className="h-3.5 w-3.5 text-accent-indigo/80" />
            </div>
            <div className="text-2xl font-bold font-mono text-gray-100 tracking-tight">
              {metrics ? metrics.revenue_efficiency.value : '$0.00'}
            </div>
            {metrics && (
              <p className="text-[10px] text-gray-400 mt-1 leading-snug">
                {metrics.revenue_efficiency.insight}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION B: “Why This Matters” */}
      <div className="rounded-lg border border-border-dark bg-surface-card p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-br from-accent-indigo/10 to-transparent blur-xl pointer-events-none" />
        <h2 className="font-display text-sm font-semibold tracking-wider text-accent-indigo uppercase font-mono mb-2 flex items-center gap-2 border-b border-border-dark/60 pb-2.5">
          <Compass className="h-4 w-4" />
          Why This Matters
        </h2>
        <div className="text-xs text-gray-300 space-y-2 leading-relaxed">
          <p className="font-semibold text-gray-200">
            Natural fit for your own distribution-rail narrative.
          </p>
          <p className="text-gray-400">
            For builders and allocators, direct audience is the ultimate leverage. 
            By building direct inbox relationships, operators bypass algorithmic aggregators, securing the underlying customer rails.
          </p>
          <p className="text-gray-400">
            This dashboard explains how audience unit economics compound. Understanding deliverability, cohort retention, and organic virality factors acts as a risk mitigant and capitalization multiplier.
          </p>
        </div>
      </div>

      {/* SECTION C: “Who Controls the Rail” */}
      <div className="rounded-lg border border-border-dark bg-surface-card p-5 shadow-xl">
        <h2 className="font-display text-sm font-semibold tracking-wider text-gray-300 uppercase font-mono mb-2.5 flex items-center gap-2 border-b border-border-dark/60 pb-2.5">
          <KeyRound className="h-4 w-4 text-gray-400" />
          Who Controls the Rail
        </h2>
        <p className="text-xs text-gray-400 leading-relaxed font-sans">
          The distribution rail is controlled by platforms, inbox algorithms, creator trust, and sponsorship networks that determine audience reach and monetization leverage.
        </p>
      </div>

      {/* SECTION D: Functional Filters */}
      <div className="rounded-lg border border-border-dark bg-surface-card p-5 shadow-xl">
        <h2 className="font-display text-sm font-semibold tracking-wider text-accent-cyan uppercase font-mono mb-4 flex items-center gap-2 border-b border-border-dark/60 pb-2.5">
          <SlidersHorizontal className="h-4 w-4" />
          Intelligence Filters
        </h2>

        <div className="flex flex-col gap-4 font-mono text-xs">
          
          {/* Cohort Period */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 uppercase text-[10px] tracking-wider">Cohort Period</label>
            <select
              value={filters.cohort_period}
              onChange={(e) => handleSelectChange('cohort_period', e.target.value)}
              className="w-full bg-background-obsidian border border-border-dark rounded px-2.5 py-1.5 text-gray-200 focus:border-accent-cyan interactive-glow"
            >
              {cohortPeriods.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 uppercase text-[10px] tracking-wider">Newsletter Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleSelectChange('category', e.target.value)}
              className="w-full bg-background-obsidian border border-border-dark rounded px-2.5 py-1.5 text-gray-200 focus:border-accent-cyan interactive-glow"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Subscriber Source */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 uppercase text-[10px] tracking-wider">Acquisition Source</label>
            <select
              value={filters.source}
              onChange={(e) => handleSelectChange('source', e.target.value)}
              className="w-full bg-background-obsidian border border-border-dark rounded px-2.5 py-1.5 text-gray-200 focus:border-accent-cyan interactive-glow"
            >
              {sources.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Revenue Range */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 uppercase text-[10px] tracking-wider">Revenue Contribution</label>
            <select
              value={filters.revenue_range}
              onChange={(e) => handleSelectChange('revenue_range', e.target.value)}
              className="w-full bg-background-obsidian border border-border-dark rounded px-2.5 py-1.5 text-gray-200 focus:border-accent-cyan interactive-glow"
            >
              {revenueRanges.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Referral Segment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-400 uppercase text-[10px] tracking-wider">Referral Segment</label>
            <select
              value={filters.referral_segment}
              onChange={(e) => handleSelectChange('referral_segment', e.target.value)}
              className="w-full bg-background-obsidian border border-border-dark rounded px-2.5 py-1.5 text-gray-200 focus:border-accent-cyan interactive-glow"
            >
              {referralSegments.map(rs => (
                <option key={rs} value={rs}>{rs}</option>
              ))}
            </select>
          </div>

          {/* Open-rate Threshold Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-gray-400 text-[10px] uppercase tracking-wider">
              <span>Open-Rate Threshold</span>
              <span className="text-accent-cyan font-bold font-mono">
                {filters.open_rate_threshold === null ? 'All' : `>= ${filters.open_rate_threshold}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.open_rate_threshold === null ? 0 : filters.open_rate_threshold}
              onChange={handleSliderChange}
              className="w-full h-1 bg-border-dark rounded-lg appearance-none cursor-pointer accent-accent-cyan"
            />
            <span className="text-[9px] text-gray-500 font-sans leading-tight">
              Slide to filter subscribers with engagement above specified rate. Set to 0 to disable.
            </span>
          </div>

        </div>
      </div>

      {/* SECTION E: Download Sample Data Button */}
      <div className="rounded-lg border border-border-dark bg-surface-card p-5 shadow-xl flex flex-col gap-3">
        <h2 className="font-display text-sm font-semibold tracking-wider text-gray-300 uppercase font-mono flex items-center gap-2 border-b border-border-dark/60 pb-2.5">
          <Download className="h-4 w-4 text-gray-400" />
          Export Datasets
        </h2>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <button
            onClick={() => triggerDownload('csv')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-accent-cyan/10 border border-accent-cyan/25 hover:border-accent-cyan hover:bg-accent-cyan/15 text-accent-cyan rounded font-bold cursor-pointer transition-all duration-150"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            CSV DATA
          </button>
          <button
            onClick={() => triggerDownload('json')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-accent-indigo/10 border border-accent-indigo/25 hover:border-accent-indigo hover:bg-accent-indigo/15 text-accent-indigo rounded font-bold cursor-pointer transition-all duration-150"
          >
            <FileCode className="h-3.5 w-3.5" />
            JSON DATA
          </button>
        </div>
        <p className="text-[10px] text-gray-500 text-center leading-snug">
          Clicking generates an instant raw query export containing the active filtered segment.
        </p>
      </div>

    </aside>
  );
}
