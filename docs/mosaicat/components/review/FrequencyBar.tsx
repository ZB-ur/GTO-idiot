import React from 'react';

interface ActionFrequency {
  type: string;
  frequency: number;
  color: string;
}

interface FrequencyBarProps {
  actions: ActionFrequency[];
}

const FrequencyBar: React.FC<FrequencyBarProps> = ({ actions }) => {
  const total = actions.reduce((sum, a) => sum + a.frequency, 0);

  return (
    <div className="w-full">
      <div className="flex h-8 rounded-lg overflow-hidden border border-gray-200">
        {actions.map((action, index) => {
          const widthPercent = total > 0 ? (action.frequency / total) * 100 : 0;
          if (widthPercent === 0) return null;
          return (
            <div
              key={index}
              className={`relative flex items-center justify-center text-xs font-semibold text-white transition-all duration-300 ${action.color}`}
              style={{ width: `${widthPercent}%` }}
              title={`${action.type}: ${action.frequency.toFixed(1)}%`}
            >
              {widthPercent >= 12 && (
                <span className="truncate px-1">
                  {action.type} {action.frequency.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-2">
        {actions.map((action, index) => (
          <div key={index} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className={`inline-block w-2.5 h-2.5 rounded-sm ${action.color}`} />
            <span>{action.type}</span>
            <span className="font-medium text-gray-900">{action.frequency.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FrequencyBar;