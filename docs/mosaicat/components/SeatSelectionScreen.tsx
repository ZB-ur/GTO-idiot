import React, { useState, useEffect } from 'react';

// Types from API spec
type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

interface SeatOption {
  seatIndex: number;
  position: Position;
  isAvailable: boolean;
  label: string;
}

interface SeatSelectionScreenProps {
  seats: SeatOption[];
  onStartGame: (seatPosition: Position) => void;
}

const POSITION_DESCRIPTIONS: Record<Position, string> = {
  UTG: '枪口位 · 最先行动',
  MP: '中间位 · 中等位置',
  CO: '关煞位 · 有利位置',
  BTN: '庄家位 · 最佳位置',
  SB: '小盲位 · 强制下注',
  BB: '大盲位 · 强制下注',
};

// Seat positions around an oval table (top-down view, CSS percentages)
const SEAT_LAYOUT: Record<number, { top: string; left: string }> = {
  0: { top: '68%', left: '10%' },  // UTG - bottom-left
  1: { top: '20%', left: '10%' },  // MP - top-left
  2: { top: '5%', left: '50%' },   // CO - top-center
  3: { top: '20%', left: '90%' },  // BTN - top-right
  4: { top: '68%', left: '90%' },  // SB - bottom-right
  5: { top: '85%', left: '50%' },  // BB - bottom-center
};

export const SeatSelectionScreen: React.FC<SeatSelectionScreenProps> = ({
  seats,
  onStartGame,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [disclaimerText, setDisclaimerText] = useState(
    '本应用使用简化GTO近似策略，适用于学习目的，非精确solver结果'
  );

  useEffect(() => {
    // Fetch config for disclaimer text
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const config = await res.json();
          if (config.gtoDisclaimerText) {
            setDisclaimerText(config.gtoDisclaimerText);
          }
        }
      } catch {
        // Use default disclaimer
      }
    };
    fetchConfig();
  }, []);

  const handleSeatClick = (seat: SeatOption) => {
    if (!seat.isAvailable) return;
    setSelectedPosition(seat.position);
  };

  const handleStartGame = () => {
    if (selectedPosition) {
      onStartGame(selectedPosition);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">选择你的座位</h1>
        <p className="text-base text-gray-600">
          选择一个位置开始 6-max 无限注德州扑克 GTO 训练
        </p>
      </div>

      {/* Table Area */}
      <div className="relative w-full max-w-2xl aspect-[16/10] mb-8">
        {/* Poker Table */}
        <div className="absolute inset-[15%] bg-emerald-800 rounded-[50%] border-4 border-emerald-900 shadow-lg">
          <div className="absolute inset-3 rounded-[50%] border border-emerald-700/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-emerald-600/60 text-lg font-semibold tracking-wider">
              6-MAX
            </span>
          </div>
        </div>

        {/* Seat Buttons */}
        {seats.map((seat) => {
          const pos = SEAT_LAYOUT[seat.seatIndex];
          const isSelected = selectedPosition === seat.position;

          return (
            <button
              key={seat.seatIndex}
              onClick={() => handleSeatClick(seat)}
              disabled={!seat.isAvailable}
              className={`
                absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2
                rounded-xl border-2 transition-all duration-200
                flex flex-col items-center justify-center gap-0.5
                ${
                  isSelected
                    ? 'bg-blue-600 border-blue-700 text-white shadow-md scale-110'
                    : seat.isAvailable
                    ? 'bg-white border-gray-200 text-gray-900 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer'
                    : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                }
              `}
              style={{ top: pos.top, left: pos.left }}
            >
              <span className={`text-sm font-bold ${isSelected ? 'text-white' : ''}`}>
                {seat.position}
              </span>
              <span
                className={`text-xs ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}
              >
                Seat {seat.seatIndex + 1}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Seat Info */}
      {selectedPosition && (
        <div className="text-center mb-6 animate-in fade-in duration-200">
          <p className="text-lg font-semibold text-gray-900">
            {selectedPosition}
          </p>
          <p className="text-sm text-gray-600">
            {POSITION_DESCRIPTIONS[selectedPosition]}
          </p>
        </div>
      )}

      {/* Start Game Button */}
      <button
        onClick={handleStartGame}
        disabled={!selectedPosition}
        className={`
          px-8 py-3 rounded-lg text-base font-semibold transition-all duration-200
          ${
            selectedPosition
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        开始游戏
      </button>

      {/* GTO Disclaimer Banner */}
      <div className="mt-8 max-w-lg w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-amber-500 mt-0.5 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        <p className="text-sm text-amber-800">{disclaimerText}</p>
      </div>
    </div>
  );
};

export default SeatSelectionScreen;