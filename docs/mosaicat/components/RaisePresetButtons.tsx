import React from 'react';

interface RaisePreset {
  label: string;
  amount: number;
}

interface RaisePresetButtonsProps {
  presets: RaisePreset[];
  onSelect: (amount: number) => void;
  activeAmount?: number;
  className?: string;
}

export const RaisePresetButtons: React.FC<RaisePresetButtonsProps> = ({
  presets,
  onSelect,
  activeAmount,
  className = '',
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {presets.map((preset) => {
        const isActive = activeAmount !== undefined && Math.abs(activeAmount - preset.amount) < 0.01;

        return (
          <button
            key={preset.label}
            onClick={() => onSelect(preset.amount)}
            className={`
              flex-1 px-3 py-2 text-xs font-semibold rounded-lg
              border transition-all duration-150
              ${isActive
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-800 border-gray-700 text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10'
              }
            `}
          >
            <span className="block">{preset.label}</span>
            <span className="block text-[10px] font-normal opacity-70 mt-0.5">
              {preset.amount % 1 === 0 ? preset.amount : preset.amount.toFixed(1)} BB
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default RaisePresetButtons;