import React, { useMemo } from 'react';
import { PlayerSeat } from './PlayerSeat';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';
import { ActionPanel } from './ActionPanel';
import { GameTopBar } from './GameTopBar';
import { HandStrengthBadge } from './HandStrengthBadge';
import { HandResultToast } from './HandResultToast';

// --- Types ---

interface Card {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
}

interface PlayerState {
  seatIndex: number;
  position: 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';
  name?: string;
  stack: number;
  isActive: boolean;
  isBot: boolean;
  botStyle?: 'TAG' | 'LAG' | 'Fish' | 'Nit' | 'CallingStation';
  holeCards?: Card[];
  currentBet?: number;
  totalInvested?: number;
  hasActed?: boolean;
}

interface GameState {
  sessionId: string;
  handNumber: number;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  pot: number;
  sidePots?: { amount: number; eligibleSeatIndexes: number[] }[];
  communityCards: Card[];
  players: PlayerState[];
  dealerSeatIndex: number;
  currentPlayerIndex: number;
  isHandInProgress: boolean;
  isShowdown?: boolean;
  winners?: {
    seatIndex: number;
    amount: number;
    handRanking: string;
    handDescription: string;
  }[];
}

interface LegalAction {
  actionType: 'fold' | 'check' | 'call' | 'raise' | 'allIn';
  isAvailable: boolean;
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
}

interface LegalActionsResponse {
  seatIndex: number;
  position: string;
  actions: LegalAction[];
}

interface HandStrengthResponse {
  madeHand: string;
  handDescription: string;
  equityPercent: number;
  draws?: string[];
}

interface UserSettings {
  gameSpeed: 'fast' | 'normal' | 'slow';
  soundEnabled: boolean;
  handStrengthIndicatorEnabled: boolean;
  theme: 'light' | 'dark';
}

interface GameTableProps {
  gameState: GameState;
  legalActions?: LegalActionsResponse;
  handStrength?: HandStrengthResponse;
  settings: UserSettings;
  sessionProfit: number;
  onAction: (actionType: string, amount?: number) => void;
  onEndSession: () => void;
  onOpenSettings: () => void;
}

// --- Seat Layout ---

/** 6 seats positioned around an oval table (bottom = human player seat 0) */
const SEAT_POSITIONS: Record<number, { top: string; left: string; align: string }> = {
  0: { top: '78%', left: '50%', align: 'center' },   // bottom center (human)
  1: { top: '58%', left: '8%', align: 'left' },       // bottom-left
  2: { top: '18%', left: '8%', align: 'left' },       // top-left
  3: { top: '5%', left: '50%', align: 'center' },     // top center
  4: { top: '18%', left: '92%', align: 'right' },     // top-right
  5: { top: '58%', left: '92%', align: 'right' },     // bottom-right
};

const DEALER_BUTTON_OFFSETS: Record<number, { top: string; left: string }> = {
  0: { top: '70%', left: '56%' },
  1: { top: '52%', left: '16%' },
  2: { top: '24%', left: '16%' },
  3: { top: '14%', left: '46%' },
  4: { top: '24%', left: '84%' },
  5: { top: '52%', left: '84%' },
};

// --- Component ---

export const GameTable: React.FC<GameTableProps> = ({
  gameState,
  legalActions,
  handStrength,
  settings,
  sessionProfit,
  onAction,
  onEndSession,
  onOpenSettings,
}) => {
  const humanPlayer = gameState.players.find((p) => !p.isBot);
  const isHumanTurn = humanPlayer
    ? gameState.currentPlayerIndex === humanPlayer.seatIndex && gameState.isHandInProgress
    : false;

  const showHandStrength =
    settings.handStrengthIndicatorEnabled &&
    handStrength &&
    gameState.isHandInProgress &&
    humanPlayer?.isActive;

  const showResultToast = gameState.winners && gameState.winners.length > 0;

  const dealerPos = DEALER_BUTTON_OFFSETS[gameState.dealerSeatIndex] ?? { top: '50%', left: '50%' };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-50">
      {/* Top Bar */}
      <GameTopBar
        handNumber={gameState.handNumber}
        street={gameState.street}
        sessionProfit={sessionProfit}
        onEndSession={onEndSession}
        onOpenSettings={onOpenSettings}
      />

      {/* Table Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Felt Table */}
        <div className="absolute inset-8 lg:inset-12">
          <div
            className="relative w-full h-full rounded-[50%] bg-emerald-900 border-4 border-emerald-700 shadow-lg shadow-black/40"
            style={{
              background:
                'radial-gradient(ellipse at center, rgb(6 78 59 / 0.9) 0%, rgb(6 78 59) 100%)',
            }}
          >
            {/* Community Cards — center */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2">
              <CommunityCards cards={gameState.communityCards} />
            </div>

            {/* Pot Display — below community cards */}
            <div className="absolute top-[54%] left-1/2 -translate-x-1/2 -translate-y-1/2">
              <PotDisplay pot={gameState.pot} sidePots={gameState.sidePots} />
            </div>

            {/* Dealer Button */}
            {gameState.isHandInProgress && (
              <div
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{ top: dealerPos.top, left: dealerPos.left }}
              >
                <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-amber-300 flex items-center justify-center text-xs font-bold text-gray-900 shadow-md">
                  D
                </div>
              </div>
            )}

            {/* Player Seats */}
            {gameState.players.map((player) => {
              const pos = SEAT_POSITIONS[player.seatIndex];
              if (!pos) return null;
              return (
                <div
                  key={player.seatIndex}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <PlayerSeat
                    player={player}
                    isCurrentTurn={gameState.currentPlayerIndex === player.seatIndex && gameState.isHandInProgress}
                    isDealer={gameState.dealerSeatIndex === player.seatIndex}
                    winner={gameState.winners?.find((w) => w.seatIndex === player.seatIndex)}
                  />
                </div>
              );
            })}

            {/* Hand Strength Badge — near human player */}
            {showHandStrength && handStrength && (
              <div className="absolute bottom-[28%] left-1/2 -translate-x-1/2 z-20">
                <HandStrengthBadge
                  madeHand={handStrength.madeHand}
                  handDescription={handStrength.handDescription}
                  equityPercent={handStrength.equityPercent}
                  draws={handStrength.draws}
                />
              </div>
            )}
          </div>
        </div>

        {/* Hand Result Toast */}
        {showResultToast && gameState.winners && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
            <HandResultToast winners={gameState.winners} players={gameState.players} />
          </div>
        )}
      </div>

      {/* Action Panel — anchored bottom */}
      {isHumanTurn && legalActions && (
        <div className="shrink-0">
          <ActionPanel
            legalActions={legalActions}
            pot={gameState.pot}
            playerStack={humanPlayer?.stack ?? 0}
            onAction={onAction}
          />
        </div>
      )}

      {/* Waiting indicator when not human's turn */}
      {gameState.isHandInProgress && !isHumanTurn && !showResultToast && (
        <div className="shrink-0 py-4 flex justify-center">
          <span className="text-sm text-gray-500 animate-pulse">Waiting for opponent…</span>
        </div>
      )}

      {/* Deal prompt between hands */}
      {!gameState.isHandInProgress && !showResultToast && (
        <div className="shrink-0 py-4 flex justify-center">
          <button
            onClick={() => onAction('deal')}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-gray-900 font-bold rounded-lg shadow-lg shadow-black/40 transition-colors"
          >
            Deal New Hand
          </button>
        </div>
      )}
    </div>
  );
};

export default GameTable;