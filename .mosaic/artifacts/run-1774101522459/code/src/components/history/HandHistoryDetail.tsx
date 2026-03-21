// ============================================================
// HandHistoryDetail — Full detail view of a single hand
// ============================================================

import React, { useState, useEffect } from 'react';
import type { HandHistory, Card as CardType } from '../../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../../types';
import { getHandHistory } from '../../services/history-service';
import { Skeleton } from '../common/Skeleton';

interface HandHistoryDetailProps {
  handId: string;
  onBack: () => void;
  onReplay: (handId: string) => void;
}

function cardStr(card: CardType): { text: string; cls: string } {
  const symbol = SUIT_SYMBOLS[card.suit];
  const cls = SUIT_COLORS[card.suit] === 'red' ? 'text-red-400' : 'text-gray-200';
  return { text: `${card.rank}${symbol}`, cls };
}

function CardsInline({ cards }: { cards: CardType[] }) {
  return (
    <span className="inline-flex gap-0.5">
      {cards.map((c, i) => {
        const { text, cls } = cardStr(c);
        return (
          <span key={i} className={`font-mono font-semibold ${cls}`}>{text}</span>
        );
      })}
    </span>
  );
}

const HandHistoryDetail: React.FC<HandHistoryDetailProps> = ({ handId, onBack, onReplay }) => {
  const [hand, setHand] = useState<HandHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getHandHistory(handId)
      .then((h) => { if (!cancelled) setHand(h); })
      .catch((e) => { if (!cancelled) setError(e.message ?? 'Failed to load'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [handId]);

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton height="h-8" width="w-48" />
        <Skeleton height="h-32" variant="rect" />
        <Skeleton height="h-64" variant="rect" />
      </div>
    );
  }

  if (error || !hand) {
    return (
      <div className="p-4">
        <button onClick={onBack} className="text-blue-400 hover:underline mb-4 text-sm">&larr; Back</button>
        <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400">
          {error ?? 'Hand not found'}
        </div>
      </div>
    );
  }

  const humanSeat = hand.seats.find((s) => s.isHuman);
  const settlement = hand.settlement;
  const humanChipMove = settlement.chipMovements.find((cm) => cm.seat === humanSeat?.seat);
  const pl = humanChipMove?.changesBB ?? 0;

  // Group actions by street
  const streetGroups: Record<string, typeof hand.actionSequence> = {};
  for (const action of hand.actionSequence) {
    if (!streetGroups[action.street]) streetGroups[action.street] = [];
    streetGroups[action.street].push(action);
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Hand #{hand.handNumber}</h2>
            <span className="text-xs text-gray-400">
              {new Date(hand.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
        <button
          onClick={() => onReplay(handId)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500
                     text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
          Replay
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoCard label="Position" value={humanSeat?.position ?? '-'} />
          <InfoCard
            label="Result"
            value={pl > 0 ? `+${pl.toFixed(1)} BB` : `${pl.toFixed(1)} BB`}
            valueClass={pl > 0 ? 'text-green-400' : pl < 0 ? 'text-red-400' : 'text-gray-300'}
          />
          <InfoCard
            label="Hole Cards"
            custom={humanSeat ? <CardsInline cards={humanSeat.holeCards} /> : undefined}
          />
          <InfoCard
            label="Board"
            custom={
              hand.communityCards.length > 0
                ? <CardsInline cards={hand.communityCards} />
                : <span className="text-gray-500">—</span>
            }
          />
        </div>

        {/* Seats */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Players</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-700/50">
                  <th className="text-left py-1.5 pr-2">Seat</th>
                  <th className="text-left py-1.5 pr-2">Name</th>
                  <th className="text-left py-1.5 pr-2">Pos</th>
                  <th className="text-left py-1.5 pr-2">Cards</th>
                  <th className="text-right py-1.5">Stack</th>
                </tr>
              </thead>
              <tbody>
                {hand.seats.map((seat) => {
                  const chipMove = settlement.chipMovements.find((cm) => cm.seat === seat.seat);
                  return (
                    <tr key={seat.seat} className={`border-b border-gray-800/50 ${seat.isHuman ? 'bg-blue-900/10' : ''}`}>
                      <td className="py-1.5 pr-2 text-gray-400">{seat.seat}</td>
                      <td className="py-1.5 pr-2 text-gray-200">
                        {seat.name}
                        {seat.isHuman && <span className="text-xs text-blue-400 ml-1">(You)</span>}
                      </td>
                      <td className="py-1.5 pr-2 text-gray-400">{seat.position}</td>
                      <td className="py-1.5 pr-2">
                        <CardsInline cards={seat.holeCards} />
                      </td>
                      <td className="py-1.5 text-right">
                        <span className="text-gray-300">{seat.startingStackBB.toFixed(1)}</span>
                        {chipMove && (
                          <span className={`ml-1 text-xs ${chipMove.changesBB >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ({chipMove.changesBB >= 0 ? '+' : ''}{chipMove.changesBB.toFixed(1)})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Action sequence by street */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Action Sequence</h3>
          <div className="space-y-3">
            {Object.entries(streetGroups).map(([street, actions]) => (
              <div key={street}>
                <div className="text-xs font-semibold text-blue-400 uppercase mb-1 flex items-center gap-2">
                  <span>{street}</span>
                  {street === 'flop' && hand.communityCards.length >= 3 && (
                    <CardsInline cards={hand.communityCards.slice(0, 3)} />
                  )}
                  {street === 'turn' && hand.communityCards.length >= 4 && (
                    <CardsInline cards={[hand.communityCards[3]]} />
                  )}
                  {street === 'river' && hand.communityCards.length >= 5 && (
                    <CardsInline cards={[hand.communityCards[4]]} />
                  )}
                </div>
                <div className="space-y-0.5 pl-2 border-l-2 border-gray-700/50">
                  {actions.map((action, i) => {
                    const isUser = action.seat === humanSeat?.seat;
                    return (
                      <div
                        key={i}
                        className={`text-sm py-0.5 px-2 rounded ${isUser ? 'bg-blue-900/20 text-blue-300' : 'text-gray-400'}`}
                      >
                        <span className="font-medium">{action.playerName}</span>{' '}
                        <span className="capitalize">{action.action.replace('_', '-')}</span>
                        {action.amount != null && action.amount > 0 && (
                          <span className="text-gray-300"> {action.amount.toFixed(1)} BB</span>
                        )}
                        <span className="text-gray-600 text-xs ml-2">pot: {action.potAfter.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Settlement */}
        {settlement.showdownHands.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Showdown</h3>
            <div className="space-y-1">
              {settlement.showdownHands.map((sh) => (
                <div key={sh.seat} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400 w-20">
                    {hand.seats.find((s) => s.seat === sh.seat)?.name}
                  </span>
                  <CardsInline cards={sh.holeCards} />
                  <span className="text-yellow-400 text-xs">{sh.handRank}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {settlement.wonWithoutShowdown && (
          <div className="text-sm text-gray-400 italic">
            Won without showdown — all opponents folded.
          </div>
        )}

        {/* Winners */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Winners</h3>
          <div className="space-y-1">
            {settlement.winners.map((w, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-gray-300">
                  {hand.seats.find((s) => s.seat === w.seat)?.name}
                </span>
                <span className="text-green-400 font-mono">+{w.amountWonBB.toFixed(1)} BB</span>
                {w.handRank && <span className="text-xs text-gray-500">({w.handRank})</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// Small info card helper
function InfoCard({
  label,
  value,
  valueClass = 'text-white',
  custom,
}: {
  label: string;
  value?: string;
  valueClass?: string;
  custom?: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800/60 rounded-lg p-3 border border-gray-700/30">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {custom ?? <div className={`text-sm font-semibold ${valueClass}`}>{value}</div>}
    </div>
  );
}

export default HandHistoryDetail;
