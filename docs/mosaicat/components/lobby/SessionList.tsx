import React from 'react';
import { SessionCard } from './SessionCard';
import type { SessionSummary } from './SessionCard';

export interface SessionListProps {
  sessions: SessionSummary[];
  onContinue: (sessionId: string) => void;
  onReview: (sessionId: string) => void;
}

export const SessionList: React.FC<SessionListProps> = ({ sessions, onContinue, onReview }) => {
  return (
    <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-50 text-lg font-semibold">对战记录</h2>
        <span className="text-gray-500 text-sm">{sessions.length} 局</span>
      </div>
      {sessions.map((session) => (
        <SessionCard
          key={session.sessionId}
          session={session}
          onContinue={onContinue}
          onReview={onReview}
        />
      ))}
    </div>
  );
};