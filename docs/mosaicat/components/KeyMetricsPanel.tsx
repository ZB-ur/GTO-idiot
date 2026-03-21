import React from 'react';

interface KeyMetricsPanelProps {
  metrics: {
    vpip: number;
    pfr: number;
    threeBet: number;
    wtsd: number;
    wonAtShowdown: number;
    aggressionFactor: number;
    cbetFlop?: number;
    foldToCbet?: number;
  };
}

interface MetricCardProps {
  label: string;
  value: number;
  format?: 'percent' | 'factor';
  description: string;
  optimalRange?: [number, number];
}

function getDeviationColor(value: number, optimalRange?: [number, number]): string {
  if (!optimalRange) return 'text-gray-50';
  const [low, high] = optimalRange;
  if (value >= low && value <= high) return 'text-emerald-400';
  const diff = value < low ? low - value : value - high;
  const range = high - low;
  if (diff <= range * 0.5) return 'text-yellow-400';
  return 'text-red-400';
}

function getDeviationDot(value: number, optimalRange?: [number, number]): string {
  if (!optimalRange) return 'bg-gray-500';
  const [low, high] = optimalRange;
  if (value >= low && value <= high) return 'bg-emerald-500';
  const diff = value < low ? low - value : value - high;
  const range = high - low;
  if (diff <= range * 0.5) return 'bg-yellow-500';
  return 'bg-red-500';
}

function formatValue(value: number, format: 'percent' | 'factor' = 'percent'): string {
  if (format === 'factor') return value.toFixed(2);
  return `${value.toFixed(1)}%`;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  format = 'percent',
  description,
  optimalRange,
}) => {
  const valueColor = getDeviationColor(value, optimalRange);
  const dotColor = getDeviationDot(value, optimalRange);

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col gap-2 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          {label}
        </span>
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      </div>
      <div className={`text-3xl font-bold ${valueColor} tabular-nums`}>
        {formatValue(value, format)}
      </div>
      <div className="text-xs text-gray-500 leading-relaxed">{description}</div>
      {optimalRange && (
        <div className="text-xs text-gray-600 mt-auto pt-1 border-t border-gray-700/50">
          GTO Range: {optimalRange[0]}–{optimalRange[1]}
          {format === 'percent' ? '%' : ''}
        </div>
      )}
    </div>
  );
};

const KeyMetricsPanel: React.FC<KeyMetricsPanelProps> = ({ metrics }) => {
  const primaryMetrics: MetricCardProps[] = [
    {
      label: 'VPIP',
      value: metrics.vpip,
      description: '主动入池率 — 翻前主动投入筹码的频率',
      optimalRange: [22, 28],
    },
    {
      label: 'PFR',
      value: metrics.pfr,
      description: '翻前加注率 — 翻前主动加注的频率',
      optimalRange: [17, 23],
    },
    {
      label: '3-Bet',
      value: metrics.threeBet,
      description: '3-Bet频率 — 面对加注时再加注的频率',
      optimalRange: [7, 10],
    },
    {
      label: 'WTSD',
      value: metrics.wtsd,
      description: '看到摊牌率 — 入池后看到摊牌的频率',
      optimalRange: [25, 32],
    },
    {
      label: 'W$SD',
      value: metrics.wonAtShowdown,
      description: '摊牌胜率 — 到摊牌时赢下底池的频率',
      optimalRange: [50, 56],
    },
    {
      label: 'AF',
      value: metrics.aggressionFactor,
      format: 'factor',
      description: '攻击因子 — (下注+加注) / 跟注的比值',
      optimalRange: [2.5, 3.5],
    },
  ];

  const secondaryMetrics: MetricCardProps[] = [];
  if (metrics.cbetFlop !== undefined) {
    secondaryMetrics.push({
      label: 'C-Bet Flop',
      value: metrics.cbetFlop,
      description: '翻牌持续下注率',
      optimalRange: [55, 70],
    });
  }
  if (metrics.foldToCbet !== undefined) {
    secondaryMetrics.push({
      label: 'Fold to C-Bet',
      value: metrics.foldToCbet,
      description: '面对持续下注弃牌率',
      optimalRange: [40, 55],
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-50">关键指标</h2>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            GTO范围内
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            轻微偏差
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            明显偏差
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {primaryMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* Secondary Metrics */}
      {secondaryMetrics.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {secondaryMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      )}
    </div>
  );
};

export default KeyMetricsPanel;