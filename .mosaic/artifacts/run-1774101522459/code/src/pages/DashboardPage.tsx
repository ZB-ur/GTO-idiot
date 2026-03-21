// ============================================================
// Dashboard Page — landing page with session overview
// Will be enhanced when services module provides session data
// ============================================================

import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h1 className="text-3xl font-bold text-white mb-4">GTO Idiot</h1>
      <p className="text-gray-400 mb-8 text-center max-w-md">
        Practice poker decisions and learn GTO strategy against AI opponents.
      </p>
      <a
        href="/game"
        className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors"
      >
        Start Playing
      </a>
    </div>
  );
};

export default DashboardPage;
