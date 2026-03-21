// ============================================================
// Stats Page — performance statistics dashboard
// Will import from stats module once built
// ============================================================

import React from 'react';

const StatsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <h2 className="text-2xl font-bold text-white mb-2">Statistics</h2>
      <p className="text-gray-400">Play some hands to see your performance stats.</p>
    </div>
  );
};

export default StatsPage;
