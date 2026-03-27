import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Types ---

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface SeatState {
  playerId: string;
  nickname: string;
  seatIndex: number;
  isUser: boolean;
  botStyle?: 'TAG' | 'LAG' | 'TightPassive' | 'Fish' | 'Balanced';
  chipCount: number;
  position: 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
  isFolded: boolean;
  isAllIn: boolean;
  currentBet: number;
  holeCards?: Card[] | null;
  lastAction?: string | null;
}

interface AvailableActions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  canRaise: boolean;
  callAmount?: number;
  minRaise?: number;
  maxRaise?: number;
}

interface WinnerInfo {
  playerId: string;
  nickname: string;
  amount: number;
  winningHand?: string | null;
  holeCards?: Card[] | null;
}

interface HandResult {
  winners: WinnerInfo[];
  showdown: boolean;
}

interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

interface GameState {
  handId: string;
  handNumber: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  pot: number;
  sidePots?: SidePot[];
  communityCards: Card[];
  seats: SeatState[];
  dealerSeatIndex: number;
  activeSeatIndex: number | null;
  isUserTurn?: boolean;
  availableActions?: AvailableActions;
  isHandComplete: boolean;
  result?: HandResult;
}

interface ActionLogEntry {
  playerId: string;
  nickname: string;
  actionType: string;
  amount?: number | null;
  street: string;
  sequenceIndex: number;
  thinkingDelayMs?: number;
}

// --- Helpers ---

const SUIT_SYMBOLS: Record<string, string> = { s: '♠', h: '♥', d: '♦', c: '♣' };
const SUIT_COLORS: Record<string, string> = {
  s: 'text-gray-100',
  h: 'text-red-500',
  d: 'text-red-500',
  c: 'text-gray-100',
};

function CardDisplay({ card, faceDown = false }: { card?: Card; faceDown?: boolean }) {
  if (!card || faceDown) {
    return (
      <div className="w-10 h-14 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-400 shadow-md flex items-center justify-center">
        <div className="w-6 h-8 rounded border border-amber-300/40" />
      </div>
    );
  }
  const isRed = card.suit === 'h' || card.suit === 'd';
  return (
    <div className="w-10 h-14 rounded-lg bg-white shadow-md flex flex-col items-center justify-center relative border border-gray-300">
      <span className={`text-sm font-bold leading-none ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
        {card.rank}
      </span>
      <span className={`text-xs leading-none ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
        {SUIT_SYMBOLS[card.suit]}
      </span>
    </div>
  );
}

// Seat positions arranged in an oval for 6-max
const SEAT_POSITIONS: { top: string; left: string }[] = [
  { top: '78%', left: '50%' },   // 0: bottom center (user)
  { top: '65%', left: '12%' },   // 1: bottom-left
  { top: '18%', left: '12%' },   // 2: top-left
  { top: '5%', left: '50%' },    // 3: top center
  { top: '18%', left: '88%' },   // 4: top-right
  { top: '65%', left: '88%' },   // 5: bottom-right
];

// --- Sub-components ---

function HandInfoBar({
  handNumber,
  street,
  pot,
  sidePots,
  soundEnabled,
  onToggleSound,
}: {
  handNumber: number;
  street: string;
  pot: number;
  sidePots?: SidePot[];
  soundEnabled: boolean;
  onToggleSound: () => void;
}) {
  const streetLabels: Record<string, string> = {
    preflop: '翻前',
    flop: '翻牌',
    turn: '转牌',
    river: '河牌',
  };
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">#{handNumber}</span>
        <span className="text-amber-500 font-semibold text-sm">{streetLabels[street] || street}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-sm">底池</span>
          <span className="text-amber-500 font-bold">{pot}</span>
        </div>
        {sidePots && sidePots.length > 0 && (
          <div className="flex items-center gap-1">
            {sidePots.map((sp, i) => (
              <span key={i} className="text-xs bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">
                边池 {sp.amount}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onToggleSound}
        className="text-gray-500 hover:text-gray-300 transition-colors p-1"
        aria-label={soundEnabled ? '关闭音效' : '开启音效'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

function SeatComponent({
  seat,
  isDealer,
  isActive,
  isWinner,
}: {
  seat: SeatState;
  isDealer: boolean;
  isActive: boolean;
  isWinner: boolean;
}) {
  const pos = SEAT_POSITIONS[seat.seatIndex];
  return (
    <div
      className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2"
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Hole cards */}
      <div className="flex gap-0.5 mb-1">
        {seat.holeCards && seat.holeCards.length === 2 ? (
          seat.holeCards.map((c, i) => <CardDisplay key={i} card={c} />)
        ) : seat.isFolded ? null : (
          <>
            <CardDisplay faceDown />
            <CardDisplay faceDown />
          </>
        )}
      </div>

      {/* Player info box */}
      <div
        className={`relative px-3 py-2 rounded-xl min-w-[100px] text-center transition-all duration-300 ${
          seat.isFolded
            ? 'bg-gray-800/60 opacity-50'
            : isActive
            ? 'bg-gray-800 ring-2 ring-amber-500 shadow-lg shadow-amber-500/20'
            : isWinner
            ? 'bg-gray-800 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20'
            : 'bg-gray-800 border border-gray-700'
        }`}
      >
        {/* Dealer chip */}
        {isDealer && (
          <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 text-gray-950 text-[10px] font-bold flex items-center justify-center shadow">
            D
          </span>
        )}
        {/* Position badge */}
        <span className="absolute -top-2 -left-2 text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full font-medium">
          {seat.position}
        </span>

        <div className="text-gray-50 text-sm font-semibold truncate max-w-[90px]">
          {seat.nickname}
          {seat.isUser && <span className="ml-1 text-amber-400 text-[10px]">你</span>}
        </div>
        <div className="text-amber-400 text-xs font-mono">{seat.chipCount}</div>

        {/* Last action */}
        {seat.lastAction && !seat.isFolded && (
          <div className="text-emerald-400 text-[11px] mt-0.5 font-medium">{seat.lastAction}</div>
        )}
        {seat.isFolded && <div className="text-gray-500 text-[11px] mt-0.5">弃牌</div>}
        {seat.isAllIn && <div className="text-red-400 text-[11px] mt-0.5 font-bold">ALL IN</div>}
      </div>

      {/* Current bet */}
      {seat.currentBet > 0 && (
        <div className="flex items-center gap-1 mt-1">
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 shadow" />
          <span className="text-amber-300 text-xs font-mono">{seat.currentBet}</span>
        </div>
      )}
    </div>
  );
}

function TableFelt({ communityCards }: { communityCards: Card[] }) {
  return (
    <div className="absolute inset-[15%] rounded-[50%] bg-gradient-to-br from-emerald-900 to-emerald-950 border-4 border-emerald-700 shadow-inner flex items-center justify-center">
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`transition-all duration-500 ${i < communityCards.length ? 'scale-100 opacity-100' : 'scale-90 opacity-30'}`}>
            {i < communityCards.length ? (
              <CardDisplay card={communityCards[i]} />
            ) : (
              <div className="w-10 h-14 rounded-lg border border-emerald-700/50 bg-emerald-800/30" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionPanel({
  actions,
  onAction,
  disabled,
}: {
  actions: AvailableActions;
  onAction: (type: string, amount?: number) => void;
  disabled: boolean;
}) {
  const [raiseAmount, setRaiseAmount] = useState(actions.minRaise || 0);

  useEffect(() => {
    setRaiseAmount(actions.minRaise || 0);
  }, [actions.minRaise]);

  const presets = actions.maxRaise
    ? [
        { label: 'Min', value: actions.minRaise || 0 },
        { label: '½ Pot', value: Math.round((actions.minRaise || 0) * 1.5) },
        { label: 'Pot', value: Math.min((actions.minRaise || 0) * 3, actions.maxRaise) },
        { label: 'All In', value: actions.maxRaise },
      ]
    : [];

  return (
    <div className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 border-t border-gray-800">
      {actions.canFold && (
        <button
          disabled={disabled}
          onClick={() => onAction('fold')}
          className="px-5 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm transition-colors disabled:opacity-40 border border-gray-700"
        >
          弃牌
        </button>
      )}
      {actions.canCheck && (
        <button
          disabled={disabled}
          onClick={() => onAction('check')}
          className="px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors disabled:opacity-40"
        >
          过牌
        </button>
      )}
      {actions.canCall && (
        <button
          disabled={disabled}
          onClick={() => onAction('call')}
          className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-colors disabled:opacity-40"
        >
          跟注 {actions.callAmount}
        </button>
      )}
      {actions.canRaise && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {presets.map((p) => (
              <button
                key={p.label}
                disabled={disabled}
                onClick={() => setRaiseAmount(p.value)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  raiseAmount === p.value
                    ? 'bg-amber-500 text-gray-950'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <input
            type="range"
            min={actions.minRaise || 0}
            max={actions.maxRaise || 0}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            className="w-24 accent-amber-500"
            disabled={disabled}
          />
          <button
            disabled={disabled}
            onClick={() => onAction('raise', raiseAmount)}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm transition-colors disabled:opacity-40"
          >
            加注 {raiseAmount}
          </button>
        </div>
      )}
    </div>
  );
}

function WinnerBanner({ result }: { result: HandResult }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
      <div className="bg-gray-900/90 backdrop-blur-sm border border-emerald-500/50 rounded-2xl px-8 py-5 shadow-2xl shadow-emerald-500/10 text-center pointer-events-auto animate-fade-in">
        {result.winners.map((w, i) => (
          <div key={i} className="mb-2 last:mb-0">
            <span className="text-emerald-400 font-bold text-lg">{w.nickname}</span>
            <span className="text-gray-400 mx-2">赢得</span>
            <span className="text-amber-400 font-bold text-lg">{w.amount}</span>
            {w.winningHand && (
              <div className="text-gray-300 text-sm mt-1">{w.winningHand}</div>
            )}
            {w.holeCards && (
              <div className="flex gap-1 justify-center mt-1">
                {w.holeCards.map((c, j) => (
                  <CardDisplay key={j} card={c} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TableLoadingSkeleton() {
  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <div className="h-10 bg-gray-900 border-b border-gray-800 animate-pulse" />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-[600px] h-[360px] rounded-[50%] bg-emerald-900/30 border-4 border-emerald-700/30 animate-pulse flex items-center justify-center">
          <span className="text-gray-500 text-sm">加载牌桌中...</span>
        </div>
      </div>
      <div className="h-16 bg-gray-900 border-t border-gray-800 animate-pulse" />
    </div>
  );
}

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-6 py-5 shadow-2xl max-w-sm">
        <p className="text-gray-50 text-sm mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-sm transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function PokerTablePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const sessionIdRef = useRef<string>('');

  // Fetch initial game state (deal first hand)
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session') || '';
    sessionIdRef.current = sessionId;

    async function init() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/hands/deal`, { method: 'POST' });
        if (res.ok) {
          const state: GameState = await res.json();
          setGameState(state);
        }
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Fetch sound preference
  useEffect(() => {
    async function fetchSound() {
      try {
        const res = await fetch('/api/preferences/sound');
        if (res.ok) {
          const pref = await res.json();
          setSoundEnabled(pref.enabled);
        }
      } catch {
        // ignore
      }
    }
    fetchSound();
  }, []);

  const toggleSound = useCallback(async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      await fetch('/api/preferences/sound', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      });
    } catch {
      // revert on error
      setSoundEnabled(!next);
    }
  }, [soundEnabled]);

  const handleAction = useCallback(
    async (actionType: string, amount?: number) => {
      if (!gameState || actionPending) return;

      // Confirm all-in
      if (actionType === 'raise' && amount === gameState.availableActions?.maxRaise) {
        setConfirmDialog({
          message: `确认全押 ${amount} 筹码？`,
          onConfirm: () => {
            setConfirmDialog(null);
            submitAction(actionType, amount);
          },
        });
        return;
      }
      submitAction(actionType, amount);
    },
    [gameState, actionPending],
  );

  const submitAction = useCallback(
    async (actionType: string, amount?: number) => {
      setActionPending(true);
      try {
        const body: Record<string, unknown> = { actionType };
        if (amount !== undefined) body.amount = amount;

        const res = await fetch(`/api/sessions/${sessionIdRef.current}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          const result: { gameState: GameState; actionLog: ActionLogEntry[] } = await res.json();
          // Animate action log entries with delays
          for (const entry of result.actionLog) {
            if (entry.thinkingDelayMs) {
              await new Promise((r) => setTimeout(r, entry.thinkingDelayMs));
            }
            setActionLog((prev) => [...prev, entry]);
          }
          setGameState(result.gameState);
        }
      } catch {
        // handle error
      } finally {
        setActionPending(false);
      }
    },
    [],
  );

  const handleDealNext = useCallback(async () => {
    setLoading(true);
    setActionLog([]);
    try {
      const res = await fetch(`/api/sessions/${sessionIdRef.current}/hands/deal`, { method: 'POST' });
      if (res.ok) {
        const state: GameState = await res.json();
        setGameState(state);
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading || !gameState) {
    return <TableLoadingSkeleton />;
  }

  const winnerIds = gameState.result?.winners.map((w) => w.playerId) || [];

  return (
    <div className="flex flex-col h-screen bg-gray-950 select-none">
      {/* Top bar */}
      <HandInfoBar
        handNumber={gameState.handNumber}
        street={gameState.street}
        pot={gameState.pot}
        sidePots={gameState.sidePots}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Table area */}
      <div className="flex-1 relative overflow-hidden">
        <TableFelt communityCards={gameState.communityCards} />

        {/* Seats */}
        {gameState.seats.map((seat) => (
          <SeatComponent
            key={seat.seatIndex}
            seat={seat}
            isDealer={seat.seatIndex === gameState.dealerSeatIndex}
            isActive={seat.seatIndex === gameState.activeSeatIndex}
            isWinner={winnerIds.includes(seat.playerId)}
          />
        ))}

        {/* Winner banner */}
        {gameState.isHandComplete && gameState.result && (
          <WinnerBanner result={gameState.result} />
        )}

        {/* Deal next hand button */}
        {gameState.isHandComplete && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
            <button
              onClick={handleDealNext}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-colors"
            >
              发下一手牌
            </button>
          </div>
        )}

        {/* Confirm dialog */}
        {confirmDialog && (
          <ConfirmDialog
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(null)}
          />
        )}
      </div>

      {/* Action panel */}
      {gameState.isUserTurn && gameState.availableActions && !gameState.isHandComplete && (
        <ActionPanel
          actions={gameState.availableActions}
          onAction={handleAction}
          disabled={actionPending}
        />
      )}
    </div>
  );
}