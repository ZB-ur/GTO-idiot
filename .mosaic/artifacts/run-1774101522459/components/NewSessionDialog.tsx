import React, { useState, useEffect, useCallback } from 'react';

interface NewSessionDialogProps {
  open: boolean;
  onStart: (config: { seatPreference: 'auto' | 'manual'; selectedSeat?: number }) => void;
  onCancel: () => void;
}

export const NewSessionDialog: React.FC<NewSessionDialogProps> = ({
  open,
  onStart,
  onCancel,
}) => {
  const [seatPref, setSeatPref] = useState<'auto' | 'manual'>('auto');
  const [selectedSeat, setSelectedSeat] = useState<number>(1);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    },
    [onCancel],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const handleStart = () => {
    onStart({
      seatPreference: seatPref,
      selectedSeat: seatPref === 'manual' ? selectedSeat : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative max-w-md w-full mx-4 bg-white rounded-xl shadow-md border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">New Session</h2>
          <button
            onClick={onCancel}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-100 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Seat preference */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Seat Selection</label>
            <div className="flex gap-3">
              <button
                onClick={() => setSeatPref('auto')}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-semibold transition-colors ${
                  seatPref === 'auto'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="font-bold">Auto</div>
                <div className="text-xs font-normal mt-0.5 opacity-70">Random seat assignment</div>
              </button>
              <button
                onClick={() => setSeatPref('manual')}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-semibold transition-colors ${
                  seatPref === 'manual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="font-bold">Manual</div>
                <div className="text-xs font-normal mt-0.5 opacity-70">Choose your seat</div>
              </button>
            </div>
          </div>

          {/* Manual seat picker */}
          {seatPref === 'manual' && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Choose Seat (1-6)</label>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((seat) => (
                  <button
                    key={seat}
                    onClick={() => setSelectedSeat(seat)}
                    className={`aspect-square rounded-lg border text-sm font-bold flex items-center justify-center transition-colors ${
                      selectedSeat === seat
                        ? 'border-blue-500 bg-blue-600 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    {seat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-slate-50 rounded-b-xl">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSessionDialog;