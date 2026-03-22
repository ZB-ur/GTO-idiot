import React from 'react';

interface StackSizeSliderProps {
  value: number;
  onChange: (bb: number) => void;
}

export const StackSizeSlider: React.FC<StackSizeSliderProps> = ({
  value,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    const stepped = Math.round(raw / 10) * 10;
    onChange(stepped);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-900">Starting Stack</label>
        <span className="text-sm font-bold text-blue-600">{value} BB</span>
      </div>
      <input
        type="range"
        min={50}
        max={200}
        step={10}
        value={value}
        onChange={handleChange}
        className="w-full h-2 rounded-full appearance-none bg-gray-200 accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>50 BB</span>
        <span>100 BB</span>
        <span>200 BB</span>
      </div>
    </div>
  );
};