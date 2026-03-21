import React, { useMemo } from 'react';

// === Type Definitions ===
interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
  notation?: string;
}

interface HoleCards {
  card1: Card;
  card2: Card;
}

interface HandPlayerState {
  playerId: string;
  name: string;
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  stack: number;
  currentBet: number;
  isFolded: boolean;
  isAllIn: boolean;
  isActive: boolean;
  lastAction?: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  holeCards?: HoleCards;
}

interface ActionEntry {
  playerId: string;
  playerName: string;
  position: string;
  action: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  amount?: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  potAfterAction?: number;
  timestamp: string;
  isUserAction?: boolean;
}

interface WinnerInfo {
  playerId: string;
  playerName: string;
  amount: number;
  handRank?: string;
  holeCards?: HoleCards;
}

interface HandState {
  id: string;
  gameId: string;
  handNumber?: number;
  phase: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'complete';
  pot: number;
  sidePots?: { amount: number; eligiblePlayers: string[] }[];
  communityCards: Card[];
  players: HandPlayerState[];
  dealerPosition: string;
  currentActorId?: string | null;
  isUserTurn: boolean;
  userHoleCards?: HoleCards;
  actionHistory: ActionEntry[];
  winners?: WinnerInfo[] | null;
}

interface AvailableAction {
  type: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  isEnabled: boolean;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  presets?: { label: string; amount: number }[];
}

interface AvailableActions {
  handId: string;
  currentPot: number;
  userStack: number;
  effectiveStack?: number;
  amountToCall?: number;
  actions: AvailableAction[];
}

interface PlayerAction {
  action: 'fold' | 'check' | 'call' | 'raise' | 'all_in';
  amount?: number;
}

interface PokerTableProps {
  handState: HandState;
  availableActions?: AvailableActions;
  onAction?: (action: PlayerAction) => void;
  readOnly?: boolean;
}

// === Helpers ===
const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-900',
  h: 'text-red-500',
  d: 'text-blue-500',
  c: 'text-green-600',
};

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All In',
};

// Seat positions around an oval table (percentages of container)
// Order: BTN(bottom-right), SB(bottom-left), BB(left), UTG(top-left), MP(top-right), CO(right)
const SEAT_LAYOUT: Record<string, { top: string; left: string; betTop: string; betLeft: string }> = {
  BTN: { top: '72%', left: '72%', betTop: '58%', betLeft: '64%' },
  SB:  { top: '72%', left: '28%', betTop: '58%', betLeft: '34%' },
  BB:  { top: '44%', left: '6%',  betTop: '44%', betLeft: '20%' },
  UTG: { top: '12%', left: '28%', betTop: '28%', betLeft: '34%' },
  MP:  { top: '12%', left: '72%', betTop: '28%', betLeft: '64%' },
  CO:  { top: '44%', left: '94%', betTop: '44%', betLeft: '78%' },
};

function CardView({ card, faceDown = false }: { card: Card; faceDown?: boolean }) {
  if (faceDown) {
    return (
      <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-600 shadow-sm flex items-center justify-center">
        <div className="w-6 h-8 rounded border border-blue-400/30 bg-blue-800" />
      </div>
    );
  }
  return (
    <div className="w-10 h-14 rounded-lg bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center leading-none">
      <span className={`text-sm font-bold ${SUIT_COLORS[card.suit]}`}>{card.rank}</span>
      <span className={`text-xs ${SUIT_COLORS[card.suit]}`}>{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}

function PlayerSeat({
  player,
  isDealer,
  isCurrentActor,
  isUser,
  userHoleCards,
}: {
  player: HandPlayerState;
  isDealer: boolean;
  isCurrentActor: boolean;
  isUser: boolean;
  userHoleCards?: HoleCards;
}) {
  const pos = SEAT_LAYOUT[player.position];
  const holeCards = isUser ? userHoleCards : player.holeCards;

  return (
    <>
      {/* Seat card */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
        style={{ top: pos.top, left: pos.left }}
      >
        <div
          className={`
            flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 min-w-[100px]
            ${player.isFolded ? 'opacity-40 border-gray-300 bg-gray-50' : ''}
            ${isCurrentActor ? 'border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-200/50' : ''}
            ${!player.isFolded && !isCurrentActor && isUser ? 'border-blue-500 bg-blue-50' : ''}
            ${!player.isFolded && !isCurrentActor && !isUser ? 'border-gray-200 bg-white' : ''}
            ${player.isAllIn ? 'border-red-400 bg-red-50' : ''}
          `}
        >
          {/* Dealer chip */}
          {isDealer && (
            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-yellow-400 border border-yellow-500 text-[10px] font-bold flex items-center justify-center text-yellow-900 shadow">
              D
            </div>
          )}

          {/* Hole cards */}
          {holeCards && !player.isFolded && (
            <div className="flex gap-0.5 -mt-1">
              <CardView card={holeCards.card1} />
              <CardView card={holeCards.card2} />
            </div>
          )}

          {/* Name + Position */}
          <div className="text-center">
            <div className={`text-xs font-semibold truncate max-w-[90px] ${isUser ? 'text-blue-700' : 'text-gray-900'}`}>
              {player.name}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">{player.position}</div>
          </div>

          {/* Stack */}
          <div className={`text-sm font-bold ${player.isAllIn ? 'text-red-600' : 'text-gray-800'}`}>
            {player.isAllIn ? 'ALL IN' : `${player.stack.toFixed(1)} BB`}
          </div>

          {/* Last action */}
          {player.lastAction && !player.isFolded && (
            <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
              {ACTION_LABELS[player.lastAction]}
            </div>
          )}
        </div>
      </div>

      {/* Current bet chip */}
      {player.currentBet > 0 && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ top: pos.betTop, left: pos.betLeft }}
        >
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 border border-gray-200 shadow-sm">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 border border-yellow-600" />
            <span className="text-xs font-bold text-gray-700">{player.currentBet.toFixed(1)}</span>
          </div>
        </div>
      )}
    </>
  );
}

function CommunityCards({ cards, phase }: { cards: Card[]; phase: string }) {
  const totalSlots = 5;
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: totalSlots }).map((_, i) => {
        if (i < cards.length) {
          return <CardView key={i} card={cards[i]} />;
        }
        return (
          <div
            key={i}
            className="w-10 h-14 rounded-lg border border-dashed border-white/20 bg-white/5"
          />
        );
      })}
    </div>
  );
}

function PotDisplay({ pot, sidePots }: { pot: number; sidePots?: { amount: number; eligiblePlayers: string[] }[] }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="text-sm font-semibold text-white/70 uppercase tracking-wider">Pot</div>
      <div className="text-2xl font-bold text-white">{pot.toFixed(1)} BB</div>
      {sidePots && sidePots.length > 0 && (
        <div className="flex gap-2 mt-1">
          {sidePots.map((sp, i) => (
            <div key={i} className="text-xs text-white/60 bg-white/10 rounded-full px-2 py-0.5">
              Side Pot: {sp.amount.toFixed(1)} BB
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionPanel({
  availableActions,
  onAction,
  readOnly,
}: {
  availableActions: AvailableActions;
  onAction?: (action: PlayerAction) => void;
  readOnly?: boolean;
}) {
  const [raiseAmount, setRaiseAmount] = React.useState<number>(0);
  const raiseAction = availableActions.actions.find(a => a.type === 'raise');

  React.useEffect(() => {
    if (raiseAction?.minAmount) {
      setRaiseAmount(raiseAction.minAmount);
    }
  }, [raiseAction?.minAmount]);

  if (readOnly) return null;

  const handleAction = (type: PlayerAction['action'], amount?: number) => {
    onAction?.({ action: type, amount });
  };

  const buttonStyles: Record<string, string> = {
    fold: 'bg-gray-500 hover:bg-gray-600 text-white',
    check: 'bg-blue-600 hover:bg-blue-700 text-white',
    call: 'bg-green-600 hover:bg-green-700 text-white',
    raise: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
    all_in: 'bg-red-500 hover:bg-red-600 text-white',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex items-center gap-2 flex-wrap">
        {availableActions.actions
          .filter(a => a.type !== 'raise')
          .map(action => (
            <button
              key={action.type}
              disabled={!action.isEnabled}
              onClick={() => handleAction(action.type, action.amount)}
              className={`
                px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors
                ${action.isEnabled ? buttonStyles[action.type] : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}
            >
              {ACTION_LABELS[action.type]}
              {action.amount != null && action.type === 'call' && (
                <span className="ml-1 opacity-80">{action.amount.toFixed(1)} BB</span>
              )}
            </button>
          ))}

        {/* Raise controls */}
        {raiseAction && raiseAction.isEnabled && (
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
            {/* Preset buttons */}
            {raiseAction.presets?.map(preset => (
              <button
                key={preset.label}
                onClick={() => handleAction('raise', preset.amount)}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
              >
                {preset.label}
              </button>
            ))}

            {/* Slider + custom */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={raiseAction.minAmount ?? 0}
                max={raiseAction.maxAmount ?? 100}
                step={0.5}
                value={raiseAmount}
                onChange={e => setRaiseAmount(parseFloat(e.target.value))}
                className="w-24 accent-yellow-500"
              />
              <span className="text-sm font-mono font-bold text-gray-700 min-w-[50px] text-right">
                {raiseAmount.toFixed(1)}
              </span>
              <button
                onClick={() => handleAction('raise', raiseAmount)}
                className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-yellow-500 hover:bg-yellow-600 text-gray-900 transition-colors"
              >
                Raise
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="flex gap-4 mt-2 text-xs text-gray-400">
        <span>Pot: {availableActions.currentPot.toFixed(1)} BB</span>
        <span>Your Stack: {availableActions.userStack.toFixed(1)} BB</span>
        {availableActions.amountToCall != null && availableActions.amountToCall > 0 && (
          <span>To Call: {availableActions.amountToCall.toFixed(1)} BB</span>
        )}
      </div>
    </div>
  );
}

// === Main Component ===
export default function PokerTable({ handState, availableActions, onAction, readOnly = false }: PokerTableProps) {
  const userPlayer = useMemo(
    () => handState.players.find(p => p.playerId === 'user' || p.name === 'You' || p.name === 'Hero'),
    [handState.players]
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl mx-auto p-4">
      {/* Hand info bar */}
      <div className="flex items-center justify-between w-full text-sm text-gray-500">
        <span className="font-medium">
          Hand #{handState.handNumber ?? '—'}
        </span>
        <span className={`
          px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider
          ${handState.phase === 'complete' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}
        `}>
          {handState.phase}
        </span>
      </div>

      {/* Table area */}
      <div className="relative w-full" style={{ paddingBottom: '60%' }}>
        {/* Felt */}
        <div className="absolute inset-[8%] rounded-[50%] bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 border-[6px] border-emerald-950 shadow-2xl">
          {/* Inner rail */}
          <div className="absolute inset-3 rounded-[50%] border border-emerald-600/30" />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <PotDisplay pot={handState.pot} sidePots={handState.sidePots} />
            <CommunityCards cards={handState.communityCards} phase={handState.phase} />
          </div>
        </div>

        {/* Player seats */}
        {handState.players.map(player => (
          <PlayerSeat
            key={player.playerId}
            player={player}
            isDealer={player.position === handState.dealerPosition}
            isCurrentActor={player.playerId === handState.currentActorId}
            isUser={player.playerId === userPlayer?.playerId}
            userHoleCards={
              player.playerId === userPlayer?.playerId ? handState.userHoleCards : undefined
            }
          />
        ))}
      </div>

      {/* Winners display */}
      {handState.winners && handState.winners.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-3 text-center">
          {handState.winners.map((w, i) => (
            <div key={i} className="text-sm">
              <span className="font-bold text-yellow-800">{w.playerName}</span>
              <span className="text-yellow-600"> wins {w.amount.toFixed(1)} BB</span>
              {w.handRank && <span className="text-yellow-500 ml-1">— {w.handRank}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Action panel */}
      {handState.isUserTurn && availableActions && !readOnly && (
        <ActionPanel
          availableActions={availableActions}
          onAction={onAction}
          readOnly={readOnly}
        />
      )}
    </div>
  );
}