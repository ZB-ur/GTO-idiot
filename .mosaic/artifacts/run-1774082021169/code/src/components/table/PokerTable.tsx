
import { useGame } from '../../contexts/GameContext';
import { PlayerSeat } from './PlayerSeat';
import { CommunityCards } from './CommunityCards';
import { PotDisplay } from './PotDisplay';
import { Spinner } from '../shared/Spinner';

/**
 * 6-max poker table layout. Players are positioned around an oval table.
 * Positions: [0]=top-left, [1]=top-right, [2]=right, [3]=bottom-right, [4]=bottom-left, [5]=left
 */
const SEAT_POSITIONS: readonly string[] = [
  'top-[5%] left-[25%]',      // seat 0
  'top-[5%] right-[25%]',     // seat 1
  'top-[40%] right-[3%]',     // seat 2
  'bottom-[5%] right-[25%]',  // seat 3
  'bottom-[5%] left-[25%]',   // seat 4
  'top-[40%] left-[3%]',      // seat 5
];

export function PokerTable() {
  const { state } = useGame();
  const { hand, session } = state;

  if (!hand || !session) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Map players to seat positions based on their index
  const userIndex = hand.players.findIndex(p => {
    const sp = session.players.find(s => s.id === p.playerId);
    return sp?.isUser;
  });

  // Reorder so user is always at bottom-left (seat 4)
  const reordered = hand.players.map((_, i) => {
    const idx = (i + userIndex - 4 + hand.players.length) % hand.players.length;
    return hand.players[idx]!;
  });

  return (
    <div className="relative mx-auto aspect-[16/10] w-full max-w-3xl">
      {/* Table oval */}
      <div className="absolute inset-[12%] rounded-[50%] border-4 border-felt-700 bg-felt-900 shadow-[inset_0_4px_30px_rgba(0,0,0,0.4)]" />

      {/* Center: community cards + pot */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <PotDisplay pot={hand.pot} sidePots={hand.sidePots} />
        <CommunityCards cards={hand.communityCards} animate />
      </div>

      {/* Player seats */}
      {reordered.map((player, i) => {
        const sessionPlayer = session.players.find(sp => sp.id === player.playerId);
        return (
          <div key={player.playerId} className={`absolute ${SEAT_POSITIONS[i]} -translate-x-1/2`}>
            <PlayerSeat
              player={player}
              isUser={sessionPlayer?.isUser ?? false}
              isDealer={player.position === hand.dealerPosition}
              isCurrentActor={player.playerId === hand.currentActorId}
              showCards={hand.phase === 'showdown' || hand.phase === 'complete'}
            />
          </div>
        );
      })}
    </div>
  );
}
