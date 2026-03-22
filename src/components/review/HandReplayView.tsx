/**
 * HandReplayView — full hand replay with street stepping, action timeline,
 * mini table visualization, and GTO comparison details.
 */

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { HandReview, ReviewAction } from '../../types/review';
import type { Street, Card } from '../../types/poker';
import { reviewService } from '../../services/review-service';
import { StreetStepper } from './StreetStepper';
import { ActionTimeline } from './ActionTimeline';
import { DeviationDetail } from './DeviationDetail';
import { MiniTable } from './MiniTable';
import { ReplayControls } from './ReplayControls';
import { GTOComparisonBadge } from './GTOComparisonBadge';
import { CardComponent } from '../table/CardComponent';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { handRepository } from '../../persistence';

interface HandReplayViewProps {
  sessionId: string;
  handId: string;
  onBack?: () => void;
  className?: string;
}

interface FlatAction {
  streetIndex: number;
  actionIndex: number;
  street: Street;
  action: ReviewAction;
}

export const HandReplayView: React.FC<HandReplayViewProps> = ({
  sessionId,
  handId,
  onBack,
  className = '',
}) => {
  const [review, setReview] = useState<HandReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStreet, setActiveStreet] = useState<Street>('preflop');
  const [selectedActionIdx, setSelectedActionIdx] = useState<number | undefined>(undefined);
  const [globalActionIdx, setGlobalActionIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Players for mini table (from hand history)
  const [players, setPlayers] = useState<Array<{
    name: string;
    position: import('../../types/poker').Position;
    holeCards?: [Card, Card];
    isHuman?: boolean;
  }>>([]);

  // Load review data
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [reviewData, handData] = await Promise.all([
          reviewService.getHandReview(sessionId, handId),
          handRepository.getById(handId),
        ]);

        if (cancelled) return;

        setReview(reviewData);
        setPlayers(
          handData.players.map((p) => ({
            name: p.name,
            position: p.position,
            holeCards: p.holeCards,
            isHuman: !p.isBot,
          }))
        );

        // Reset navigation
        setActiveStreet(reviewData.streets[0]?.street ?? 'preflop');
        setSelectedActionIdx(undefined);
        setGlobalActionIdx(0);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load hand review');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [sessionId, handId]);

  // Flatten all actions for global navigation
  const flatActions = useMemo<FlatAction[]>(() => {
    if (!review) return [];
    const result: FlatAction[] = [];
    review.streets.forEach((street, sIdx) => {
      street.actions.forEach((action, aIdx) => {
        result.push({
          streetIndex: sIdx,
          actionIndex: aIdx,
          street: street.street,
          action,
        });
      });
    });
    return result;
  }, [review]);

  // Current street's review data
  const currentStreetReview = useMemo(() => {
    return review?.streets.find((s) => s.street === activeStreet);
  }, [review, activeStreet]);

  // Community cards visible up to current street
  const visibleCommunityCards = useMemo(() => {
    if (!review) return [];
    const cards: Card[] = [];
    const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
    const activeIdx = streetOrder.indexOf(activeStreet);

    for (const street of review.streets) {
      const sIdx = streetOrder.indexOf(street.street);
      if (sIdx <= activeIdx && street.communityCards) {
        cards.push(...street.communityCards);
      }
    }
    return cards;
  }, [review, activeStreet]);

  // Deviation streets for stepper indicators
  const deviationStreets = useMemo(() => {
    if (!review) return new Set<Street>();
    const set = new Set<Street>();
    for (const street of review.streets) {
      for (const action of street.actions) {
        if (
          action.isHumanAction &&
          action.gtoComparison &&
          action.gtoComparison.deviationLevel !== 'conforming'
        ) {
          set.add(street.street);
        }
      }
    }
    return set;
  }, [review]);

  // Folded players up to current street
  const foldedPlayers = useMemo(() => {
    if (!review) return new Set<string>();
    const folded = new Set<string>();
    const streetOrder: Street[] = ['preflop', 'flop', 'turn', 'river'];
    const activeIdx = streetOrder.indexOf(activeStreet);

    for (const street of review.streets) {
      const sIdx = streetOrder.indexOf(street.street);
      if (sIdx > activeIdx) break;
      for (const action of street.actions) {
        if (action.actionType === 'fold') {
          folded.add(action.playerId);
        }
      }
    }
    return folded;
  }, [review, activeStreet]);

  // Selected action's GTO comparison
  const selectedComparison = useMemo(() => {
    if (selectedActionIdx == null || !currentStreetReview) return null;
    const action = currentStreetReview.actions[selectedActionIdx];
    return action?.isHumanAction ? action.gtoComparison ?? null : null;
  }, [currentStreetReview, selectedActionIdx]);

  // Global action index change handler
  const handleGlobalIndexChange = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= flatActions.length) return;
      setGlobalActionIdx(idx);
      const flat = flatActions[idx];
      setActiveStreet(flat.street);
      setSelectedActionIdx(flat.actionIndex);
    },
    [flatActions]
  );

  // Auto-play
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setGlobalActionIdx((prev) => {
          const next = prev + 1;
          if (next >= flatActions.length) {
            setIsPlaying(false);
            return prev;
          }
          const flat = flatActions[next];
          setActiveStreet(flat.street);
          setSelectedActionIdx(flat.actionIndex);
          return next;
        });
      }, 1500);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, flatActions]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleStreetChange = useCallback(
    (street: Street) => {
      setActiveStreet(street);
      setSelectedActionIdx(undefined);
      setIsPlaying(false);

      // Update global index to first action of this street
      const idx = flatActions.findIndex((f) => f.street === street);
      if (idx >= 0) setGlobalActionIdx(idx);
    },
    [flatActions]
  );

  const handleActionSelect = useCallback(
    (actionIdx: number) => {
      setSelectedActionIdx(actionIdx);

      // Update global index
      const idx = flatActions.findIndex(
        (f) => f.street === activeStreet && f.actionIndex === actionIdx
      );
      if (idx >= 0) setGlobalActionIdx(idx);
    },
    [flatActions, activeStreet]
  );

  if (isLoading) {
    return <SkeletonLoader rows={8} className={className} />;
  }

  if (error || !review) {
    return (
      <div className={`card p-6 text-center ${className}`}>
        <p className="text-red-400">{error ?? 'Failed to load review'}</p>
        {onBack && (
          <button onClick={onBack} className="btn-secondary mt-3 text-sm">
            ← Back to hands
          </button>
        )}
      </div>
    );
  }

  const availableStreets = review.streets.map((s) => s.street);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="text-sm text-gray-400 hover:text-white">
              ← Back
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-white">
              Hand #{review.handNumber}
            </h2>
            {review.humanPosition && (
              <span className="text-xs text-gray-400 font-mono">
                {review.humanPosition}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <GTOComparisonBadge level={review.overallConformance} size="md" />
          {review.totalEvLoss > 0 && (
            <span className="text-sm text-red-400 font-mono">
              -{review.totalEvLoss.toFixed(1)} BB
            </span>
          )}
        </div>
      </div>

      {/* Hole cards */}
      {review.humanHoleCards && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Your cards:</span>
          <div className="flex gap-1">
            {review.humanHoleCards.map((card, i) => (
              <CardComponent key={i} card={card} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Street stepper */}
      <StreetStepper
        streets={availableStreets}
        activeStreet={activeStreet}
        onSelectStreet={handleStreetChange}
        deviationStreets={deviationStreets}
      />

      {/* Main content: Mini table + Action timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Mini table */}
        <div className="card p-3">
          <MiniTable
            players={players.map((p) => ({
              ...p,
              isFolded: foldedPlayers.has(
                review.streets
                  .flatMap((s) => s.actions)
                  .find((a) => a.position === p.position)?.playerId ?? ''
              ),
            }))}
            communityCards={visibleCommunityCards}
            pot={currentStreetReview?.potAtStart}
          />
        </div>

        {/* Right: Action timeline */}
        <div className="card p-3">
          <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
            Actions
          </h3>
          <ActionTimeline
            actions={currentStreetReview?.actions ?? []}
            onSelectAction={handleActionSelect}
            selectedIndex={selectedActionIdx}
          />
        </div>
      </div>

      {/* Deviation detail (when a human action with GTO comparison is selected) */}
      {selectedComparison && (
        <DeviationDetail comparison={selectedComparison} />
      )}

      {/* Replay controls */}
      <ReplayControls
        currentIndex={globalActionIdx}
        totalActions={flatActions.length}
        onIndexChange={handleGlobalIndexChange}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
      />
    </div>
  );
};

export default HandReplayView;
