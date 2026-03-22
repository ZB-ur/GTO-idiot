import React from 'react';

export interface ReplayViewProps {
  handId: string;
}

const ReplayView: React.FC<ReplayViewProps> = ({ handId }) => {
  return (
    <div className="replay-view">
      <span>ReplayView for hand {handId}</span>
    </div>
  );
};

export default ReplayView;
