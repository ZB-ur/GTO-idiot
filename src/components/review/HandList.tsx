/**
 * HandList — lists completed hands within a session for review selection.
 * Each row shows hand #, position, hole cards, result, and GTO badge.
 */

import React, { useEffect, useState, useCallback } from 'react';
import type { HandSummary } from '../../types/poker';
import { handRepository } from '../../persistence';
import { CardComponent } from '../table/CardComponent';
import { GTOComparisonBadge } from './GTOComparisonBadge';
import { EmptyState } from '../common/EmptyState';
import { SkeletonLoader } from '../common/SkeletonLoader';

interface HandListProps {
  sessionId: string;
  selectedHandId?: string;
  onSelectHand: (handId: string) => void;
  onBack?: () => void;
  className?: string;
}

export const HandList: React.FC<HandListProps> = ({
  sessionId,
  selectedHandId,
  onSelectHand,
  onBack,
  className = '',
}) => {
  const [hands, setHands] = useState<HandSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await handRepository.listBySession(sessionId, { limit: 200 });
      setHands(result.hands);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hands');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadHands();
  }, [loadHands]);

  const formatResult = (bb: number): { text: string; color: string } => {
    if (bb > 0) return { text: `+${bb.toFixed(1)}`, color: 'text-green-400' };
    if (bb < 0) return { text: bb.toFixed(1), color: 'text-red-400' };
    return { text: '0', color: 'text-gray-400' };
  };

  if (isLoading) {
    return <SkeletonLoader rows={6} className={className} />;
  }

  if (error) {
    return (
      <div className={`card p-4 text-center ${className}`}>
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={loadHands} className="btn-secondary mt-2 text-sm">
          Retry
        </button>
      </div>
    );
  }

  if (hands.length === 0) {
    return (
      <EmptyState
        icon="🃏"
        title="No Hands Recorded"
        description="This session has no completed hands to review."
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        {onBack && (
          <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">
            ← Sessions
          </button>
        )}
        <h2 className="text-lg font-semibold text-white">
          Hands ({total})
        </h2>
      </div>

      <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
        {hands.map((hand) => {
          const result = formatResult(hand.humanResult);
          const isSelected = hand.handId === selectedHandId;

          return (
            <button
              key={hand.handId}
              onClick={() => onSelectHand(hand.handId)}
              className={`w-full p-2.5 rounded-lg flex items-center gap-3 text-left
                transition-colors
                ${isSelected
                  ? 'bg-felt-600/30 border border-felt-500/50'
                  : 'hover:bg-gray-700/40 border border-transparent'
                }`}
            >
              {/* Hand number */}
              <span className="text-xs text-gray-500 w-6 text-right shrink-0">
                #{hand.handNumber}
              </span>

              {/* Position */}
              <span className="text-xs text-gray-300 w-8 shrink-0 font-mono">
                {hand.humanPosition}
              </span>

              {/* Hole cards */}
              <div className="flex gap-0.5 shrink-0">
                {hand.humanHoleCards ? (
                  hand.humanHoleCards.map((card, i) => (
                    <CardComponent key={i} card={card} size="sm" />
                  ))
                ) : (
                  <>
                    <CardComponent faceDown size="sm" />
                    <CardComponent faceDown size="sm" />
                  </>
                )}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Result */}
              <span className={`text-sm font-mono ${result.color}`}>
                {result.text}
              </span>

              {/* GTO badge */}
              <GTOComparisonBadge
                level={hand.gtoConformance === 'mixed' ? 'minor_deviation' : hand.gtoConformance}
                size="sm"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HandList;
