'use client';

interface HistorySummary {
  totalHands: number;
  winRate: number;
  totalProfit: number;
}

interface HistorySummaryBarProps {
  summary: HistorySummary;
}

function StatItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-3">
      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className={`text-lg font-bold tabular-nums mt-0.5 ${valueClassName ?? 'text-gray-100'}`}>
        {value}
      </span>
    </div>
  );
}

export function HistorySummaryBar({ summary }: HistorySummaryBarProps) {
  const profitSign = summary.totalProfit >= 0 ? '+' : '';
  const profitText = `${profitSign}${summary.totalProfit.toFixed(0)} BB`;
  const profitClass =
    summary.totalProfit > 0
      ? 'text-emerald-400'
      : summary.totalProfit < 0
        ? 'text-red-400'
        : 'text-gray-400';

  const winRateClass =
    summary.winRate >= 55
      ? 'text-emerald-400'
      : summary.winRate >= 45
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className="flex items-center justify-around rounded-xl border border-gray-700/60 bg-[#1e293b] divide-x divide-gray-700/60">
      <StatItem label="Hands" value={summary.totalHands.toLocaleString()} />
      <StatItem
        label="Win Rate"
        value={`${summary.winRate.toFixed(1)}%`}
        valueClassName={winRateClass}
      />
      <StatItem
        label="Profit"
        value={profitText}
        valueClassName={profitClass}
      />
    </div>
  );
}