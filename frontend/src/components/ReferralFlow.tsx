'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ReferralFlywheelData } from '../types';
import { Network, RefreshCw } from 'lucide-react';

interface ReferralFlowProps {
  data: ReferralFlywheelData;
}

export default function ReferralFlow({ data }: ReferralFlowProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (!mounted || !chartRef.current) return;

    // Dispose old chart instance
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const myChart = echarts.init(chartRef.current, 'dark');
    chartInstance.current = myChart;

    // Convert nodes and links into ECharts series data
    const echartsNodes = data.nodes.map(n => {
      // Style base on node type
      let color = '#38BDF8'; // Electric Cyan
      if (n.type === 'influencer') color = '#818CF8'; // Indigo
      if (n.id === 'Audience Core') color = '#F3F4F6'; // Whiteish
      
      return {
        id: n.id,
        name: n.label,
        symbolSize: n.size * 1.2,
        value: n.size,
        itemStyle: {
          color: color,
          borderColor: 'rgba(56, 189, 248, 0.4)',
          borderWidth: n.id === 'Audience Core' ? 3 : 1,
          shadowBlur: 10,
          shadowColor: color
        },
        label: {
          show: true,
          position: 'right' as const,
          fontSize: 10,
          fontFamily: 'Inter',
          color: '#E5E7EB',
          fontWeight: 'bold' as const
        }
      };
    });

    const echartsLinks = data.links.map(l => {
      return {
        source: l.source,
        target: l.target,
        lineStyle: {
          width: Math.max(1.5, Math.min(8, l.value / 250)),
          color: 'rgba(129, 140, 248, 0.4)',
          curveness: 0.15
        },
        symbol: ['none', 'arrow'],
        symbolSize: [0, 8],
        label: {
          show: false
        },
        tooltip: {
          formatter: `${l.source} → ${l.target}<br/>Conversions: <b>${l.value}</b><br/>Conv. Rate: <b>${(l.conversion_rate * 100).toFixed(1)}%</b>`
        }
      };
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0B1117',
        borderColor: '#1F2937',
        borderWidth: 1,
        textStyle: {
          color: '#F3F4F6',
          fontFamily: 'Inter',
          fontSize: 12
        }
      },
      legend: {
        show: false
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          animation: true,
          draggable: true,
          data: echartsNodes,
          links: echartsLinks,
          force: {
            repulsion: 220,
            gravity: 0.08,
            edgeLength: 120,
            layoutAnimation: true
          },
          roam: true,
          lineStyle: {
            color: 'source',
            opacity: 0.6,
            curveness: 0.1
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 5,
              color: '#38BDF8'
            }
          }
        }
      ]
    };

    myChart.setOption(option);

    const handleResize = () => {
      myChart.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted, data]);

  return (
    <div className="rounded-lg border border-border-dark bg-surface-card p-6 shadow-xl flex flex-col h-[400px]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-100 flex items-center gap-2 tracking-tight">
            <Network className="h-5 w-5 text-accent-cyan" />
            Referral Flywheel & Growth Intelligence
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Visualizes input sources and compounding loop channels feeding subscribers into the core audience base.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-background-obsidian/60 px-3 py-1.5 rounded border border-border-dark">
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase font-mono">Virality Factor (K)</div>
            <div className="text-sm font-bold text-accent-cyan font-mono">K = {data.virality_coefficient.toFixed(3)}</div>
          </div>
          <div className="h-6 w-px bg-border-dark" />
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase font-mono">Total Referrals</div>
            <div className="text-sm font-bold text-accent-indigo font-mono">{data.total_referrals.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-0 bg-background-obsidian/30 rounded border border-border-dark/30">
        {!mounted ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs font-mono">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Initializing Force-Directed Graph Engine...
          </div>
        ) : (
          <div ref={chartRef} className="w-full h-full" />
        )}
      </div>

      <div className="mt-4 p-3 bg-background-obsidian/45 rounded border border-border-dark/45 text-xs text-gray-300">
        <span className="text-accent-indigo font-semibold font-mono">[Insight] </span>
        <span>{data.insight}</span>
      </div>
    </div>
  );
}
