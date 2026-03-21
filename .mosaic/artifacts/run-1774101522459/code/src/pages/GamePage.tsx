// ============================================================
// Game Page — wrapper for the poker table UI
// Will import PokerTable from game-ui module once built
// ============================================================

import React from 'react';

const GamePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-400">Loading game table…</p>
    </div>
  );
};

export default GamePage;
