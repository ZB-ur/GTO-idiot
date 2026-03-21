
import type { HandPlayerState } from '../../types/game';
import { CardComponent } from './CardComponent';
import { ChipStack } from './ChipStack';

interface PlayerSeatProps {
  readonly player: HandPlayerState;
  readonly isUser: boolean;
  readonly isDealer: boolean;
  readonly isCurrentActor: boolean;
  readonly showCards?: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  fold: 'Fold',
  check: 'Check',
  call: 'Call',
  raise: 'Raise',
  all_in: 'All-In',
};

export function PlayerSeat({ player, isUser, isDealer, isCurrentActor, showCards = false }: PlayerSeatProps) {
  const isFolded = player.isFolded;
  const hasCards = isUser || showCards;

  return (
    <div
      className={`flex flex-col items-center gap-1 transition-opacity ${
        isFolded ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {/* Cards */}
      <div className="flex gap-0.5">
        {hasCards && player.holeCards ? (
          <>
            <CardComponent card={player.holeCards.card1} size="sm" />
            <CardComponent card={player.holeCards.card2} size="sm" />
          </>
        ) : !isFolded ? (
          <>
            <CardComponent faceDown size="sm" />
            <CardComponent faceDown size="sm" />
          </>
        ) : null}
      </div>

      {/* Player info box */}
      <div
        className={`relative flex min-w-[5rem] flex-col items-center rounded-lg border px-2 py-1.5 ${
          isCurrentActor
            ? 'border-yellow-400 bg-gray-800 shadow-[0_0_8px_rgba(250,204,21,0.3)]'
            : isUser
            ? 'border-felt-500 bg-gray-800'
            : 'border-gray-600 bg-gray-800/80'
        }`}
      >
        {/* Dealer button */}
        {isDealer && (
          <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-gray-900 shadow">
            D
          </div>
        )}

        {/* Name */}
        <span className={`text-xs font-medium ${isUser ? 'text-felt-400' : 'text-gray-300'}`}>
          {player.name}
        </span>

        {/* Position */}
        <span className="text-[10px] text-gray-500">{player.position}</span>

        {/* Stack */}
        <span className="font-mono text-xs text-gray-200">{player.stack.toFixed(1)} BB</span>

        {/* Last action */}
        {player.lastAction && !isFolded && (
          <span className={`mt-0.5 text-[10px] font-semibold ${
            player.lastAction === 'all_in' ? 'text-red-400' :
            player.lastAction === 'raise' ? 'text-yellow-300' :
            player.lastAction === 'call' ? 'text-blue-300' :
            'text-gray-400'
          }`}>
            {ACTION_LABELS[player.lastAction]}
            {player.currentBet > 0 ? ` ${player.currentBet.toFixed(1)}` : ''}
          </span>
        )}

        {player.isAllIn && (
          <span className="mt-0.5 rounded bg-red-600 px-1 text-[10px] font-bold text-white">ALL IN</span>
        )}
      </div>

      {/* Current bet chip */}
      {player.currentBet > 0 && !isFolded && (
        <ChipStack amount={player.currentBet} size="sm" />
      )}
    </div>
  );
}
