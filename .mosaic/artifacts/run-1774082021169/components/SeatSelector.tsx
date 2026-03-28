'use client';

import { useState } from 'react';
import type { Position } from '@/engine/types';

interface SeatSelectorProps {
  selectedSeat: Position | null;
  onSelectSeat: (position: Position) => void;
}

const SEATS: { position: Position; label: string; description: string }[] = [
  { position: 'UTG', label: 'UTG', description: 'Under the Gun' },
  { position: 'HJ', label: 'MP', description: 'Middle Position' },
  { position: 'CO', label: 'CO', description: 'Cutoff' },
  { position: 'BTN', label: 'BTN', description: 'Button (Dealer)' },
  { position: 'SB', label: 'SB', description: 'Small Blind' },
  { position: 'BB', label: 'BB', description: 'Big Blind' },
];

export default function SeatSelector({
  selectedSeat,
  onSelectSeat,
}: SeatSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-lg font-semibold text-gray-200">Choose Your Seat</h3>

      {/* Table shape */}
      <div className="relative w-80 h-52">
        {/* Table oval */}
        <div className="absolute inset-4 rounded-[50%] bg-emerald-800 border-4 border-emerald-900 shadow-inner" />

        {/* Seats positioned around table */}
        {SEATS.map((seat, i) => {
          const angle = (i / SEATS.length) * 2 * Math.PI - Math.PI / 2;
          const rx = 48;
          const ry = 42;
          const x = 50 + rx * Math.cos(angle);
          const y = 50 + ry * Math.sin(angle);
          const isSelected = selectedSeat === seat.position;

          return (
            <button
              key={seat.position}
              type="button"
              onClick={() => onSelectSeat(seat.position)}
              className={`absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full flex flex-col items-center justify-center transition-all text-xs font-bold ${
                isSelected
                  ? 'bg-yellow-500 text-black ring-2 ring-yellow-300 shadow-lg shadow-yellow-500/30 scale-110'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-105'
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={seat.description}
            >
              <span>{seat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selected info */}
      {selectedSeat && (
        <p className="text-gray-400 text-sm">
          Selected: <span className="text-yellow-400 font-semibold">{selectedSeat}</span>
        </p>
      )}
    </div>
  );
}