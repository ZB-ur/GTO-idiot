import React from 'react';

export type HandStrengthTier = 'nuts' | 'strong' | 'medium' | 'weak' | 'air';

const TIERS: { value: HandStrengthTier; label: string; color: string; selectedColor: string }[] = [
  { value: 'nuts', label: '坚果', color: 'border-green-300 text-green-700 bg-green-50', selectedColor: 'bg-green-500 text-white border-green-500' },
  { value: 'strong', label: '强牌', color: 'border-blue-300 text-blue-700 bg-blue-50', selectedColor: 'bg-blue-600 text-white border-blue-600' },
  { value: 'medium', label: '中等', color: 'border-yellow-300 text-yellow-700 bg-yellow-50', selectedColor: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 'weak', label: '弱牌', color: 'border-orange-300 text-orange-700 bg-orange-50', selectedColor: 'bg-orange-500 text-white border-orange-500' },
  { value: 'air', label: '空气', color: 'border-gray-300 text-gray-600 bg-gray-50', selectedColor: 'bg-gray-500 text-white border-gray-500' },
];

interface HandStrengthSelectorProps {
  selected: HandStrengthTier;
  onChange: (tier: HandStrengthTier) => void;
}

export const HandStrengthSelector: React.FC<HandStrengthSelectorProps> = ({
  selected,
  onChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-600">
        手牌强度
      </label>
      <div className="inline-flex gap-2">
        {TIERS.map((tier) => (
          <button
            key={tier.value}
            onClick={() => onChange(tier.value)}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-150 shadow-sm
              ${selected === tier.value ? tier.selectedColor : tier.color}
            `}
          >
            {tier.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HandStrengthSelector;