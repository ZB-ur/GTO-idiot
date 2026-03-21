// ============================================================
// NewSessionDialog — Modal to create a new game session
// ============================================================

import React, { useState } from 'react';
import type { SeatPreference } from '../../types';

interface NewSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (seatPreference: SeatPreference, selectedSeat?: number) => void;
  hasActiveSession: boolean;
}

const SEAT_LABELS = ['Seat 1', 'Seat 2', 'Seat 3', 'Seat 4', 'Seat 5', 'Seat 6'];

export const NewSessionDialog: React.FC<NewSessionDialogProps> = ({
  open,
  onClose,
  onCreate,
  hasActiveSession,
}) => {
  const [seatPref, setSeatPref] = useState<SeatPreference>('auto');
  const [selectedSeat, setSelectedSeat] = useState<number>(0);

  if (!open) return null;

  const handleCreate = () => {
    onCreate(seatPref, seatPref === 'manual' ? selectedSeat : undefined);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md p-6 space-y-5">
        <h2 className="text-xl font-bold text-white">New Session</h2>

        {hasActiveSession && (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg px-4 py-3 text-sm text-yellow-200">
            You have an active session. Starting a new one will end it.
          </div>
        )}

        {/* Seat preference */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Seat Selection</label>
          <div className="flex gap-3">
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                seatPref === 'auto'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSeatPref('auto')}
            >
              Random
            </button>
            <button
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                seatPref === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSeatPref('manual')}
            >
              Choose Seat
            </button>
          </div>
        </div>

        {/* Seat picker */}
        {seatPref === 'manual' && (
          <div className="grid grid-cols-3 gap-2">
            {SEAT_LABELS.map((label, idx) => (
              <button
                key={idx}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSeat === idx
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedSeat(idx)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleCreate} className="btn-primary">
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};
