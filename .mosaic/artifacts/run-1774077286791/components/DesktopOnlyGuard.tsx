import React, { useState, useEffect } from 'react';

const MIN_WIDTH = 1024;

interface DesktopOnlyGuardProps {
  children: React.ReactNode;
}

export const DesktopOnlyGuard: React.FC<DesktopOnlyGuardProps> = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= MIN_WIDTH : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= MIN_WIDTH);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isDesktop) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
          <svg
            className="h-10 w-10 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
            />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">请使用桌面浏览器</h1>
        <p className="mb-2 text-base text-gray-600">
          GTO Idiot 需要至少 <span className="font-semibold text-gray-900">1024px</span> 宽度的屏幕才能正常显示牌桌界面。
        </p>
        <p className="text-sm text-gray-400">
          请在电脑上打开此页面，或将浏览器窗口调大后重试。
        </p>
      </div>
    </div>
  );
};

export default DesktopOnlyGuard;