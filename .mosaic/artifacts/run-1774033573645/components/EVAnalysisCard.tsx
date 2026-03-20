import React from 'react';

interface EVAnalysisCardProps {
  playerEV: number;
  gtoOptimalEV: number;
  evLoss: number;
}

const EVAnalysisCard: React.FC<EVAnalysisCardProps> = ({
  playerEV,
  gtoOptimalEV,
  evLoss,
}) => {
  const formatEV = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)} BB`;
  };

  const getLossSeverity = (loss: number): 'none' | 'minor' | 'major' => {
    if (loss <= 0.05) return 'none';
    if (loss <= 0.5) return 'minor';
    return 'major';
  };

  const severity = getLossSeverity(evLoss);

  const severityConfig = {
    none: {
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Optimal',
      icon: '✓',
    },
    minor: {
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Minor Loss',
      icon: '⚠',
    },
    major: {
      color: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Major Loss',
      icon: '✗',
    },
  };

  const config = severityConfig[severity];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
          EV Analysis
        </h3>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border ${config.bg} ${config.color} ${config.border}`}
        >
          <span>{config.icon}</span>
          {config.label}
        </span>
      </div>

      {/* EV Values Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Player EV */}
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Your EV</div>
          <div
            className={`text-lg font-bold ${playerEV >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {formatEV(playerEV)}
          </div>
        </div>

        {/* GTO Optimal EV */}
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">GTO Optimal</div>
          <div
            className={`text-lg font-bold ${gtoOptimalEV >= 0 ? 'text-emerald-600' : 'text-red-500'}`}
          >
            {formatEV(gtoOptimalEV)}
          </div>
        </div>

        {/* EV Loss */}
        <div
          className={`rounded-lg p-3 text-center ${config.bg}`}
        >
          <div className="text-xs text-gray-500 mb-1">EV Loss</div>
          <div className={`text-lg font-bold ${config.color}`}>
            {evLoss <= 0.05 ? '0.00 BB' : `-${evLoss.toFixed(2)} BB`}
          </div>
        </div>
      </div>

      {/* Visual Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
          <span>EV Comparison</span>
        </div>
        <div className="relative h-6 bg-slate-100 rounded-lg overflow-hidden">
          {/* GTO bar (full width = GTO optimal) */}
          <div
            className="absolute inset-y-0 left-0 bg-blue-100 rounded-lg"
            style={{ width: '100%' }}
          />
          {/* Player bar (proportional to player EV vs GTO) */}
          <div
            className={`absolute inset-y-0 left-0 rounded-lg transition-all ${
              severity === 'none'
                ? 'bg-emerald-400'
                : severity === 'minor'
                  ? 'bg-amber-400'
                  : 'bg-red-400'
            }`}
            style={{
              width:
                gtoOptimalEV > 0
                  ? `${Math.max(0, Math.min(100, (playerEV / gtoOptimalEV) * 100))}%`
                  : '100%',
            }}
          />
          {/* Labels on bar */}
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className="text-xs font-medium text-white drop-shadow-sm">
              You
            </span>
            <span className="text-xs font-medium text-blue-600">
              GTO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EVAnalysisCard;