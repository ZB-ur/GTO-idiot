import React from 'react';

interface SessionOption {
  id: string;
  createdAt: string;
}

interface SessionFilterProps {
  sessions: SessionOption[];
  selectedSessionId: string | null;
  onChange: (sessionId: string | null) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function SessionFilter({ sessions, selectedSessionId, onChange }: SessionFilterProps) {
  return (
    <div className="relative">
      <select
        value={selectedSessionId ?? '__all__'}
        onChange={(e) => onChange(e.target.value === '__all__' ? null : e.target.value)}
        className="appearance-none w-full bg-gray-900 border border-gray-700 text-gray-50 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 cursor-pointer hover:border-gray-600 transition-colors"
      >
        <option value="__all__">All Sessions</option>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {formatDate(s.createdAt)}
          </option>
        ))}
      </select>
      {/* Chevron icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}