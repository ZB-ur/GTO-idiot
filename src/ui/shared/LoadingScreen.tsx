import React from 'react';
import Spinner from './Spinner';

export interface LoadingScreenProps {
  message?: string;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message, progress }) => {
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-felt-950/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5">
        <Spinner size="lg" />
        {message && (
          <p className="text-sm font-medium text-slate-300 tracking-wide">{message}</p>
        )}
        {progress !== undefined && (
          <div className="w-48 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
