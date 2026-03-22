import React from 'react';

interface LoadingScreenProps {
  progress: number;
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  message = 'Loading GTO strategy data…',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50">
      {/* Logo area */}
      <div className="flex flex-col items-center gap-6">
        {/* Logo / brand mark */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-emerald-800 border-2 border-emerald-900 shadow-md flex items-center justify-center">
            {/* Stylized poker chip icon */}
            <svg className="w-10 h-10 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="12" cy="12" r="3.5" />
              <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
              <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.5" />
              <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          {/* Spinner ring */}
          <div className="absolute inset-0 w-20 h-20">
            <svg className="w-full h-full animate-spin" viewBox="0 0 80 80" style={{ animationDuration: '2s' }}>
              <circle
                cx="40"
                cy="40"
                r="38"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="3"
                strokeDasharray="239"
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              <circle
                cx="40"
                cy="40"
                r="38"
                fill="none"
                stroke="#059669"
                strokeWidth="3"
                strokeDasharray="239"
                strokeDashoffset="180"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          GTO Idiot
        </h1>

        {/* Progress bar */}
        <div className="w-64 flex flex-col items-center gap-3">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${clampedProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-gray-500">{message}</p>
            <span className="text-sm font-medium text-gray-900 tabular-nums">
              {Math.round(clampedProgress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;