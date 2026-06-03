'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ReferralFlywheelData } from '../types';
import {
  Network,
  RefreshCw,
  TrendingUp,
  Users,
  Share2,
  Activity
} from 'lucide-react';

interface ReferralFlowProps {
  data: ReferralFlywheelData;
  onNodeClick?: (nodeId: string) => void;
}

export default function ReferralFlow({
  data,
  onNodeClick
}: ReferralFlowProps) {

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance =
    useRef<echarts.ECharts | null>(null);

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  // Find strongest referral source
  const strongestLink =
    data.links.length > 0
      ? [...data.links].sort(
          (a, b) => b.value - a.value
        )[0]
      : null;

  // Referral health
  const referralHealth =
    data.virality_coefficient >= 1
      ? 'Self-Sustaining'
      : data.virality_coefficient >= 0.7
      ? 'Healthy'
      : 'Needs Optimization';

  // Average conversion
  const avgConversion =
    data.links.length > 0
      ? data.links.reduce(
          (sum, l) => sum + l.conversion_rate,
          0
        ) / data.links.length
      : 0;

  useEffect(() => {
    if (!mounted || !chartRef.current)
      return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const myChart = echarts.init(
      chartRef.current,
      'dark'
    );

    chartInstance.current = myChart;

    const echartsNodes: any[] =
      data.nodes.map((n) => {

        let color = '#A855F7';

        if (n.type === 'influencer')
          color = '#818CF8';

        if (n.id === 'Audience Core')
          color = '#F3F4F6';

        return {
          id: n.id,
          name: n.label,
          symbolSize: n.size * 1.25,
          value: n.size,

          itemStyle: {
            color,
            borderColor:
              'rgba(168,85,247,0.4)',
            borderWidth:
              n.id === 'Audience Core'
                ? 3
                : 1,
            shadowBlur: 10,
            shadowColor: color
          },

          label: {
            show: true,
            position: 'right' as const,
            fontSize: 10,
            color: '#E5E7EB',
            fontWeight: 'bold'
          }
        };
      });

    const echartsLinks =
      data.links.map((l) => ({
        source: l.source,
        target: l.target,

        lineStyle: {
          width: Math.max(
            1.5,
            Math.min(8, l.value / 250)
          ),
          color:
            'rgba(129,140,248,0.4)',
          curveness: 0.15
        },

        symbol: ['none', 'arrow'],
        symbolSize: [0, 8],

        tooltip: {
          formatter: `
          ${l.source} → ${l.target}
          <br/>
          Referrals:
          <b>${l.value}</b>
          <br/>
          Conversion:
          <b>${(
            l.conversion_rate * 100
          ).toFixed(1)}%</b>
          `
        }
      }));

    const option: echarts.EChartsOption =
      {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#0F0D22',
          borderColor: '#2A2440',
          borderWidth: 1,
          textStyle: {
            color: '#F3F4F6',
            fontSize: 12
          }
        },

        series: [
          {
            type: 'graph',
            layout: 'force',
            draggable: true,
            roam: true,
            animation: true,

            data: echartsNodes,
            links: echartsLinks,

            force: {
              repulsion: 220,
              gravity: 0.08,
              edgeLength: 120
            },

            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 5,
                color: '#A855F7'
              }
            }
          }
        ]
      };

    myChart.setOption(option);

    // Register node selection click listener to trigger slide-over
    myChart.on('click', (params: any) => {
      if (params.dataType === 'node') {
        if (onNodeClick) {
          onNodeClick(params.data.id);
        }
      }
    });

    const resize = () =>
      myChart.resize();

    window.addEventListener(
      'resize',
      resize
    );

    return () => {
      window.removeEventListener(
        'resize',
        resize
      );
    };

  }, [mounted, data, onNodeClick]);

  return (
    <div className="rounded-lg border border-border-dark bg-surface-card p-6 shadow-xl flex flex-col h-[650px]">

      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-100 flex items-center gap-2 tracking-tight">
            <Network className="h-5 w-5 text-accent-cyan" />
            Referral Loops Intelligence
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            Visualizes compounding subscriber
            acquisition loops and referral
            network performance.
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-5">

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
            <Share2 size={14} />
            Total Referrals
          </div>

          <div className="mt-2 text-2xl font-semibold text-accent-cyan">
            {data.total_referrals.toLocaleString()}
          </div>
        </div>

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
            <TrendingUp size={14} />
            Virality Coefficient
          </div>

          <div className="mt-2 text-2xl font-semibold text-green-400">
            {data.virality_coefficient.toFixed(2)}
          </div>
        </div>

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
            <Activity size={14} />
            Avg Conversion
          </div>

          <div className="mt-2 text-2xl font-semibold text-indigo-300">
            {(avgConversion * 100).toFixed(1)}%
          </div>
        </div>

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 uppercase">
            <Users size={14} />
            Loop Health
          </div>

          <div className="mt-2 text-lg font-semibold text-gray-200">
            {referralHealth}
          </div>
        </div>
      </div>

      {/* NETWORK GRAPH */}
      <div className="flex-1 relative min-h-[320px] rounded border border-border-dark/30 bg-background-obsidian/30">
        {!mounted ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading Referral Engine...
          </div>
        ) : (
          <div
            ref={chartRef}
            className="w-full h-full"
          />
        )}
      </div>

      {/* INSIGHTS */}
      <div className="grid md:grid-cols-2 gap-4 mt-5">

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <p className="text-xs uppercase text-accent-cyan mb-2">
            Top Referral Path
          </p>

          {strongestLink ? (
            <>
              <p className="text-sm text-gray-200">
                {strongestLink.source}
                {' → '}
                {strongestLink.target}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {
                  strongestLink.value
                } referrals •{' '}
                {(
                  strongestLink.conversion_rate *
                  100
                ).toFixed(1)}
                % conversion
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-sm">
              No referral path data
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border-dark bg-background-obsidian/40 p-4">
          <p className="text-xs uppercase text-indigo-300 mb-2">
            Referral Insight
          </p>

          <p className="text-sm text-gray-300">
            {data.insight}
          </p>
        </div>
      </div>
    </div>
  );
}
