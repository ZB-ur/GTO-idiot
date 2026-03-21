// ============================================================
// History Page — hand history browser
// Will import from history-replay module once built
// ============================================================

import React from 'react';

const HistoryPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Hand History</h2>
      <p className="text-gray-400">No hands played yet. Start a session to see your history.</p>
    </div>
  );
};

export default HistoryPage;
