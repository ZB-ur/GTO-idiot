import React from 'react';

interface LandingScreenProps {
  onQuickStart: () => void;
  onNewSession: () => void;
  onViewHistory: () => void;
  hasHistory: boolean;
}

const LandingScreen: React.FC<LandingScreenProps> = ({
  onQuickStart,
  onNewSession,
  onViewHistory,
  hasHistory,
}) => {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo & Title */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-900 border border-emerald-700 mb-6 shadow-lg shadow-black/40">
          <svg
            className="w-10 h-10 text-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C10.08 2 8.5 3.58 8.5 5.5c0 .517.115 1.006.32 1.447L5.25 12l3.57 5.053A3.49 3.49 0 008.5 18.5C8.5 20.42 10.08 22 12 22s3.5-1.58 3.5-3.5c0-.517-.115-1.006-.32-1.447L18.75 12l-3.57-5.053c.205-.441.32-.93.32-1.447C15.5 3.58 13.92 2 12 2z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-50 mb-2 tracking-tight">
          GTO Idiot
        </h1>
        <p className="text-lg text-gray-400 max-w-md mx-auto">
          Master Texas Hold'em GTO strategy through practice and real-time feedback
        </p>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-4">
        {/* Quick Start — Primary CTA */}
        <button
          onClick={onQuickStart}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-lg rounded-xl shadow-lg shadow-black/40 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-950"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          Quick Start
        </button>

        {/* New Session — Secondary CTA */}
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-800 hover:bg-gray-700 text-gray-50 font-semibold text-lg rounded-xl border border-gray-700 shadow-lg shadow-black/40 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:ring-offset-gray-950"
        >
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          New Session
        </button>

        {/* Hand History — Conditional Link */}
        {hasHistory && (
          <button
            onClick={onViewHistory}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-400 hover:text-amber-400 font-medium text-base rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            View Hand History
          </button>
        )}
      </div>

      {/* Footer tagline */}
      <div className="mt-16 text-center">
        <p className="text-sm text-gray-500">
          6-max · GTO Reference · Real-time Feedback
        </p>
      </div>
    </div>
  );
};

export default LandingScreen;