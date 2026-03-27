import type { ReactNode } from 'react';
import { SessionCard } from './SessionCard';
import { EmptyLobbyState } from './EmptyLobbyState';
import type { SessionSummary } from '../../types';

export function SessionList(): ReactNode {
  const sessions: SessionSummary[] = [];
  if (sessions.length === 0) {
    return <EmptyLobbyState />;
  }
  return (
    <div>
      {sessions.map((s) => (
        <SessionCard key={s.sessionId} session={s} />
      ))}
    </div>
  );
}
