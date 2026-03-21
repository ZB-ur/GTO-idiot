import React from 'react';

interface StreetStat {
  street: string;
  decisionCount: number;
  totalEvLossBB: number;
  avgEvLossPerDecisionBB: number;
}

interface StreetEVChartProps {
  streets: StreetStat[];
  onStreetClick?: (street: string) => void;
  className?: string;
}

const streetLabels: Record<string, string> = {
  preflop: 'Preflop',
  flop: 'Flop',
  turn: 'Turn',
  river: 'River',
};

const streetColors: Record<string, { bar: string; bg: string }> = {
  preflop: { bar: 'bg-blue-500', bg: 'bg-blue-50' },
  flop: { bar: 'bg-emerald-500', bg: 'bg-emerald-50' },
  turn: { bar: 'bg-amber-500', bg: 'bg-amber-50' },
  river: { bar: 'bg-red-500', bg: 'bg-red-50' },
};

export const StreetEVChart: React.FC<StreetEVChartProps> = ({
  streets,
  onStreetClick,
  className = '',
}) => {
  const maxLoss = Math.max(...streets.map((s) => Math.abs(s.totalEvLossBB)), 1);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">EV Loss by Street</h3>

      <div className="space-y-4">
        {streets.map((street) => {
          const colors = streetColors[street.street] ?? { bar: 'bg-gray-500', bg: 'bg-gray-50' };
          const barWidth = (Math.abs(street.totalEvLossBB) / maxLoss) * 100;

          return (
            <div
              key={street.street}
              onClick={() => onStreetClick?.(street.street)}
              className={`${onStreetClick ? 'cursor-pointer hover:bg-gray-50' : ''} rounded-lg p-3 transition-colors`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  {streetLabels[street.street] ?? street.street}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 font-medium">{street.decisionCount} decisions</span>
                  <span className="text-sm font-bold text-red-500">{street.totalEvLossBB.toFixed(1)} BB</span>
                </div>
              </div>
              <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 ${colors.bar} rounded-lg transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max(barWidth, 4)}%` }}
                >
                  {barWidth > 20 && (
                    <span className="text-[10px] font-bold text-white">
                      avg {street.avgEvLossPerDecisionBB.toFixed(2)} BB
                    </span>
                  )}
                </div>
              </div>
              {barWidth <= 20 && (
                <div className="mt-1 text-[10px] text-gray-400 font-medium">
                  avg {street.avgEvLossPerDecisionBB.toFixed(2)} BB/decision
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreetEVChart;