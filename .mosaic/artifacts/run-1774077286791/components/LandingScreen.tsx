import React from 'react';

interface LandingScreenProps {
  hasUnfinishedSession: boolean;
  onNewSession: () => void;
  onResumeSession: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({
  hasUnfinishedSession,
  onNewSession,
  onResumeSession,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {/* Logo & Branding */}
        <div className="space-y-3">
          <div className="mx-auto w-20 h-20 bg-emerald-800 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-4xl">♠</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            GTO Idiot
          </h1>
          <p className="text-gray-600 text-base">
            Texas Hold'em GTO 训练器
          </p>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          {/* Resume Session Card */}
          {hasUnfinishedSession && (
            <button
              onClick={onResumeSession}
              className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm
                         hover:border-blue-300 hover:shadow-md transition-all duration-200
                         text-left group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center
                                group-hover:bg-amber-100 transition-colors">
                  <svg
                    className="w-6 h-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    继续上次 Session
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    恢复未完成的牌局
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          )}

          {/* New Session Card */}
          <button
            onClick={onNewSession}
            className="w-full bg-blue-600 rounded-xl p-6 shadow-sm
                       hover:bg-blue-700 transition-all duration-200
                       text-left group cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  新建 Session
                </h2>
                <p className="text-sm text-blue-100 mt-0.5">
                  6-max · 100BB · 1 Human + 5 BOTs
                </p>
              </div>
              <svg
                className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Footer Info */}
        <p className="text-xs text-gray-400">
          纯前端运行 · 数据保存在本地 IndexedDB
        </p>
      </div>
    </div>
  );
};

export default LandingScreen;