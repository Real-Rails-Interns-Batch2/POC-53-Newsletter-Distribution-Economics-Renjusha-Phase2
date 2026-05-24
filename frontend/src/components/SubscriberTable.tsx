'use client';

import React from 'react';
import { SubscriberRecord } from '../types';
import { Users, ChevronLeft, ChevronRight, UserCheck, UserX } from 'lucide-react';

interface SubscriberTableProps {
  subscribers: SubscriberRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
}

export default function SubscriberTable({
  subscribers,
  totalCount,
  page,
  pageSize,
  onPageChange
}: SubscriberTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  const formatPercent = (val: number) => {
    return `${(val * 100).toFixed(0)}%`;
  };

  return (
    <div className="rounded-lg border border-border-dark bg-surface-card p-6 shadow-xl flex flex-col">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-100 flex items-center gap-2 tracking-tight">
            <Users className="h-5 w-5 text-accent-cyan" />
            Subscriber Segmentation Ledger
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Browse and inspect individual reader records, acquisition cohorts, deliverability rates, and monetization yields.
          </p>
        </div>

        <div className="bg-background-obsidian/60 border border-border-dark px-3 py-1.5 rounded text-xs text-gray-300 font-mono self-start sm:self-auto">
          Records Found: <span className="text-accent-cyan font-bold">{totalCount.toLocaleString()}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-dark bg-background-obsidian/50 text-[10px] uppercase tracking-wider text-gray-400 font-mono">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Source</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-center">Month</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Tier</th>
              <th className="py-3 px-3 text-right">Open Rate</th>
              <th className="py-3 px-3 text-right">Click Rate</th>
              <th className="py-3 px-3 text-right">Deliv.</th>
              <th className="py-3 px-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dark/30 text-gray-300 font-mono">
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-gray-500">
                  No matching subscribers found for current filter settings.
                </td>
              </tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.subscriber_id} className="hover:bg-background-obsidian/40 transition-colors">
                  <td className="py-2.5 px-4 text-gray-400 text-[10px] font-semibold">{sub.subscriber_id}</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-200">{sub.email}</td>
                  <td className="py-2.5 px-3 text-gray-400 text-[10px] uppercase tracking-tight">{sub.acquisition_source}</td>
                  <td className="py-2.5 px-3 text-gray-400">{sub.category}</td>
                  <td className="py-2.5 px-3 text-center text-gray-400">{sub.signup_month}</td>
                  
                  {/* Status */}
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      sub.status === 'active' 
                        ? 'bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/20' 
                        : 'bg-red-500/10 text-red-400 border border-red-500/15'
                    }`}>
                      {sub.status === 'active' ? (
                        <UserCheck className="h-3 w-3" />
                      ) : (
                        <UserX className="h-3 w-3" />
                      )}
                      {sub.status}
                    </span>
                  </td>

                  {/* Tier */}
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      sub.tier === 'premium'
                        ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/25'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {sub.tier}
                    </span>
                  </td>
                  
                  <td className="py-2.5 px-3 text-right text-gray-200 font-bold">{formatPercent(sub.open_rate)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-400">{formatPercent(sub.click_rate)}</td>
                  <td className="py-2.5 px-3 text-right text-gray-400">{formatPercent(sub.deliverability_score)}</td>
                  
                  {/* Revenue */}
                  <td className={`py-2.5 px-3 text-right font-bold ${
                    sub.premium_subscription_revenue > 0 ? 'text-accent-cyan' : 'text-gray-500'
                  }`}>
                    ${sub.premium_subscription_revenue.toFixed(0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 border-t border-border-dark/30 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-gray-400 font-mono">
            Page <span className="text-gray-200 font-bold">{page}</span> of <span className="text-gray-200 font-bold">{totalPages}</span> (Showing {subscribers.length} rows)
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-background-obsidian border border-border-dark text-xs text-gray-300 hover:text-accent-cyan hover:border-accent-cyan/40 disabled:opacity-40 disabled:hover:text-gray-300 disabled:hover:border-border-dark transition-all duration-150 font-mono cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              PREV
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-background-obsidian border border-border-dark text-xs text-gray-300 hover:text-accent-cyan hover:border-accent-cyan/40 disabled:opacity-40 disabled:hover:text-gray-300 disabled:hover:border-border-dark transition-all duration-150 font-mono cursor-pointer"
            >
              NEXT
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
