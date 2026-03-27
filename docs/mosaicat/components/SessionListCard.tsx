import React from 'react';

interface SessionConfig {
  startingStackBB: number;
  blindLevel: { smallBlind: number; bigBlind: number };
  botSeats: { seatNumber: number; profile: string }[];
}

interface Session {
  id: string;
  config: SessionConfig;
  status: 'active' | 'completed';
  handsPlayed: number;
  netResult: number;
  gtoAlignmentScore?: number;
  createdAt: string;
  endedAt?: string;
}

interface Card {
  rank: string;
  suit: string;
}

interface HandHistoryEntry {
  id: string;
  sessionId: string;
  handNumber: number;
  userPosition: string;
  userHoleCards?: Card[];
  communityCards?: Card[];
  outcome: string;
  netResult: number;
  createdAt: string;
}

interface SessionListCardProps {
  session: Session;
  hands: HandHistoryEntry[];
  expanded: boolean;
  onToggle: () => void;
  onHandClick: (handId: string) => void;
}

const suitSymbols: Record<string, string> = {
  hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠',
};

const outcomeLabels: Record<string, { label: string; color: string }> = {
  won_showdown: { label: 'Won', color: 'text-emerald-400' },
  lost_showdown: { label: 'Lost', color: 'text-red-400' },
  won_fold: { label: 'Won (fold)', color: 'text-emerald-400' },
  folded_preflop: { label: 'Folded Pre', color: 'text-gray-500' },
  folded_postflop: { label: 'Folded Post', color: 'text-gray-500' },
  split_pot: { label: 'Split', color: 'text-amber-400' },
};

const HandListItem: React.FC<{
  hand: HandHistoryEntry;
  onClick: () => void;
}> = ({ hand, onClick }) => {
  const outcome = outcomeLabels[hand.outcome] || { label: hand.outcome, color: 'text-gray-400' };
  const resultColor = hand.netResult > 0 ? 'text-emerald-400' : hand.netResult < 0 ? 'text-red-400' : 'text-gray-400';
  const resultPrefix = hand.netResult > 0 ? '+' : '';

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-colors text-left group"
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-gray-500 w-6">#{hand.handNumber}</span>
        <span className="text-xs text-gray-400 w-8">{hand.userPosition}</span>
        {hand.userHoleCards && (
          <div className="flex gap-0.5">
            {hand.userHoleCards.map((card, i) => (
              <span key={i} className="text-xs text-gray-300">
                {card.rank}{suitSymbols[card.suit] || ''}
              </span>
            ))}
          </div>
        )}
        <span className={`text-xs ${outcome.color}`}>{outcome.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-bold ${resultColor}`}>
          {resultPrefix}{hand.netResult}
        </span>
        <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
};

export const SessionListCard: React.FC<SessionListCardProps> = ({
  session,
  hands,
  expanded,
  onToggle,
  onHandClick,
}) => {
  const resultColor = session.netResult > 0 ? 'text-emerald-400' : session.netResult < 0 ? 'text-red-400' : 'text-gray-400';
  const resultPrefix = session.netResult > 0 ? '+' : '';
  const date = new Date(session.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  const gtoColor = session.gtoAlignmentScore != null
    ? session.gtoAlignmentScore >= 70
      ? 'text-emerald-400'
      : session.gtoAlignmentScore >= 50
        ? 'text-amber-400'
        : 'text-red-400'
    : 'text-gray-500';

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-700 overflow-hidden">
      {/* Header — clickable to toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          {/* Date */}
          <div>
            <div className="text-sm font-semibold text-gray-50">{date}</div>
            <div className="text-xs text-gray-500">{session.handsPlayed} hands</div>
          </div>
        </div>

        <div className="flex items-center gap-5">
          {/* GTO Score */}
          {session.gtoAlignmentScore != null && (
            <div className="text-right">
              <div className={`text-sm font-bold ${gtoColor}`}>
                {session.gtoAlignmentScore.toFixed(1)}%
              </div>
              <div className="text-[10px] text-gray-500">GTO</div>
            </div>
          )}

          {/* Net Result */}
          <div className="text-right">
            <div className={`text-sm font-bold ${resultColor}`}>
              {resultPrefix}{session.netResult}
            </div>
            <div className="text-[10px] text-gray-500">chips</div>
          </div>

          {/* Expand/Collapse Arrow */}
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Hand List */}
      {expanded && (
        <div className="border-t border-gray-800 px-2 py-1 max-h-64 overflow-y-auto">
          {hands.length > 0 ? (
            hands.map((hand) => (
              <HandListItem
                key={hand.id}
                hand={hand}
                onClick={() => onHandClick(hand.id)}
              />
            ))
          ) : (
            <div className="py-4 text-center text-sm text-gray-500">No hands recorded</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionListCard;