import React from 'react';

interface WeaknessItem {
  weaknessId: string;
  scenario: string;
  compliance: number;
  suggestion: string;
  relatedHandCount?: number;
}

interface WeaknessRankingProps {
  items: WeaknessItem[];
  onItemClick?: (weaknessId: string) => void;
}

export const WeaknessRanking: React.FC<WeaknessRankingProps> = ({
  items,
  onItemClick,
}) => {
  const getComplianceColor = (v: number) =>
    v >= 60 ? 'text-amber-500' : 'text-red-500';

  const getComplianceBg = (v: number) =>
    v >= 60 ? 'bg-amber-50' : 'bg-red-50';

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <button
          key={item.weaknessId}
          onClick={() => onItemClick?.(item.weaknessId)}
          className={`w-full text-left flex items-start gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors`}
        >
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{item.scenario}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.suggestion}</p>
            {item.relatedHandCount !== undefined && (
              <p className="text-xs text-gray-400 mt-1">{item.relatedHandCount} related hands</p>
            )}
          </div>
          <div
            className={`flex-shrink-0 px-2 py-1 rounded-lg ${getComplianceBg(item.compliance)}`}
          >
            <span className={`text-sm font-bold ${getComplianceColor(item.compliance)}`}>
              {item.compliance}%
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};