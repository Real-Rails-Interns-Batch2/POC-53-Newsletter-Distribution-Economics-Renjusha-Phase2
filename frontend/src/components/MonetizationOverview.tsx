'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { MonetizationResponse } from '../types';
import { Landmark, TrendingUp, HelpCircle } from 'lucide-react';

interface MonetizationOverviewProps {
  data: MonetizationResponse;
}

export default function MonetizationOverview({ data }: MonetizationOverviewProps) {
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
    if (!mounted || !chartRef.current || !data.history) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const myChart = echarts.init(chartRef.current, 'dark');
    chartInstance.current = myChart;

    const months = data.history.map(item => item.month);
    const sponRev = data.history.map(item => item.sponsorship_revenue);
    const premRev = data.history.map(item => item.premium_subscription_revenue);
    const revPerSub = data.history.map(item => item.revenue_per_subscriber);
    
    const actualRevenue = data.history.map(
      (item) => item.total_revenue
    );

     const forecastMonths =
       data.forecast?.map(
       (item) => item.month
       ) || [];

     const forecastRevenue =
       data.forecast?.map(
         (item) => item.projected_revenue
       ) || [];

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#4B5563'
          }
        },
        backgroundColor: '#0F0D22',
        borderColor: '#2A2440',
        borderWidth: 1,
        textStyle: {
          color: '#F3F4F6',
          fontFamily: 'Inter',
          fontSize: 12
        }
      },
      legend: {
        data: ['Sponsorship Revenue', 'Premium Subscriptions', 'Monthly ARPU'],
        textStyle: {
          color: '#9CA3AF',
          fontFamily: 'Inter',
          fontSize: 11
        },
        bottom: 0
      },
      grid: {
        top: '12%',
        left: '4%',
        right: '4%',
        bottom: '12%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: months,
          axisPointer: {
            type: 'shadow'
          },
          axisLine: {
            lineStyle: {
              color: '#1F2937'
            }
          },
          axisLabel: {
            color: '#9CA3AF',
            fontFamily: 'Inter',
            fontSize: 10
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Revenue ($)',
          nameTextStyle: {
            color: '#9CA3AF',
            fontFamily: 'Inter',
            fontSize: 10
          },
          splitLine: {
            lineStyle: {
              color: '#1F2937',
              type: 'dashed'
            }
          },
          axisLabel: {
            formatter: '${value}',
            color: '#9CA3AF',
            fontFamily: 'Inter',
            fontSize: 10
          }
        },
        {
          type: 'value',
          name: 'ARPU / Subscriber',
          nameTextStyle: {
            color: '#9CA3AF',
            fontFamily: 'Inter',
            fontSize: 10
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            formatter: '${value}',
            color: '#9CA3AF',
            fontFamily: 'Inter',
            fontSize: 10
          }
        }
      ],
      series: [
        {
          name: 'Sponsorship Revenue',
          type: 'bar',
          stack: 'revenue',
          barWidth: '55%',
          data: sponRev,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#A855F7' },
              { offset: 1, color: 'rgba(168, 85, 247, 0.4)' }
            ])
          }
        },
        {
          name: 'Premium Subscriptions',
          type: 'bar',
          stack: 'revenue',
          data: premRev,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#818CF8' },
              { offset: 1, color: 'rgba(129, 140, 248, 0.4)' }
            ])
          }
        },
        {
          name: 'Monthly ARPU',
          type: 'line',
          yAxisIndex: 1,
          data: revPerSub,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            color: '#F3F4F6',
            width: 2.5,
            shadowColor: 'rgba(255, 255, 255, 0.3)',
            shadowBlur: 8
          },
          itemStyle: {
            color: '#F3F4F6'
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
            <Landmark className="h-5 w-5 text-accent-cyan" />
            Monetization Dynamics & Sponsorship Yield
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Tracks recurring premium membership fees and sponsorship deals against average revenue per subscriber.
          </p>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-0">
        {!mounted ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs font-mono">
            Initializing Monetization Charts...
          </div>
        ) : (
          <div ref={chartRef} className="w-full h-full" />
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-2.5 bg-background-obsidian/50 rounded border border-border-dark/60">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-accent-cyan" />
            Sponsorship Yield
          </div>
          <p className="text-xs text-gray-200 font-sans mt-1 leading-tight">{data.sponsorship_yield_insight}</p>
        </div>
        <div className="p-2.5 bg-background-obsidian/50 rounded border border-border-dark/60">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-accent-indigo" />
            Premium Baseline
          </div>
          <p className="text-xs text-gray-200 font-sans mt-1 leading-tight">{data.premium_growth_insight}</p>
        </div>
        <div className="p-2.5 bg-background-obsidian/50 rounded border border-border-dark/60">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-mono flex items-center gap-1">
            <HelpCircle className="h-3 w-3 text-white" />
            Overall Revenue
          </div>
          <p className="text-xs text-gray-200 font-sans mt-1 leading-tight">{data.overall_rev_insight}</p>
        </div>
      </div>
    </div>
  );
}
