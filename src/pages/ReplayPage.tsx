import React from 'react';
import { useParams } from 'react-router-dom';
import ReplayView from '../ui/replay/ReplayView';

const ReplayPage: React.FC = () => {
  const { handId } = useParams<{ handId: string }>();

  return (
    <div className="replay-page">
      <h1>Hand Replay</h1>
      <ReplayView handId={handId ?? ''} />
    </div>
  );
};

export default ReplayPage;
