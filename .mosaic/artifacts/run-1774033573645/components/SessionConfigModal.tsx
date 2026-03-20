import React, { useState, useCallback } from 'react';

interface SessionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (stackDepthBB: number) => void;
}

const PRESET_STACKS = [
  { label: '20 BB', value: 20, description: 'Short Stack' },
  { label: '50 BB', value: 50, description: 'Mid Stack' },
  { label: '100 BB', value: 100, description: 'Deep Stack' },
  { label: '200 BB', value: 200, description: 'Ultra Deep' },
];

export const SessionConfigModal: React.FC<SessionConfigModalProps> = ({
  isOpen,
  onClose,
  onStart,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(100);
  const [customValue, setCustomValue] = useState<string>('');
  const [useCustom, setUseCustom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effectiveStack = useCustom ? Number(customValue) : selectedPreset;

  const handlePresetSelect = useCallback((value: number) => {
    setSelectedPreset(value);
    setUseCustom(false);
    setCustomValue('');
    setError(null);
  }, []);

  const handleCustomChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    setUseCustom(true);
    setSelectedPreset(null);

    const num = Number(val);
    if (val && (isNaN(num) || num < 20 || num > 500 || !Number.isInteger(num))) {
      setError('Please enter a whole number between 20 and 500');
    } else {
      setError(null);
    }
  }, []);

  const handleStart = useCallback(() => {
    if (effectiveStack && effectiveStack >= 20 && effectiveStack <= 500) {
      onStart(effectiveStack);
    }
  }, [effectiveStack, onStart]);

  const isValid = effectiveStack !== null && effectiveStack >= 20 && effectiveStack <= 500 && !error;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Session</h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose your starting stack depth
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Preset Grid */}
          <div className="grid grid-cols-2 gap-3">
            {PRESET_STACKS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset.value)}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  !useCustom && selectedPreset === preset.value
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg font-bold">{preset.label}</span>
                <span className={`text-xs mt-1 ${
                  !useCustom && selectedPreset === preset.value
                    ? 'text-blue-500'
                    : 'text-gray-400'
                }`}>
                  {preset.description}
                </span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Custom Input */}
          <div>
            <label htmlFor="custom-stack" className="block text-sm font-medium text-gray-700 mb-1.5">
              Custom Stack Depth
            </label>
            <div className="relative">
              <input
                id="custom-stack"
                type="number"
                min={20}
                max={500}
                step={1}
                value={customValue}
                onChange={handleCustomChange}
                placeholder="Enter 20–500"
                className={`w-full px-4 py-2.5 pr-12 rounded-lg border text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                  error
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
                    : useCustom
                    ? 'border-blue-600 focus:ring-blue-500/20 focus:border-blue-600'
                    : 'border-gray-200 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
                BB
              </span>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-red-500">{error}</p>
            )}
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-slate-100 rounded-lg">
            <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-500 leading-relaxed">
              6-max No-Limit Hold'em. All 6 players start with the same stack.
              5 BOT opponents with varied play styles will be assigned automatically.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={!isValid}
            className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionConfigModal;