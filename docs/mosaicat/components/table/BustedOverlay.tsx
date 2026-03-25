import React from 'react';

interface BustedOverlayProps {
  onRebuy: () => void;
  onEndSession: () => void;
}

export default function BustedOverlay({ onRebuy, onEndSession }: BustedOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl px-8 py-10 max-w-sm w-full mx-4 text-center">
        {/* Bust icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-5">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">You're Busted!</h2>
        <p className="text-gray-400 text-sm mb-8">
          You've run out of chips. Rebuy to continue playing or end the session.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onRebuy}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold text-base shadow-lg transition-all active:scale-[0.98]"
          >
            Rebuy & Continue
          </button>
          <button
            onClick={onEndSession}
            className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm border border-gray-600 transition-all active:scale-[0.98]"
          >
            End Session
          </button>
        </div>

        {/* Chip decoration */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-red-300 opacity-30" />
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-2 border-amber-200 opacity-30" />
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-300 opacity-30" />
        </div>
      </div>
    </div>
  );
}