import React from 'react';

interface PositionStats {
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  handsPlayed: number;
  deviationRate: number; // 0-1
  profitLoss: number;
  deviationCount?: number;
  correctCount?: number;
}

interface PositionBreakdownTableProps {
  positions: PositionStats[];
}

const formatProfitLoss = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString()}`;
};

const getDeviationColor = (rate: number): string => {
  if (rate <= 0.2) return 'text-green-600';
  if (rate <= 0.4) return 'text-amber-600';
  return 'text-red-600';
};

const getProfitLossColor = (value: number): string => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const PositionBreakdownTable: React.FC<PositionBreakdownTableProps> = ({
  positions,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">位置统计</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                位置
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                手牌数
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                偏离率
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                盈亏
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {positions.map((pos) => (
              <tr key={pos.position} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3">
                  <span className="inline-flex items-center justify-center w-10 h-6 text-xs font-bold text-blue-600 bg-blue-50 rounded">
                    {pos.position}
                  </span>
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">
                  {pos.handsPlayed}
                </td>
                <td className={`px-6 py-3 text-right text-sm font-medium ${getDeviationColor(pos.deviationRate)}`}>
                  {Math.round(pos.deviationRate * 100)}%
                </td>
                <td className={`px-6 py-3 text-right text-sm font-medium ${getProfitLossColor(pos.profitLoss)}`}>
                  {formatProfitLoss(pos.profitLoss)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PositionBreakdownTable;