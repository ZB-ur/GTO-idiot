// ============================================================
// History Page — hand history browser with detail + replay
// ============================================================

import React, { useState, useCallback } from 'react';
import HistoryPageComponent from '../components/history/HistoryPage';
import ReplayPage from '../components/replay/ReplayPage';

type View = 'history' | 'replay';

const HistoryPage: React.FC = () => {
  const [view, setView] = useState<View>('history');
  const [replayHandId, setReplayHandId] = useState<string | null>(null);

  const handleNavigateToReplay = useCallback((handId: string) => {
    setReplayHandId(handId);
    setView('replay');
  }, []);

  const handleBackFromReplay = useCallback(() => {
    setView('history');
    setReplayHandId(null);
  }, []);

  if (view === 'replay' && replayHandId) {
    return <ReplayPage handId={replayHandId} onBack={handleBackFromReplay} />;
  }

  return <HistoryPageComponent onNavigateToReplay={handleNavigateToReplay} />;
};

export default HistoryPage;
