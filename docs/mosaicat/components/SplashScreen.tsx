import React from 'react';

interface SplashScreenProps {
  progress: number;
  statusText: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  progress,
  statusText,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-50">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <span className="text-gray-950 text-4xl font-bold">♠</span>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-50 tracking-tight">
            Poker<span className="text-amber-500">Coach</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered GTO Training</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 flex flex-col items-center gap-3 mt-4">
          <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{statusText}</p>
        </div>
      </div>
    </div>
  );
};