import React from 'react';
import HandHistoryList from '../ui/history/HandHistoryList';

const HistoryPage: React.FC = () => {
  return (
    <div className="history-page">
      <h1>Hand History</h1>
      <HandHistoryList items={[]} />
    </div>
  );
};

export default HistoryPage;
