import React from 'react';

const AppLoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1a1a2e]">
      <div className="relative mb-8">
        {/* Card flip animation container */}
        <div className="flex gap-2">
          {['♠', '♥', '♦', '♣'].map((suit, i) => (
            <div
              key={suit}
              className="w-12 h-16 rounded-md flex items-center justify-center text-2xl font-bold animate-pulse"
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: suit === '♥' || suit === '♦' ? '#e74c3c' : '#ecf0f1',
                animationDelay: `${i * 150}ms`,
              }}
            >
              {suit}
            </div>
          ))}
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-100 mb-1">GTO Idiot</h1>
      <p className="text-gray-500 text-sm">Loading your poker trainer…</p>
    </div>
  );
};

export default AppLoadingScreen;