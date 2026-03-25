import React from 'react';

interface RangeViewToggleProps {
  view: 'opening' | 'vs_raise';
  onChange: (view: 'opening' | 'vs_raise') => void;
}

const RangeViewToggle: React.FC<RangeViewToggleProps> = ({ view, onChange }) => {
  const options: { value: 'opening' | 'vs_raise'; label: string }[] = [
    { value: 'opening', label: 'Opening Ranges' },
    { value: 'vs_raise', label: 'Vs Raise' },
  ];

  return (
    <div className="inline-flex rounded-xl bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
            view === option.value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default RangeViewToggle;