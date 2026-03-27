import type { ReactNode } from 'react';
import { ReplayTableView } from './ReplayTableView';
import { StreetTimeline } from './StreetTimeline';
import { ActionSequencePanel } from './ActionSequencePanel';
import { DecisionDetailPanel } from './DecisionDetailPanel';

export function HandReplayPage(): ReactNode {
  return (
    <div>
      <StreetTimeline />
      <ReplayTableView />
      <ActionSequencePanel />
      <DecisionDetailPanel />
    </div>
  );
}
