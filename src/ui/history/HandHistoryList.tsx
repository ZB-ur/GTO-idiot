import React from 'react';
import type { HandHistorySummary } from '../../types';
import EmptyState from '../shared/EmptyState';

export interface HandHistoryListProps {
  items: HandHistorySummary[];
  onSelect?: (handId: string) => void;
}

const HandHistoryList: React.FC<HandHistoryListProps> = ({ items, onSelect }) => {
  if (items.length === 0) {
    return <EmptyState title="No hands played yet" />;
  }

  return (
    <div className="hand-history-list">
      {items.map((item) => (
        <div key={item.handId} className="hand-item" onClick={() => onSelect?.(item.handId)}>
          <span>{item.playedAt}</span>
          <span>{item.profit}</span>
        </div>
      ))}
    </div>
  );
};

export default HandHistoryList;
