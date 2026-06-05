'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Filters, DashboardPayload, SubscriberListResponse } from '../types';
import { exportMetrics, fetchDashboardData, fetchSubscribersList } from '../lib/api';
import Sidebar from '../components/Sidebar';
import CohortDashboard from '../components/CohortDashboard';
import ReferralFlow from '../components/ReferralFlow';
import MonetizationOverview from '../components/MonetizationOverview';
import FunnelAnalytics from '../components/FunnelAnalytics';
import BenchmarkComparison from '../components/BenchmarkComparison';
import SubscriberTable from '../components/SubscriberTable';
import { Download } from 'lucide-react';
import { 
  Terminal, 
  Layers, 
  TrendingUp, 
  Network, 
  DollarSign, 
  ListFilter, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  SlidersHorizontal,
  Info,
  X
} from 'lucide-react';

export default function Dashboard() {
  // 1. Core State
  const [filters, setFilters] = useState<Filters>({
    category: 'All',
    source: 'All',
    cohort_period: 'All',
    revenue_range: 'All',
    referral_segment: 'All',
    open_rate_threshold: null
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'monetization' | 'ledger'>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [subscribersData, setSubscribersData] = useState<SubscriberListResponse | null>(null);
  
  const [ledgerPage, setLedgerPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Slide-over & Metadata Modal States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // 2. Load Data from API
  const loadDashboardData = useCallback(async (currentFilters: Filters) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchDashboardData(currentFilters);
      setDashboardData(data);
      setIsBackendConnected(true);
    } catch (err: any) {
      console.warn("Backend API offline, loading fallback mock simulations...", err);
      setIsBackendConnected(false);
      setErrorMsg("FastAPI Backend Server Offline. Reverting to client-side fallback analytics.");
      // Load fallback simulation
      simulateFallbackData(currentFilters);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSubscribersList = useCallback(async (currentFilters: Filters, page: number) => {
    try {
      const data = await fetchSubscribersList(currentFilters, page, 15);
      setSubscribersData(data);
    } catch (err) {
      console.warn("Backend API offline, simulating subscriber ledger...", err);
      simulateFallbackLedger(currentFilters, page);
    }
  }, []);

  // Trigger loading on filter changes
  useEffect(() => {
    loadDashboardData(filters);
    setLedgerPage(1);
    loadSubscribersList(filters, 1);
  }, [filters, loadDashboardData, loadSubscribersList]);

  // Trigger loading on page changes
  useEffect(() => {
    loadSubscribersList(filters, ledgerPage);
  }, [ledgerPage, filters, loadSubscribersList]);

  // 3. Fallback/Safe State Calculations (2-Hour Rule Failover)
  const simulateFallbackData = (currentFilters: Filters) => {
    // Generate basic response matching dashboard structure
    const totalSubs = currentFilters.category === 'All' ? 5000 : 1250;
    const mockOpen = currentFilters.source === 'Referral Flywheel' ? 0.62 : 0.46;
    const mockGrowth = currentFilters.category === 'Fintech' ? 0.14 : 0.08;
    const mockArpu = currentFilters.revenue_range === '$50+' ? 58.20 : 9.44;

    const simulatedPayload: DashboardPayload = {
      metrics: {
        total_subscribers: {
          value: totalSubs.toLocaleString(),
          label: "Total Audience Scale (Simulated)",
          insight: "Scale meets local benchmark models. Fallback engine online.",
          status: "neutral"
        },
        open_rate: {
          value: `${(mockOpen * 100).toFixed(1)}%`,
          label: "Audience Open Rate",
          insight: "Open rate stable. Running on local mock_data.json failover.",
          status: "positive"
        },
        growth_velocity: {
          value: `+${(mockGrowth * 100).toFixed(1)}% MoM`,
          label: "Growth Velocity",
          insight: "Net additions active. Flywheel compounds organically.",
          status: "positive"
        },
        revenue_efficiency: {
          value: `$${mockArpu.toFixed(2)}`,
          label: "ARPU (Revenue Efficiency)",
          insight: "Average yield aligns with local mock targets.",
          status: "neutral"
        }
      },
      cohorts: [
        { cohort_month: "2025-12", original_size: 420, acquisition_source: "Organic Search", retention_rates: [1.0, 0.92, 0.85, 0.79, 0.72, 0.68, 0.62, 0.58, 0.52, 0.48, 0.44, 0.40, 0.38], avg_open_rate: 0.48, avg_click_rate: 0.08 },
        { cohort_month: "2026-01", original_size: 490, acquisition_source: "Referral Flywheel", retention_rates: [1.0, 0.94, 0.89, 0.82, 0.78, 0.74, 0.69, 0.64, 0.60, 0.55, 0.51, 0.48, 0.45], avg_open_rate: 0.61, avg_click_rate: 0.12 },
        { cohort_month: "2026-02", original_size: 510, acquisition_source: "X/Twitter", retention_rates: [1.0, 0.88, 0.81, 0.73, 0.66, 0.59, 0.53, 0.48, 0.43, 0.39, 0.34, 0.30, 0.28], avg_open_rate: 0.44, avg_click_rate: 0.07 },
        { cohort_month: "2026-03", original_size: 580, acquisition_source: "Paid Ads", retention_rates: [1.0, 0.78, 0.65, 0.55, 0.48, 0.42, 0.36, 0.31, 0.27, 0.24, 0.21, 0.18, 0.15], avg_open_rate: 0.31, avg_click_rate: 0.04 },
        { cohort_month: "2026-04", original_size: 640, acquisition_source: "Organic Search", retention_rates: [1.0, 0.90, 0.82, 0.75, 0.68, 0.62, 0.56, 0.50, 0.45, 0.41, 0.37, 0.34, 0.31], avg_open_rate: 0.50, avg_click_rate: 0.09 },
        { cohort_month: "2026-05", original_size: 710, acquisition_source: "Referral Flywheel", retention_rates: [1.0, 0.95, 0.90, 0.84, 0.79, 0.75, 0.70, 0.66, 0.61, 0.57, 0.53, 0.49, 0.46], avg_open_rate: 0.63, avg_click_rate: 0.14 }
      ],
      referral: {
        nodes: [
          { id: "Organic Search", label: "Organic Search", size: 30, type: "source" },
          { id: "X/Twitter", label: "X/Twitter", size: 25, type: "source" },
          { id: "Referral Flywheel", label: "Referral Flywheel", size: 35, type: "source" },
          { id: "Paid Ads", label: "Paid Ads", size: 15, type: "source" },
          { id: "Direct", label: "Direct", size: 20, type: "source" },
          { id: "Audience Core", label: "Audience Core", size: 50, type: "subscriber" },
          { id: "Referral Loop", label: "Referrals Flywheel", size: 35, type: "influencer" }
        ],
        links: [
          { source: "Organic Search", target: "Audience Core", value: 1200, conversion_rate: 0.52 },
          { source: "X/Twitter", target: "Audience Core", value: 950, conversion_rate: 0.45 },
          { source: "Referral Flywheel", target: "Audience Core", value: 1300, conversion_rate: 0.62 },
          { source: "Paid Ads", target: "Audience Core", value: 550, conversion_rate: 0.32 },
          { source: "Direct", target: "Audience Core", value: 400, conversion_rate: 0.58 },
          { source: "Referral Loop", target: "Audience Core", value: 450, conversion_rate: 0.34 }
        ],
        virality_coefficient: 0.142,
        total_referrals: 450,
        insight: "Fallback data: Referral Flywheel is active, delivering strong organic distribution metrics."
      },
      monetization: {
        history: [
          { month: "2025-12", sponsorship_revenue: 12000, premium_subscription_revenue: 3500, total_revenue: 15500, active_sponsors: 8, avg_cpm: 45.0, revenue_per_subscriber: 3.20 },
          { month: "2026-01", sponsorship_revenue: 14500, premium_subscription_revenue: 4100, total_revenue: 18600, active_sponsors: 10, avg_cpm: 48.0, revenue_per_subscriber: 3.50 },
          { month: "2026-02", sponsorship_revenue: 15800, premium_subscription_revenue: 4800, total_revenue: 20600, active_sponsors: 11, avg_cpm: 46.5, revenue_per_subscriber: 3.75 },
          { month: "2026-03", sponsorship_revenue: 17200, premium_subscription_revenue: 5500, total_revenue: 22700, active_sponsors: 12, avg_cpm: 49.0, revenue_per_subscriber: 3.90 },
          { month: "2026-04", sponsorship_revenue: 19500, premium_subscription_revenue: 6200, total_revenue: 25700, active_sponsors: 13, avg_cpm: 51.0, revenue_per_subscriber: 4.15 },
          { month: "2026-05", sponsorship_revenue: 22000, premium_subscription_revenue: 7100, total_revenue: 29100, active_sponsors: 14, avg_cpm: 53.5, revenue_per_subscriber: 4.35 }
        ],
        forecast: [],
        sponsorship_yield_insight: "Sponsorship yield outperforms local targets by 18% in the fallback simulation.",
        premium_growth_insight: "Premium subscriptions show consistent MoM recurring baseline stability.",
        overall_rev_insight: "Monthly distribution revenues have compounded organically at 12% MoM."
      },
      funnel: [
        { stage: "Audience Target", count: totalSubs, percentage_of_total: 100, percentage_of_previous: 100, insight: "Initial signup pool representing raw subscriber volume." },
        { stage: "Inbox Delivered", count: Math.round(totalSubs * 0.985), percentage_of_total: 98.5, percentage_of_previous: 98.5, insight: "Deliverability rate stands at 98.5%, showcasing high ISP reputation." },
        { stage: "Content Opened", count: Math.round(totalSubs * 0.985 * mockOpen), percentage_of_total: Math.round(98.5 * mockOpen), percentage_of_previous: Math.round(mockOpen * 100), insight: `Average open rate is ${(mockOpen * 100).toFixed(0)}% in fallback state.` },
        { stage: "Ad Links Clicked", count: Math.round(totalSubs * 0.08), percentage_of_total: 8.0, percentage_of_previous: 18.0, insight: "Click-through rate on sponsored ad inventory." },
        { stage: "Paid Conversions", count: Math.round(totalSubs * 0.06), percentage_of_total: 6.0, percentage_of_previous: 75.0, insight: "Conversion to premium tiers adds recurring foundation." }
      ],
      benchmarks: [
        { metric: "Audience Open Rate", actual: mockOpen, benchmark: 0.42, difference: mockOpen - 0.42, status: mockOpen >= 0.45 ? "outperforms" : "aligns", insight: "Inbox placement and title loops outperform benchmarks." },
        { metric: "Audience Click-Through Rate", actual: 0.082, benchmark: 0.06, difference: 0.022, status: "outperforms", insight: "Click rates beat sector standard, showcasing relevant ad copy." },
        { metric: "Sponsorship CPM ($)", actual: 48.50, benchmark: 42.0, difference: 6.50, status: "outperforms", insight: "Premium tech sponsorships command a solid $6.50 yield premium." },
        { metric: "12-Month Subscriber Retention", actual: 0.71, benchmark: 0.65, difference: 0.06, status: "outperforms", insight: "High subscriber retention beat average benchmark targets by 6%." }
      ]
    };
    setDashboardData(simulatedPayload);
  };

  const simulateFallbackLedger = (currentFilters: Filters, page: number) => {
    const totalCount = currentFilters.category === 'All' ? 340 : 85;
    const list: any[] = [];
    const sourceVal = currentFilters.source === 'All' ? 'Organic Search' : currentFilters.source;
    const catVal = currentFilters.category === 'All' ? 'Tech' : currentFilters.category;

    const startIdx = (page - 1) * 15;
    const countOnPage = Math.min(15, totalCount - startIdx);

    for (let i = 0; i < countOnPage; i++) {
      const idx = startIdx + i + 1;
      list.push({
        subscriber_id: `sub_${idx.toString().padStart(5, '0')}`,
        email: `reader_${idx}@domain.com`,
        category: catVal,
        acquisition_source: sourceVal,
        signup_month: currentFilters.cohort_period === 'All' ? '2026-03' : currentFilters.cohort_period,
        status: idx % 10 === 0 ? 'churned' : 'active',
        months_active: idx % 10 === 0 ? 3 : 12,
        tier: idx % 8 === 0 ? 'premium' : 'free',
        open_rate: idx % 8 === 0 ? 0.72 : 0.45,
        click_rate: idx % 8 === 0 ? 0.18 : 0.08,
        unsubscribe_rate: 0.003,
        deliverability_score: 0.99,
        premium_subscription_revenue: idx % 8 === 0 ? 96.0 : 0.0
      });
    }

    setSubscribersData({
      subscribers: list,
      total_count: totalCount,
      page: page,
      page_size: 15
    });
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background-obsidian text-gray-100 flex flex-col">
      {/* Header Console */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-black/10 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-cyan/15 rounded border border-accent-cyan/20">
            <Terminal className="h-5 w-5 text-accent-cyan" />
          </div>
          <div className="flex flex-col">
  {/* Title Row */}
  <div className="flex items-center gap-3 flex-wrap">
    <h1 className="font-display text-lg font-bold tracking-tight text-gray-100">
      Newsletter Distribution Economics
    </h1>

    {/* Internship Badge */}
    <div className="relative overflow-hidden px-3 py-1 rounded-md border border-accent-cyan/25 bg-gradient-to-r from-accent-cyan/10 via-[#131125] to-accent-cyan/10 shadow-[0_0_20px_rgba(0,255,255,0.08)]">
      {/* subtle glow overlay */}
      <div className="absolute inset-0 bg-accent-cyan/5 blur-xl opacity-50" />

      <span className="relative text-[10px] sm:text-[11px] font-mono tracking-[0.22em] uppercase font-bold text-accent-cyan">
        INFOCREON INTERNSHIP
      </span>
    </div>
  </div>

  {/* Project metadata */}
  <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-1">
    Project ID: 53 // Rail: Distribution & Demand
  </p>
</div>
        </div>

        {/* Status indicator + Controls + Export + Signature */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Controls Trigger Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="px-3.5 py-2 rounded border border-accent-cyan/25 bg-accent-cyan/10 text-accent-cyan text-xs font-mono hover:bg-accent-cyan/20 transition flex items-center gap-2 cursor-pointer font-bold"
            title="Open Intelligence Controls"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CONTROLS</span>
          </button>

          {/* Export Metrics Button */}
          <button
            onClick={async () => {
              try {
                const data = await exportMetrics(filters);

                const blob = new Blob(
                  [JSON.stringify(data, null, 2)],
                  { type: 'application/json' }
                );

                const url =
                  window.URL.createObjectURL(blob);

                const a =
                  document.createElement('a');

                a.href = url;
                a.download =
                  'newsletter_metrics.json';

                a.click();

                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error(
                  'Failed to export metrics',
                  error
                );
              }
            }}
            className="px-3.5 py-2 rounded border border-border-dark bg-[#0F0D22] hover:bg-[#2A2440] text-gray-300 hover:text-white text-xs font-mono transition cursor-pointer font-bold"
          >
            EXPORT METRICS
          </button>

          {/* Backend Status */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded bg-background-obsidian border border-border-dark text-[10px] font-mono">
            {isBackendConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-accent-cyan" />
                <span className="text-accent-cyan font-bold uppercase">
                  UVICORN CONNECTED
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-orange-400 animate-pulse" />
                <span className="text-orange-400 font-bold uppercase">
                  OFFLINE FAILOVER
                </span>
              </>
            )}
          </div>

          {/* Sleek developer signature (i) trigger */}
          <button
             onClick={() => setIsInfoModalOpen(true)}
             className="p-2 rounded border border-border-dark bg-[#0F0D22]/60 hover:bg-accent-cyan/15 text-gray-400 hover:text-accent-cyan hover:border-accent-cyan/25 transition cursor-pointer"
             title="Lead Architect Signature"
          >
             <Info className="h-4 w-4" />
          </button>
        </div>
      </header>
      

      {/* Failover Alert Banner */}
      {!isBackendConnected && errorMsg && (
        <div className="bg-orange-500/10 border-b border-orange-500/25 px-6 py-2.5 flex items-center gap-2 text-xs text-orange-400">
          <AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" />
          <span className="font-mono uppercase font-bold">[FAILOVER MODE ACTIVE]</span>
          <span>{errorMsg} Check if your python FastAPI server is running on `localhost:8000`.</span>
        </div>
      )}

      {/* Main Cinematic Stage */}
      <main className="relative h-full w-full overflow-hidden">

        <div className="absolute inset-0 overflow-y-auto p-6">
      
        {/* Full-width content wrapper */}
        <div className="w-full flex flex-col gap-6">
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1 bg-surface-card border border-border-dark p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded cursor-pointer transition-all duration-200 ${
                activeTab === 'overview'
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              OVERVIEW & RETENTION
            </button>
            
            <button
              onClick={() => setActiveTab('referrals')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded cursor-pointer transition-all duration-200 ${
                activeTab === 'referrals'
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              REFERRAL FLYWHEEL
            </button>

            <button
              onClick={() => setActiveTab('monetization')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded cursor-pointer transition-all duration-200 ${
                activeTab === 'monetization'
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              MONETIZATION YIELDS
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold rounded cursor-pointer transition-all duration-200 ${
                activeTab === 'ledger'
                  ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/25'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <ListFilter className="h-3.5 w-3.5" />
              SUBSCRIBER LEDGER
            </button>

            {/* Quick-open Sidebar helper inside navigation */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-wider font-bold text-accent-cyan border border-accent-cyan/15 bg-accent-cyan/5 rounded hover:bg-accent-cyan/15 transition cursor-pointer animate-pulse"
            >
              <SlidersHorizontal className="h-3 w-3" />
              OPEN FILTERS
            </button>
          </div>

          {/* Active Tab Panel (Takes 100% Full-Screen width) */}
          <div className="flex-1 flex flex-col gap-6">
            
            {activeTab === 'overview' && (
              <>
                {/* Cohort retention table */}
                <CohortDashboard 
                  cohorts={dashboardData ? dashboardData.cohorts : []} 
                  onRowClick={() => setIsSidebarOpen(true)}
                />
                
                {/* Funnel analytics dropoffs */}
                <FunnelAnalytics 
                  funnel={dashboardData ? dashboardData.funnel : []} 
                />

                {/* Scorecard benchmarks */}
                <BenchmarkComparison 
                  benchmarks={dashboardData ? dashboardData.benchmarks : []} 
                />
              </>
            )}

            {activeTab === 'referrals' && (
              <>
                {/* Force-directed network diagram */}
                {dashboardData && (
                  <ReferralFlow 
                    data={dashboardData.referral} 
                    onNodeClick={() => setIsSidebarOpen(true)}
                  />
                )}
              </>
            )}

            {activeTab === 'monetization' && (
              <>
                {/* Line and bar combination chart */}
                {dashboardData && (
                  <MonetizationOverview data={dashboardData.monetization} />
                )}
              </>
            )}

            {activeTab === 'ledger' && (
              <>
                {/* Detailed subscribers list */}
                {subscribersData && (
                  <SubscriberTable
                    subscribers={subscribersData.subscribers}
                    totalCount={subscribersData.total_count}
                    page={ledgerPage}
                    pageSize={15}
                    onPageChange={(p) => setLedgerPage(p)}
                    onRowClick={() => setIsSidebarOpen(true)}
                  />
                )}
              </>
            )}
            
          </div>
        </div>
       </div>
     </main>

      {/* Backdrop overlay for slide-over sidebar panel */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 cursor-pointer"
        />
      )}

      {/* Slide-over Intelligence Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-[420px] max-w-full bg-[#0F0D22]/95 border-l border-accent-cyan/15 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xl overflow-hidden backdrop-blur-xl ${
          isSidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-full overflow-y-auto p-6">
       <Sidebar 
          metrics={dashboardData ? dashboardData.metrics : null}
          filters={filters}
          onFilterChange={(newFilters) => setFilters(newFilters)}
          onClose={() => setIsSidebarOpen(false)}
        />
        </div>
      </div>

      {/* Developer Signature Popover Modal */}
      {isInfoModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-[#0F0D22] border border-accent-cyan/35 glass-panel-glow p-6 rounded-lg relative transition-all duration-200">
            <button 
              onClick={() => setIsInfoModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-accent-cyan p-1.5 rounded-full border border-border-dark hover:border-accent-cyan/25 transition cursor-pointer font-bold"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-3 border-b border-[#2A2440] pb-4 mb-4">
              <div className="p-2.5 bg-accent-cyan/10 border border-accent-cyan/20 rounded">
                <Terminal className="h-5 w-5 text-accent-cyan" />
              </div>
              <div>
                <h3 className="font-display font-bold text-gray-100 text-base">Lead Architect Signature</h3>
                <p className="text-[9px] text-gray-400 font-mono tracking-widest uppercase mt-0.5">Real Rails Protocol V2</p>
              </div>
            </div>
            <div className="space-y-3.5 font-mono text-xs text-gray-300">
              <div className="flex justify-between border-b border-[#2A2440]/45 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Architect</span>
                <span className="text-gray-100 font-bold text-right">Renjusha</span>
              </div>
              <div className="flex justify-between border-b border-[#2A2440]/45 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Batch</span>
                <span className="text-gray-100 font-bold text-right">Batch 2 Interns</span>
              </div>
              <div className="flex justify-between border-b border-[#2A2440]/45 pb-2">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Stack</span>
                <span className="text-gray-100 font-bold text-right text-xs">
                  Next.js, FastAPI, Tailwind CSS, Apache ECharts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase tracking-wider text-[9px]">Project</span>
                <span className="text-accent-cyan font-bold text-right">[ID-53] Newsletter Distribution Economics</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="px-4 py-2 rounded border border-accent-cyan/20 bg-accent-cyan/10 hover:bg-accent-cyan/20 text-accent-cyan text-xs font-mono tracking-wider uppercase font-bold cursor-pointer transition-all duration-150"
              >
                Acknowledge Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer System Meta */}
      <footer className="border-t border-border-dark/50 bg-surface-card/30 px-6 py-3 flex items-center justify-between text-[10px] text-gray-500 font-mono">
        <div>REAL RAILS SYSTEM INTEL // LIBRARY POC VERSION 1.0</div>
        <div>STRICT MANIFESTO ADHERENCE // SYSTEM 53</div>
      </footer>
    </main>
  );
}
