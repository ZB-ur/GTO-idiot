import React from 'react';

export type ActionType = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'allin';

export interface ActionSummary {
  action: ActionType;
  amount?: number | null;
  displayText: string;
}

export type GTOLabel = 'gto_recommendation' | 'simplified_gto_reference';

export interface GTORecommendBadgeProps {
  action: ActionSummary;
  label: GTOLabel;
}

const actionColorMap: Record<ActionType, string> = {
  fold:  'bg-gray-50 text-gray-600 border-gray-300',
  check: 'bg-blue-50 text-blue-600 border-blue-300',
  call:  'bg-blue-50 text-blue-700 border-blue-300',
  bet:   'bg-orange-50 text-orange-700 border-orange-300',
  raise: 'bg-orange-50 text-orange-700 border-orange-300',
  allin: 'bg-red-50 text-red-700 border-red-300',
};

const labelConfig: Record<GTOLabel, { text: string; tagColor: string }> = {
  gto_recommendation:     { text: 'GTO',     tagColor: 'bg-blue-600 text-white' },
  simplified_gto_reference: { text: '简化参考', tagColor: 'bg-gray-500 text-white' },
};

export const GTORecommendBadge: React.FC<GTORecommendBadgeProps> = ({ action, label }) => {
  const colors = actionColorMap[action.action];
  const tagConfig = labelConfig[label];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1
        text-sm font-medium rounded-lg border
        ${colors}
      `}
    >
      <span
        className={`
          inline-flex items-center px-1.5 py-0.5
          text-[10px] font-bold rounded
          ${tagConfig.tagColor}
        `}
      >
        {tagConfig.text}
      </span>
      <span>{action.displayText}</span>
    </span>
  );
};

export default GTORecommendBadge;