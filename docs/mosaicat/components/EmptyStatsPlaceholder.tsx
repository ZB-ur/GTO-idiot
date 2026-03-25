import React from 'react';

interface EmptyStatsPlaceholderProps {
  onStartPlaying: () => void;
}

export const EmptyStatsPlaceholder: React.FC<EmptyStatsPlaceholderProps> = ({ onStartPlaying }) => {
  return (
    <div className="bg-[#1e293b] border border-gray-700 rounded-xl p-10 flex flex-col items-center justify-center text-center">
      {/* Illustration: stylized bar chart with poker chip */}
      <div className="relative mb-6">
        <svg className="w-24 h-24 text-gray-600" viewBox="0 0 96 96" fill="none">
          {/* Bar chart bars */}
          <rect x="12" y="56" width="14" height="28" rx="3" fill="#334155" />
          <rect x="32" y="40" width="14" height="44" rx="3" fill="#334155" />
          <rect x="52" y="48" width="14" height="36" rx="3" fill="#334155" />
          <rect x="72" y="32" width="14" height="52" rx="3" fill="#334155" />
          {/* Baseline */}
          <line x1="8" y1="86" x2="90" y2="86" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
          {/* Poker chip accent */}
          <circle cx="76" cy="24" r="12" fill="#10b981" opacity="0.2" />
          <circle cx="76" cy="24" r="8" stroke="#10b981" strokeWidth="1.5" fill="none" />
          <text x="76" y="28" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">♠</text>
        </svg>
      </div>

      <h3 className="text-xl font-bold text-gray-100 mb-2">No Statistics Yet</h3>
      <p className="text-gray-400 text-sm max-w-xs mb-6">
        Play some hands to start tracking your GTO conformance, win rate, and common errors.
      </p>

      <button
        onClick={onStartPlaying}
        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Start Playing
      </button>
    </div>
  );
};

export default EmptyStatsPlaceholder;