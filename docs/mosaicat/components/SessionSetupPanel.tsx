import React, { useState } from 'react';

interface BlindLevel {
  smallBlind: number;
  bigBlind: number;
}

interface SessionSetupPanelProps {
  onConfirm: (blindLevel: BlindLevel) => void;
  loading?: boolean;
}

const BLIND_LEVELS: BlindLevel[] = [
  { smallBlind: 1, bigBlind: 2 },
  { smallBlind: 2, bigBlind: 5 },
  { smallBlind: 5, bigBlind: 10 },
  { smallBlind: 10, bigBlind: 20 },
];

export const SessionSetupPanel: React.FC<SessionSetupPanelProps> = ({
  onConfirm,
  loading = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedLevel = BLIND_LEVELS[selectedIndex];
  const buyIn = selectedLevel.bigBlind * 100;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-100 mb-1">开始新游戏</h2>
      <p className="text-sm text-gray-400 mb-6">选择盲注级别，买入固定为 100BB</p>

      {/* Blind Level Selector */}
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-300 mb-3 block">盲注级别</label>
        <div className="grid grid-cols-2 gap-3">
          {BLIND_LEVELS.map((level, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`
                py-3 px-4 rounded-lg border text-center transition-all
                ${
                  selectedIndex === idx
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/50'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                }
              `}
            >
              <span className="text-lg font-bold">
                {level.smallBlind}/{level.bigBlind}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Buy-in Display */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 flex items-center justify-between">
        <span className="text-sm text-gray-400">买入筹码</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-amber-400">{buyIn}</span>
          <span className="text-sm text-gray-500">chips</span>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={() => onConfirm(selectedLevel)}
        disabled={loading}
        className={`
          w-full py-3.5 rounded-lg font-semibold text-base transition-all
          ${
            loading
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-gray-950 active:scale-[0.98]'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            创建中...
          </span>
        ) : (
          '确认开始'
        )}
      </button>
    </div>
  );
};

export default SessionSetupPanel;