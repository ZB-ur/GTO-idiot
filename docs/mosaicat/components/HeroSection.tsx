import React, { useState } from 'react';

interface HeroSectionProps {
  onStartSession: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartSession }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    onStartSession();
  };

  return (
    <section className="relative overflow-hidden rounded-xl bg-gray-900 border border-gray-700 p-10">
      {/* Background felt texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-gray-900 to-gray-900 pointer-events-none" />

      <div className="relative flex flex-col items-center text-center">
        {/* Decorative chips */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <div className="w-3 h-3 rounded-full bg-sky-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-gray-400" />
        </div>

        <h1 className="text-3xl font-bold text-gray-50 mb-3">
          Sharpen Your Poker Game
        </h1>
        <p className="text-gray-400 text-base max-w-md mb-8">
          Practice against AI opponents, analyze your decisions with GTO comparison, and track your improvement over time.
        </p>

        <button
          onClick={handleClick}
          disabled={isLoading}
          className="group flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-gray-950 font-bold text-lg rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Starting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Session
            </>
          )}
        </button>

        <p className="text-gray-500 text-xs mt-4">6-max No-Limit Hold'em • 5 AI opponents</p>
      </div>
    </section>
  );
};