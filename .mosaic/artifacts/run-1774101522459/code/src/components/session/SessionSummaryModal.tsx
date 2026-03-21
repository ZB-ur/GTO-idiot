// ============================================================
// SessionSummaryModal — Shown after ending a session
// ============================================================

import React from 'react';
import type { SessionEndSummary } from '../../types';

interface SessionSummaryModalProps {
  summary: SessionEndSummary | null;
  onClose: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  summary,
  onClose,
}) => {
  if (!summary) return null;

  const isProfit = summary.profitLossBB >= 0;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-md p-6 space-y-5">
        <h2 className="text-xl font-bold text-white text-center">Session Complete</h2>

        <div className="grid grid-cols-2 gap-4">
          <StatBlock label="Duration" value={`${summary.durationMinutes.toFixed(0)} min`} />
          <StatBlock label="Hands Played" value={String(summary.handCount)} />
          <StatBlock
            label="Profit / Loss"
            value={`${isProfit ? '+' : ''}${summary.profitLossBB.toFixed(1)} BB`}
            valueColor={isProfit ? 'text-green-400' : 'text-red-400'}
          />
          <StatBlock
            label="Avg EV Loss"
            value={`${summary.avgEvLossPerHand.toFixed(2)} BB`}
            valueColor="text-yellow-400"
          />
        </div>

        <div className="flex justify-center pt-2">
          <button onClick={onClose} className="btn-primary px-8">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Helpers ---

const StatBlock: React.FC<{
  label: string;
  value: string;
  valueColor?: string;
}> = ({ label, value, valueColor = 'text-white' }) => (
  <div className="bg-gray-900 rounded-lg p-3 text-center">
    <div className="text-xs text-gray-400 mb-1">{label}</div>
    <div className={`text-lg font-bold ${valueColor}`}>{value}</div>
  </div>
);
