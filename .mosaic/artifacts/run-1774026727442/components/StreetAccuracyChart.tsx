import React from 'react';

interface StreetAccuracyData {
  preflop: number;
  flop: number;
  turn: number;
  river: number;
}

interface StreetAccuracyChartProps {
  data: StreetAccuracyData;
}

const streets: { key: keyof StreetAccuracyData; label: string; icon: string }[] = [
  { key: 'preflop', label: 'Preflop', icon: '🂠' },
  { key: 'flop', label: 'Flop', icon: '🃏' },
  { key: 'turn', label: 'Turn', icon: '🂡' },
  { key: 'river', label: 'River', icon: '🂮' },
];

function getBarColor(value: number): string {
  if (value >= 80) return 'bg-green-400';
  if (value >= 60) return 'bg-yellow-400';
  if (value >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

function getTextColor(value: number): string {
  if (value >= 80) return 'text-green-400';
  if (value >= 60) return 'text-yellow-400';
  if (value >= 40) return 'text-amber-400';
  return 'text-red-400';
}

function getLabel(value: number): string {
  if (value >= 80) return 'Excellent';
  if (value >= 60) return 'Good';
  if (value >= 40) return 'Fair';
  return 'Needs Work';
}

export const StreetAccuracyChart: React.FC<StreetAccuracyChartProps> = ({ data }) => {
  const average = Math.round(
    (data.preflop + data.flop + data.turn + data.river) / 4
  );

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-600 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white text-lg font-semibold">GTO Accuracy by Street</h3>
          <p className="text-gray-500 text-sm mt-0.5">Compliance rate per betting round</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getTextColor(average)}`}>
            {average}%
          </div>
          <div className="text-gray-500 text-xs">Average</div>
        </div>
      </div>

      {/* Bars */}
      <div className="space-y-4">
        {streets.map(({ key, label, icon }) => {
          const value = Math.round(data[key] * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className="text-gray-300 text-sm font-medium">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getTextColor(value)}`}>
                    {value}%
                  </span>
                  <span className="text-gray-500 text-xs w-20 text-right">
                    {getLabel(value)}
                  </span>
                </div>
              </div>
              <div className="h-3 bg-gray-700 rounded-lg overflow-hidden">
                <div
                  className={`h-full rounded-lg transition-all duration-500 ${getBarColor(value)}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-gray-500 text-xs">≥80%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="text-gray-500 text-xs">60–79%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="text-gray-500 text-xs">40–59%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="text-gray-500 text-xs">&lt;40%</span>
        </div>
      </div>
    </div>
  );
};

export default StreetAccuracyChart;