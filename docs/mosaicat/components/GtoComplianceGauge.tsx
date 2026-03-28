import React from 'react';

interface GtoComplianceGaugeProps {
  rate: number; // 0-1
  label?: string;
}

const getGaugeColor = (rate: number): string => {
  if (rate >= 0.8) return 'bg-green-500';
  if (rate >= 0.5) return 'bg-amber-500';
  return 'bg-red-500';
};

const getGaugeTextColor = (rate: number): string => {
  if (rate >= 0.8) return 'text-green-600';
  if (rate >= 0.5) return 'text-amber-600';
  return 'text-red-600';
};

export const GtoComplianceGauge: React.FC<GtoComplianceGaugeProps> = ({
  rate,
  label = 'GTO 符合率',
}) => {
  const percentage = Math.round(rate * 100);
  const barColor = getGaugeColor(rate);
  const textColor = getGaugeTextColor(rate);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`text-2xl font-bold ${textColor}`}>{percentage}%</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">0%</span>
        <span className="text-xs text-gray-400">100%</span>
      </div>
    </div>
  );
};

export default GtoComplianceGauge;