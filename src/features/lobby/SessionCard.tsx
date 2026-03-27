import type { ReactNode } from 'react';
import type { SessionSummary } from '../../types';

export interface SessionCardProps {
  session: SessionSummary;
}

export function SessionCard({ session }: SessionCardProps): ReactNode {
  return <div>{session.sessionId}</div>;
}
