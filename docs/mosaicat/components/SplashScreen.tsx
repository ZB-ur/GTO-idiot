import React from 'react';

interface SplashScreenProps {
  progress: number;
  label?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ progress, label }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <svg className="w-10 h-10 text-gray-950" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-50 tracking-tight">PokerGTO</h1>
      </div>

      {/* Progress Bar */}
      <div className="w-64 flex flex-col items-center gap-3">
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>
        {label && (
          <p className="text-gray-500 text-sm">{label}</p>
        )}
      </div>
    </div>
  );
};