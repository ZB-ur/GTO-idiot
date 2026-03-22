/**
 * DeviationRankingList — ranked table of most common GTO deviations.
 */

import React from 'react';
import type { TopDeviations } from '../../types/stats';

interface DeviationRankingListProps {
  data: TopDeviations | null;
  loading: boolean;
}

const STREET_BADGE: Record<string, string> = {
  preflop: 'bg-blue-900 text-blue-300',
  flop: 'bg-green-900 text-green-300',
  turn: 'bg-yellow-900 text-yellow-300',
  river: 'bg-red-900 text-red-300',
};

export const DeviationRankingList: React.FC<DeviationRankingListProps> = ({
  data,
  loading,
}) => {
  const deviations = data?.deviations ?? [];

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">Top Deviations</h3>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      ) : deviations.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          No deviations recorded yet. Keep playing!
        </p>
      ) : (
        <div className="divide-y divide-gray-700">
          {deviations.map((dev, idx) => (
            <div
              key={dev.type}
              className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              {/* Rank */}
              <span className="w-6 text-center text-xs font-bold text-gray-500">
                #{idx + 1}
              </span>

              {/* Description & street badge */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">{dev.description}</p>
                {dev.street && (
                  <span
                    className={`inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded ${STREET_BADGE[dev.street] ?? 'bg-gray-700 text-gray-400'}`}
                  >
                    {dev.street}
                  </span>
                )}
              </div>

              {/* Count */}
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-300">{dev.count}x</p>
                <p className="text-[10px] text-gray-500">occurrences</p>
              </div>

              {/* Avg EV loss */}
              <div className="text-right w-20">
                <p className="text-sm font-semibold text-red-400">
                  -{dev.averageEvLoss.toFixed(2)} BB
                </p>
                <p className="text-[10px] text-gray-500">avg EV loss</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
