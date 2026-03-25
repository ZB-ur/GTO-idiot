import React from 'react';

interface StackSizeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const stackSizes = [
  { value: '100bb', label: '100 BB' },
  { value: '200bb', label: '200 BB' },
];

const StackSizeSelector: React.FC<StackSizeSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">Starting Stack</label>
      <div className="flex gap-2">
        {stackSizes.map((size) => (
          <button
            key={size.value}
            onClick={() => onChange(size.value)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
              value === size.value
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-900 hover:border-blue-400'
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StackSizeSelector;