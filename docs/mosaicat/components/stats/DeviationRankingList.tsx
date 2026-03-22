import React from 'react';

export interface DeviationExample {
  handId: string;
  sessionId: string;
}

export interface DeviationItem {
  type: string;
  description: string;
  count: number;
  averageEvLoss: number;
  street?: 'preflop' | 'flop' | 'turn' | 'river';
  examples?: DeviationExample[];
}

export interface TopDeviations {
  deviations: DeviationItem[];
}

interface DeviationRankingListProps {
  deviations: TopDeviations;
  onExampleClick?: (handId: string, sessionId: string) => void;
  isLoading?: boolean;
}

const STREET_COLORS: Record<string, { bg: string; text: string }> = {
  preflop: { bg: 'bg-blue-100', text: 'text-blue-700' },
  flop: { bg: 'bg-green-100', text: 'text-green-700' },
  turn: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  river: { bg: 'bg-red-100', text: 'text-red-700' },
};

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse space-y-3">
    <div className="h-4 bg-gray-200 rounded w-1/3" />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="h-16 bg-gray-200 rounded-lg" />
    ))}
  </div>
);

const Badge: React.FC<{ street: string }> = ({ street }) => {
  const colors = STREET_COLORS[street] ?? { bg: 'bg-gray-100', text: 'text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
      {street.charAt(0).toUpperCase() + street.slice(1)}
    </span>
  );
};

const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <div className="text-4xl mb-3">🎯</div>
    <p className="text-gray-600 font-medium">No deviations found</p>
    <p className="text-gray-400 text-sm mt-1">Play more hands to see your deviation patterns</p>
  </div>
);

export const DeviationRankingList: React.FC<DeviationRankingListProps> = ({
  deviations,
  onExampleClick,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <SkeletonLoader />
      </div>
    );
  }

  const items = deviations.deviations;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Deviations</h3>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.type}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {item.description}
                  </span>
                  {item.street && <Badge street={item.street} />}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{item.count} occurrences</span>
                  <span>avg -{item.averageEvLoss.toFixed(1)} BB</span>
                </div>
                {item.examples && item.examples.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {item.examples.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => onExampleClick?.(ex.handId, ex.sessionId)}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Example {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* EV Loss indicator */}
              <div className="flex-shrink-0 text-right">
                <span className="text-sm font-semibold text-red-500">
                  -{(item.averageEvLoss * item.count).toFixed(1)} BB
                </span>
                <p className="text-xs text-gray-400">total</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviationRankingList;