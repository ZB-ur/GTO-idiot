// ============================================================
// HistoryPage — Container for hand history list / detail / replay
// ============================================================

import React, { useState, useCallback } from 'react';
import HandHistoryList from './HandHistoryList';
import HandHistoryDetail from './HandHistoryDetail';

export type HistoryView = 'list' | 'detail' | 'replay';

interface HistoryPageProps {
  /** Optional callback when user wants to replay — navigates to replay page */
  onNavigateToReplay?: (handId: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigateToReplay }) => {
  const [view, setView] = useState<HistoryView>('list');
  const [selectedHandId, setSelectedHandId] = useState<string | null>(null);

  const handleSelectHand = useCallback((handId: string) => {
    setSelectedHandId(handId);
    setView('detail');
  }, []);

  const handleBack = useCallback(() => {
    setView('list');
    setSelectedHandId(null);
  }, []);

  const handleReplay = useCallback((handId: string) => {
    if (onNavigateToReplay) {
      onNavigateToReplay(handId);
    } else {
      // Fallback: navigate via URL
      window.location.hash = `#replay/${handId}`;
    }
  }, [onNavigateToReplay]);

  return (
    <div className="h-full flex flex-col p-4 max-w-4xl mx-auto">
      {view === 'list' && (
        <HandHistoryList onSelectHand={handleSelectHand} />
      )}
      {view === 'detail' && selectedHandId && (
        <HandHistoryDetail
          handId={selectedHandId}
          onBack={handleBack}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
};

export default HistoryPage;
