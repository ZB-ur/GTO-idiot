import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorAccent?: string;
}

function KPICard({ label, value, subtitle, icon, trend, trendValue, colorAccent = 'emerald' }: KPICardProps) {
  const trendColors = {
    up: 'text-green-400',
    down: 'text-red-400',
    neutral: 'text-gray-400',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-600 p-5 flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg bg-${colorAccent}-600/20 flex items-center justify-center text-${colorAccent}-400`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {subtitle && <span className="text-sm text-gray-500 mb-1">{subtitle}</span>}
      </div>
      {trend && trendValue && (
        <div className={`flex items-center gap-1 text-sm ${trendColors[trend]}`}>
          <span>{trendIcons[trend]}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}

export interface KPICardGroupProps {
  totalHands: number;
  gtoCompliance: number;
  totalEVLoss: number;
}

export default function KPICardGroup({ totalHands, gtoCompliance, totalEVLoss }: KPICardGroupProps) {
  const compliancePercent = Math.round(gtoCompliance * 100);

  const complianceColor = compliancePercent >= 70 ? 'green' : compliancePercent >= 50 ? 'yellow' : 'red';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KPICard
        label="总手数"
        value={totalHands.toLocaleString()}
        subtitle="hands"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h4l3-7 4 14 3-7h4" />
          </svg>
        }
        colorAccent="emerald"
      />
      <KPICard
        label="GTO 符合率"
        value={`${compliancePercent}%`}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        colorAccent={complianceColor === 'green' ? 'emerald' : complianceColor === 'yellow' ? 'amber' : 'red'}
        trend={compliancePercent >= 70 ? 'up' : compliancePercent >= 50 ? 'neutral' : 'down'}
        trendValue={compliancePercent >= 70 ? '良好' : compliancePercent >= 50 ? '一般' : '需改进'}
      />
      <KPICard
        label="累计 EV 损失"
        value={totalEVLoss.toFixed(1)}
        subtitle="BB"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        }
        colorAccent="red"
        trend={totalEVLoss > 20 ? 'down' : totalEVLoss > 10 ? 'neutral' : 'up'}
        trendValue={totalEVLoss > 20 ? '偏高' : totalEVLoss > 10 ? '中等' : '优秀'}
      />
    </div>
  );
}