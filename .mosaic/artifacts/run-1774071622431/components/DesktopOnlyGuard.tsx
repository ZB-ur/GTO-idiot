import React, { useState, useEffect } from 'react';

interface DesktopOnlyGuardProps {
  children: React.ReactNode;
}

const MIN_DESKTOP_WIDTH = 1024;

export const DesktopOnlyGuard: React.FC<DesktopOnlyGuardProps> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= MIN_DESKTOP_WIDTH;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MIN_DESKTOP_WIDTH}px)`);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    setIsDesktop(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, []);

  if (isDesktop) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 max-w-md text-center space-y-5">
        {/* Monitor icon */}
        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Desktop Only</h1>
          <p className="text-gray-600">
            GTO Idiot is designed for desktop screens. Please use a device with a screen width of at least 1024px for the best experience.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg text-sm text-gray-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          Minimum width: 1024px
        </div>
      </div>
    </div>
  );
};

export default DesktopOnlyGuard;